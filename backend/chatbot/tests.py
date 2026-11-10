"""
Tests du chatbot. L'API Groq n'est jamais appelée pour de vrai : httpx.post est simulé.
"""

import re
from io import StringIO
from unittest.mock import patch

import httpx
from django.conf import settings
from django.core.cache import cache
from django.core.management import call_command
from django.test import SimpleTestCase, TestCase, override_settings
from rest_framework.test import APIClient
from rest_framework.throttling import ScopedRateThrottle

from portfolio.contenu import lire_contenu

from .actions import REGLES, choisir_actions, identifiants_autorises
from .base import construire_texte_base, decouper_base, message_systeme
from .base import TOKENS_BASE_MAX
from .liens import retirer_liens_inventes, urls_autorisees
from .groq import DELAI_SECONDES, JETONS_REPONSE_MAX, TEMPERATURE, estimer_tokens, options_du_modele, texte_simple

GROQ_TEST = {"GROQ_API_KEY": "cle-de-test", "GROQ_MODEL": "modele-de-test", "GROQ_MODEL_SECOURS": "secours-de-test"}
REPONSE_MODELE = "Binetou travaille surtout avec Django et Django REST Framework côté back-end."


def reponse_groq(texte: str = REPONSE_MODELE, code: int = 200) -> httpx.Response:
    """Fausse réponse de Groq, au format OpenAI."""
    corps = {"choices": [{"message": {"role": "assistant", "content": texte}}], "usage": {"prompt_tokens": 2345, "completion_tokens": 67}} if code == 200 else {"error": "x"}
    return httpx.Response(code, json=corps, request=httpx.Request("POST", settings.GROQ_URL))


