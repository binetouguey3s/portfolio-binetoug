"""
Charge les projets de content/contenu.json dans la base.

    python manage.py charger_projets            # crée ou met à jour (par nom)
    python manage.py charger_projets --purger   # supprime aussi les projets absents du JSON

Relançable sans risque : aucun doublon n'est créé.
"""

from django.core.management.base import BaseCommand
from django.db import transaction

from portfolio.contenu import lien_valide, lire_contenu
from portfolio.models import Project


class Command(BaseCommand):
    help = "Charge les projets (vedette + galerie) depuis content/contenu.json."

    def add_arguments(self, parser):
        parser.add_argument(
            "--purger",
            action="store_true",
            help="Supprime les projets de la base qui ne sont plus dans contenu.json.",
        )

    @transaction.atomic
    def handle(self, *args, purger: bool = False, **options):
        lire_contenu.cache_clear()
        projets = lire_contenu()["projets"]
        vedette = projets["vedette"]

        a_charger = [
            {
                "nom": vedette["nom"],
                "ordre": 0,
                "meta": vedette["role"],
                "domaine": vedette["badge"],
                "description": vedette["description"],
                "stack": vedette["stack"],
                "lien": vedette["lienApplication"] if lien_valide(vedette["lienApplication"]) else "",
                "label_lien": vedette.get("boutonApplication", ""),
                "vedette": True,
            }
        ]
        for projet in projets["galerie"]:
            url = projet["lien"]["url"]
            a_charger.append(
                {
                    "nom": projet["nom"],
                    "ordre": int(projet["num"]),
                    "meta": projet["meta"],
                    "domaine": projet["domaine"],
                    "description": projet["description"],
                    "stack": projet["stack"],
                    "lien": url if lien_valide(url) else "",
                    "label_lien": projet["lien"]["label"],
                    "vedette": False,
                }
            )

        crees = mis_a_jour = 0
        for donnees in a_charger:
            nom = donnees.pop("nom")
            _, cree = Project.objects.update_or_create(nom=nom, defaults=donnees)
            crees += cree
            mis_a_jour += not cree

        supprimes = 0
        if purger:
            noms = [p["nom"] for p in projets["galerie"]] + [vedette["nom"]]
            supprimes, _ = Project.objects.exclude(nom__in=noms).delete()

        self.stdout.write(
            self.style.SUCCESS(
                f"Projets : {crees} créé(s), {mis_a_jour} mis à jour"
                + (f", {supprimes} supprimé(s)" if purger else "")
                + "."
            )
        )
