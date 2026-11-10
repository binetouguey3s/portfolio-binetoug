"""
Génère la base de connaissances de Binetou IA.

    python manage.py construire_base_chatbot             # écrit chatbot/data/base-connaissances-chatbot.md
    python manage.py construire_base_chatbot --verifier  # échoue si le fichier n'est pas à jour

Assemble content/base-connaissances-chatbot.md (consignes et présentation) et
content/contenu.json (projets, compétences, méthode, contact, outils) en un seul texte.
À relancer après chaque modification de content/ (et à chaque déploiement).
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

        tokens = estimer_tokens(texte)
        if tokens > TOKENS_BASE_MAX:
            raise CommandError(
                f"Base trop longue : ~{tokens} tokens pour {TOKENS_BASE_MAX} maximum. "
                "Raccourcissez content/base-connaissances-chatbot.md."
            )

        if verifier:
            if actuel != texte:
                raise CommandError(
                    "La base du chatbot n'est pas à jour : lancez « python manage.py construire_base_chatbot »."
                )
            self.stdout.write(self.style.SUCCESS(f"Base du chatbot à jour (~{tokens} tokens)."))
            return

        cible.parent.mkdir(parents=True, exist_ok=True)
        cible.write_text(texte, encoding="utf-8")
        message_systeme.cache_clear()
        etat = "inchangée" if actuel == texte else "mise à jour"
        self.stdout.write(self.style.SUCCESS(f"Base du chatbot {etat} : {cible} (~{tokens} tokens)."))