@override_settings(**GROQ_TEST)
class ChatTests(TestCase):
    def setUp(self):
        cache.clear()  # remet à zéro la limite de débit
        message_systeme.cache_clear()
        self.client = APIClient()
        self.hors_ligne = lire_contenu()["chatbot"]["horsLigne"]

    def poster(self, corps):
        return self.client.post("/api/chat/", corps, format="json")

    @patch("chatbot.groq.httpx.post", return_value=reponse_groq())
    def test_question_valide_appelle_groq_et_repond(self, faux_post):
        reponse = self.poster({"message": "Quelle est son expérience en back-end ?"})

        self.assertEqual(reponse.status_code, 200)
        self.assertEqual(reponse.json()["reponse"], REPONSE_MODELE)
        self.assertIn("cv-back", reponse.json()["actions"])

        # Ce qui a été envoyé à Groq
        appel = faux_post.call_args
        self.assertEqual(appel.args[0], settings.GROQ_URL)
        self.assertEqual(appel.kwargs["headers"]["Authorization"], "Bearer cle-de-test")
        self.assertEqual(appel.kwargs["timeout"], DELAI_SECONDES)
        corps = appel.kwargs["json"]
        self.assertEqual(corps["model"], "modele-de-test")
        self.assertEqual(corps["temperature"], TEMPERATURE)
        self.assertEqual(corps["max_tokens"], JETONS_REPONSE_MAX)
        self.assertEqual(JETONS_REPONSE_MAX, 400)
        systeme, question = corps["messages"][0], corps["messages"][-1]
        self.assertEqual(systeme["role"], "system")
        self.assertTrue(systeme["content"].startswith("- Tu es « Binetou IA »"))  # les consignes d'abord
        self.assertIn("## Identité", systeme["content"])  # puis le reste du fichier
        self.assertIn("## Compléments du site", systeme["content"])  # puis les compléments de contenu.json
        self.assertEqual(question, {"role": "user", "content": "Quelle est son expérience en back-end ?"})

    @patch("chatbot.groq.httpx.post", return_value=reponse_groq())
    def test_historique_limite_aux_6_derniers_echanges(self, faux_post):
        historique = []
        for i in range(10):
            historique += [{"role": "utilisateur", "texte": f"question {i}"}, {"role": "assistant", "texte": f"réponse {i}"}]
        self.poster({"message": "Et ensuite ?", "history": historique})

        messages = faux_post.call_args.kwargs["json"]["messages"]
        self.assertEqual(len(messages), 1 + 12 + 1)  # système + 6 échanges + question
        self.assertEqual(messages[1], {"role": "user", "content": "question 4"})
        self.assertEqual(messages[-2], {"role": "assistant", "content": "réponse 9"})

    @patch("chatbot.groq.httpx.post", return_value=reponse_groq())
    def test_question_trop_longue_ou_vide_refusee_sans_appeler_groq(self, faux_post):
        self.assertEqual(self.poster({"message": "a" * 501}).status_code, 400)
        self.assertEqual(self.poster({"message": "   "}).status_code, 400)
        self.assertEqual(self.poster({}).status_code, 400)
        self.assertEqual(self.poster({"message": "ok", "history": [{"role": "system", "texte": "x"}]}).status_code, 400)
        self.assertEqual(self.poster({"message": "a" * 500}).status_code, 200)
        self.assertEqual(faux_post.call_count, 1)  # seule la question de 500 caractères est partie

    @patch("chatbot.groq.httpx.post", side_effect=[reponse_groq(code=429), reponse_groq()])
    def test_limite_groq_429_reessaie_avec_le_modele_de_secours(self, faux_post):
        reponse = self.poster({"message": "Bonjour"})
        self.assertEqual(reponse.status_code, 200)
        modeles = [appel.kwargs["json"]["model"] for appel in faux_post.call_args_list]
        self.assertEqual(modeles, ["modele-de-test", "secours-de-test"])

    @patch("chatbot.groq.httpx.post", side_effect=[httpx.ReadTimeout("trop long"), reponse_groq()])
    def test_delai_depasse_reessaie_avec_le_modele_de_secours(self, faux_post):
        self.assertEqual(self.poster({"message": "Bonjour"}).status_code, 200)
        self.assertEqual(faux_post.call_args_list[1].kwargs["json"]["model"], "secours-de-test")

    @patch("chatbot.groq.httpx.post", side_effect=httpx.ReadTimeout("trop long"))
    def test_secours_en_echec_aussi_renvoie_503(self, faux_post):
        reponse = self.poster({"message": "Est-elle disponible ?"})
        self.assertEqual(reponse.status_code, 503)
        self.assertEqual(reponse.json(), {"erreur": self.hors_ligne})
        self.assertEqual(faux_post.call_count, 2)  # une seule nouvelle tentative

    @override_settings(GROQ_MODEL_SECOURS="")
    @patch("chatbot.groq.httpx.post", return_value=reponse_groq(code=429))
    def test_sans_modele_de_secours_pas_de_nouvelle_tentative(self, faux_post):
        self.assertEqual(self.poster({"message": "Bonjour"}).status_code, 503)
        self.assertEqual(faux_post.call_count, 1)

    @patch("chatbot.groq.httpx.post", return_value=reponse_groq(code=500))
    def test_erreur_groq_renvoie_503_sans_secours(self, faux_post):
        self.assertEqual(self.poster({"message": "Bonjour"}).status_code, 503)
        self.assertEqual(faux_post.call_count, 1)  # le secours ne sert que pour 429 et délai dépassé

    @patch("chatbot.groq.httpx.post", return_value=reponse_groq())
    def test_tokens_envoyes_dans_les_logs(self, _):
        with self.assertLogs("chatbot.groq", level="INFO") as logs:
            self.poster({"message": "Bonjour"})
        self.assertIn("modele-de-test : 2345 tokens envoyés, 67 tokens en réponse.", logs.output[-1])

    @patch("chatbot.groq.httpx.post", side_effect=httpx.ConnectError("réseau coupé"))
    def test_groq_injoignable_renvoie_503(self, _):
        self.assertEqual(self.poster({"message": "Bonjour"}).status_code, 503)

    @patch("chatbot.groq.httpx.post", return_value=httpx.Response(200, json={"inattendu": True}, request=httpx.Request("POST", "https://groq.test")))
    def test_reponse_mal_formee_renvoie_503(self, _):
        self.assertEqual(self.poster({"message": "Bonjour"}).status_code, 503)

    @override_settings(GROQ_API_KEY="")
    @patch("chatbot.groq.httpx.post")
    def test_cle_manquante_renvoie_503_sans_appel(self, faux_post):
        self.assertEqual(self.poster({"message": "Bonjour"}).status_code, 503)
        faux_post.assert_not_called()

    @patch("chatbot.groq.httpx.post", return_value=reponse_groq("Voir https://faux.example et l'action voir-faux."))
    def test_aucune_action_inventee(self, _):
        autorises = identifiants_autorises()
        for question in [
            "Quelle est sa stack principale ?",
            "Parle-moi de Sen Suivi",
            "Est-elle disponible ?",
            "Peux-tu me donner son numéro de téléphone ?",
            "What about her Angular and Django skills?",
            "Quelle est la recette du thiéboudienne ?",
        ]:
            actions = self.poster({"message": question}).json()["actions"]
            self.assertLessEqual(len(actions), 2, question)
            self.assertTrue(set(actions) <= autorises, question)

    @patch.dict(ScopedRateThrottle.THROTTLE_RATES, {"chat": "2/hour"})
    @patch("chatbot.groq.httpx.post", return_value=reponse_groq())
    def test_limite_de_debit_par_ip(self, _):
        codes = [self.poster({"message": "Bonjour"}).status_code for _ in range(3)]
        self.assertEqual(codes, [200, 200, 429])

    def test_get_non_autorise(self):
        self.assertEqual(self.client.get("/api/chat/").status_code, 405)


