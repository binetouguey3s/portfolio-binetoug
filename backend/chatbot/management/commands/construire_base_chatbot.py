"""
Prépare les fichiers de content/ utilisés par le back-end en production.

    python manage.py construire_base_chatbot             # écrit les deux fichiers ci-dessous
    python manage.py construire_base_chatbot --verifier  # échoue si l'un d'eux n'est pas à jour

1. chatbot/data/base-connaissances-chatbot.md : assemble content/base-connaissances-chatbot.md
   (consignes et présentation) et content/contenu.json (projets, compétences, méthode…).
2. portfolio/data/contenu.json : copie exacte de content/contenu.json (sur Vercel, seul backend/
   est déployé : le profil, les messages du formulaire et les actions du chatbot y sont lus).

À relancer après chaque modification de content/, avant de pousser sur GitHub.
"""

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError

from chatbot.base import TOKENS_BASE_MAX, construire_texte_base, message_systeme
from chatbot.groq import estimer_tokens


class Command(BaseCommand):
    help = "Génère chatbot/data/base-connaissances-chatbot.md depuis content/."

    def add_arguments(self, parser):
        parser.add_argument(
            "--verifier",
            action="store_true",
            help="N'écrit rien : vérifie seulement que le fichier généré est à jour.",
        )

    def handle(self, *args, verifier: bool = False, **options):
        texte = construire_texte_base()
        cible = settings.CHATBOT_BASE
        actuel = cible.read_text(encoding="utf-8") if cible.exists() else None
        contenu = settings.CONTENU_JSON_SOURCE.read_text(encoding="utf-8")
        copie = settings.CONTENU_JSON_COPIE
        copie_actuelle = copie.read_text(encoding="utf-8") if copie.exists() else None

        tokens = estimer_tokens(texte)
        if tokens > TOKENS_BASE_MAX:
            raise CommandError(
                f"Base trop longue : ~{tokens} tokens pour {TOKENS_BASE_MAX} maximum. "
                "Raccourcissez content/base-connaissances-chatbot.md."
            )

        if verifier:
            if actuel != texte or copie_actuelle != contenu:
                raise CommandError(
                    "La base du chatbot ou la copie de contenu.json n'est pas à jour : "
                    "lancez « python manage.py construire_base_chatbot »."
                )
            self.stdout.write(self.style.SUCCESS(f"Base du chatbot à jour (~{tokens} tokens)."))
            return

        cible.parent.mkdir(parents=True, exist_ok=True)
        cible.write_text(texte, encoding="utf-8")
        message_systeme.cache_clear()
        copie.parent.mkdir(parents=True, exist_ok=True)
        copie.write_text(contenu, encoding="utf-8")
        self.stdout.write(f"Copie de contenu.json {'inchangée' if copie_actuelle == contenu else 'mise à jour'} : {copie}")
        etat = "inchangée" if actuel == texte else "mise à jour"
        self.stdout.write(self.style.SUCCESS(f"Base du chatbot {etat} : {cible} (~{tokens} tokens)."))
