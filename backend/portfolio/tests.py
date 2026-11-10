from io import StringIO
from unittest.mock import patch

from django.core.cache import cache
from django.core.management import call_command
from django.test import TestCase, override_settings
from rest_framework.test import APIClient
from rest_framework.throttling import ScopedRateThrottle

from .contenu import lire_contenu
from .models import ContactMessage, Project

MESSAGE_VALIDE = {
    "nom": "Awa Diop",
    "email": "awa@exemple.sn",
    "message": "Bonjour, je souhaite échanger sur un poste.",
}


class SanteTests(TestCase):
    def test_sante_repond_ok(self):
        reponse = APIClient().get("/api/sante/")
        self.assertEqual(reponse.status_code, 200)
        self.assertEqual(reponse.json(), {"statut": "ok", "base": "ok"})


class ProfilTests(TestCase):
    def test_profil_identique_a_contenu_json(self):
        reponse = APIClient().get("/api/profil/")
        self.assertEqual(reponse.status_code, 200)
        self.assertEqual(reponse.json(), lire_contenu()["profilApi"])

    def test_profil_ne_contient_pas_de_telephone(self):
        texte = APIClient().get("/api/profil/").content.decode()
        self.assertNotIn("678", texte)


class ProjetsTests(TestCase):
    def test_liste_vide_au_depart(self):
        reponse = APIClient().get("/api/projets/")
        self.assertEqual(reponse.status_code, 200)
        self.assertEqual(reponse.json(), [])

    def test_charger_projets_puis_lister_dans_l_ordre(self):
        call_command("charger_projets", stdout=StringIO())
        galerie = lire_contenu()["projets"]["galerie"]
        self.assertEqual(Project.objects.count(), len(galerie) + 1)  # + la vedette

        donnees = APIClient().get("/api/projets/").json()
        self.assertTrue(donnees[0]["vedette"])
        self.assertEqual(donnees[0]["nom"], "Sen Suivi")
        # Même forme que projets.galerie de contenu.json
        premier = donnees[1]
        self.assertEqual(premier["num"], galerie[0]["num"])
        self.assertEqual(premier["nom"], galerie[0]["nom"])
        self.assertEqual(premier["lien"], galerie[0]["lien"])
        self.assertEqual(premier["stack"], galerie[0]["stack"])

    def test_charger_projets_est_relancable_sans_doublon(self):
        call_command("charger_projets", stdout=StringIO())
        call_command("charger_projets", stdout=StringIO())
        self.assertEqual(Project.objects.count(), len(lire_contenu()["projets"]["galerie"]) + 1)

    def test_lien_a_completer_ou_vide_n_est_pas_charge(self):
        call_command("charger_projets", stdout=StringIO())
        vedette = Project.objects.get(vedette=True)
        self.assertEqual(vedette.lien, "")  # lienApplication vaut A_COMPLETER
        self.assertEqual(Project.objects.get(nom="JOJ Dakar 2026").lien, "")

    def test_purger_supprime_les_projets_absents_du_json(self):
        Project.objects.create(nom="Ancien projet", description="—")
        call_command("charger_projets", "--purger", stdout=StringIO())
        self.assertFalse(Project.objects.filter(nom="Ancien projet").exists())


class CopieContenuTests(TestCase):
    def test_copie_de_contenu_json_a_jour(self):
        """Échoue si content/contenu.json a changé sans relancer « python manage.py construire_base_chatbot »."""
        from django.conf import settings

        self.assertEqual(
            settings.CONTENU_JSON_COPIE.read_text(encoding="utf-8"),
            settings.CONTENU_JSON_SOURCE.read_text(encoding="utf-8"),
        )


class ContactTests(TestCase):
    def setUp(self):
        cache.clear()  # remet à zéro la limite de débit
        self.client = APIClient()
        self.erreurs = lire_contenu()["contact"]["formulaire"]["erreurs"]

    def test_message_valide_enregistre(self):
        reponse = self.client.post("/api/contact/", MESSAGE_VALIDE, format="json")
        self.assertEqual(reponse.status_code, 201)
        self.assertEqual(ContactMessage.objects.count(), 1)
        self.assertFalse(ContactMessage.objects.get().lu)

    def test_champs_manquants_avec_nos_messages(self):
        reponse = self.client.post("/api/contact/", {}, format="json")
        self.assertEqual(reponse.status_code, 400)
        erreurs = reponse.json()["erreurs"]
        self.assertEqual(erreurs["nom"], [self.erreurs["nomRequis"]])
        self.assertEqual(erreurs["email"], [self.erreurs["emailRequis"]])
        self.assertEqual(erreurs["message"], [self.erreurs["messageRequis"]])
        self.assertEqual(ContactMessage.objects.count(), 0)

    def test_valeurs_trop_courtes_ou_email_invalide(self):
        reponse = self.client.post(
            "/api/contact/", {"nom": "A", "email": "pas-un-email", "message": "court"}, format="json"
        )
        self.assertEqual(reponse.status_code, 400)
        erreurs = reponse.json()["erreurs"]
        self.assertEqual(erreurs["nom"], [self.erreurs["nomCourt"]])
        self.assertEqual(erreurs["email"], [self.erreurs["emailInvalide"]])
        self.assertEqual(erreurs["message"], [self.erreurs["messageCourt"]])

    def test_champ_piege_rempli_rien_n_est_enregistre(self):
        reponse = self.client.post(
            "/api/contact/", {**MESSAGE_VALIDE, "site_web": "http://spam.example"}, format="json"
        )
        self.assertEqual(reponse.status_code, 201)  # le robot croit avoir réussi
        self.assertEqual(ContactMessage.objects.count(), 0)

    @patch.dict(ScopedRateThrottle.THROTTLE_RATES, {"contact": "2/hour"})
    def test_limite_de_debit(self):
        codes = [self.client.post("/api/contact/", MESSAGE_VALIDE, format="json").status_code for _ in range(3)]
        self.assertEqual(codes, [201, 201, 429])

    @override_settings(
        CONTACT_NOTIFY_EMAIL="binetou@exemple.sn",
        EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend",
    )
    def test_notification_email_si_configuree(self):
        from django.core import mail

        self.client.post("/api/contact/", MESSAGE_VALIDE, format="json")
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn("Awa Diop", mail.outbox[0].subject)

    @override_settings(CONTACT_NOTIFY_EMAIL="binetou@exemple.sn")
    @patch("portfolio.views.send_mail", side_effect=UnicodeEncodeError("ascii", "←", 0, 1, "mot de passe invalide"))
    def test_email_en_echec_le_message_est_quand_meme_enregistre(self, _):
        with self.assertLogs("portfolio.views", level="ERROR"):
            reponse = self.client.post("/api/contact/", MESSAGE_VALIDE, format="json")
        self.assertEqual(reponse.status_code, 201)
        self.assertEqual(ContactMessage.objects.count(), 1)

    def test_get_non_autorise(self):
        self.assertEqual(self.client.get("/api/contact/").status_code, 405)