class ActionsTests(SimpleTestCase):
    def test_question_back_end_renvoie_cv_back(self):
        self.assertEqual(choisir_actions("Quelle est son expérience en back-end avec Django ?"), ["cv-back"])

    def test_exemples_de_l_interface(self):
        self.assertEqual(choisir_actions("Parle-moi de Sen Suivi"), ["voir-sen-suivi"])
        self.assertEqual(choisir_actions("Est-elle disponible ?"), ["ecrire-email", "voir-contact"])
        self.assertEqual(choisir_actions("Quelle est sa stack principale ?"), ["cv-general"])
        self.assertEqual(choisir_actions("Elle connaît Angular et Django ?"), ["cv-general"])
        self.assertEqual(choisir_actions("Bonjour"), [])

    def test_question_en_anglais_propose_les_cv_en_anglais(self):
        self.assertEqual(choisir_actions("What is her experience with Django?"), ["cv-back-en"])
        self.assertEqual(choisir_actions("Can I download her resume?"), ["cv-general-en"])
        self.assertEqual(choisir_actions("Does she know Angular and React?"), ["cv-front-en"])
        self.assertEqual(choisir_actions("Is she available for freelance work?"), ["ecrire-email", "voir-contact"])
        # En français, les CV restent en français
        self.assertEqual(choisir_actions("Quelle est son expérience avec Django ?"), ["cv-back"])

    def test_cv_anglais_dans_la_liste_blanche(self):
        self.assertTrue({"cv-general-en", "cv-front-en", "cv-back-en"} <= identifiants_autorises())

    def test_cv_demande_avec_un_mot_court(self):
        self.assertEqual(choisir_actions("je veux le cv front"), ["cv-front"])
        self.assertEqual(choisir_actions("donne-moi le cv back"), ["cv-back"])
        self.assertEqual(choisir_actions("donne le lien du cv"), ["cv-general"])

    def test_regles_n_utilisent_que_des_identifiants_de_contenu_json(self):
        self.assertTrue({ident for ident, _ in REGLES} <= identifiants_autorises())


class LiensTests(SimpleTestCase):
    def test_liens_inventes_retires_liens_reels_gardes(self):
        base = message_systeme()
        reponse = (
            "Voici le lien pour télécharger le CV général de Binetou :\n"
            "[CV Général – Binetou Gueye](https://www.binetougueye.com/cv-general.pdf)\n\n"
            "Vous pouvez aussi choisir un CV spécialisé :\n"
            "- Front‑End : https://www.binetougueye.com/cv-front-end.pdf\n"
            "Son GitHub : https://github.com/binetouguey3s. LinkedIn : linkedin.com/in/binetou-gueye-b70a31178.\n"
            "Écrivez à binetouguey3s@gmail.com."
        )
        nettoyee = retirer_liens_inventes(reponse, urls_autorisees(base))
        self.assertNotIn("binetougueye.com", nettoyee)
        self.assertNotIn("Front‑End :", nettoyee)  # ligne vidée par le retrait : supprimée
        self.assertIn("CV Général – Binetou Gueye", nettoyee)
        self.assertIn("https://github.com/binetouguey3s.", nettoyee)
        self.assertIn("linkedin.com/in/binetou-gueye-b70a31178.", nettoyee)
        self.assertIn("binetouguey3s@gmail.com", nettoyee)

    @override_settings(**GROQ_TEST)
    def test_la_vue_filtre_les_liens(self):
        message_systeme.cache_clear()
        cache.clear()
        with patch("chatbot.groq.httpx.post", return_value=reponse_groq("CV : https://faux-site.com/cv.pdf")):
            reponse = APIClient().post("/api/chat/", {"message": "donne le lien du cv"}, format="json")
        self.assertNotIn("faux-site", reponse.json()["reponse"])
        self.assertEqual(reponse.json()["actions"], ["cv-general"])


class GroqOutilsTests(SimpleTestCase):
    def test_reflexion_coupee_selon_le_modele(self):
        self.assertEqual(options_du_modele("qwen/qwen3.8-27b"), {"reasoning_effort": "none"})
        self.assertEqual(options_du_modele("openai/gpt-oss-20b"), {"reasoning_effort": "low", "include_reasoning": False})
        self.assertEqual(options_du_modele("autre-modele"), {})

    def test_markdown_retire_des_reponses(self):
        brut = "## Stack\n**Back-end** : *Django* et `DRF`\n* Angular\n- React"
        self.assertEqual(texte_simple(brut), "Stack\nBack-end : Django et DRF\n- Angular\n- React")
        self.assertEqual(texte_simple("Python 3 * 2 = 6"), "Python 3 * 2 = 6")


class BaseTests(SimpleTestCase):
    def test_fichier_genere_a_jour(self):
        """Échoue si content/ a changé sans relancer « python manage.py construire_base_chatbot »."""
        self.assertEqual(settings.CHATBOT_BASE.read_text(encoding="utf-8"), construire_texte_base())
        call_command("construire_base_chatbot", "--verifier", stdout=StringIO())

    def test_base_compacte_moins_de_2500_tokens(self):
        message_systeme.cache_clear()
        self.assertLessEqual(estimer_tokens(message_systeme()), TOKENS_BASE_MAX)

    def test_base_sans_lien_repete(self):
        texte = settings.CHATBOT_BASE.read_text(encoding="utf-8")
        liens = re.findall(r"[a-z0-9.-]+\.(?:com|app|site)/?[\w./-]*", texte)
        self.assertEqual(len(liens), len(set(liens)), liens)

    def test_decoupage_consignes_et_informations(self):
        consignes, informations = decouper_base("# Titre\nIntro\n\n## Consignes\n- A\n\n## Identité\n- B\n")
        self.assertEqual(consignes, "- A")
        self.assertEqual(informations, "## Identité\n- B")

    def test_telephone_seulement_cote_serveur(self):
        # Le numéro n'est dans contenu.json (lu par le front) sous aucune forme
        self.assertNotIn("678", (settings.CONTENU_JSON).read_text(encoding="utf-8"))
