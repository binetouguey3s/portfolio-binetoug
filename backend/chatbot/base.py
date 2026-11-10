"""
Base de connaissances de Binetou IA.

- construire_texte_base() assemble les deux sources (content/base-connaissances-chatbot.md
  et content/contenu.json) en un seul texte. Utilisée par la commande construire_base_chatbot,
  qui écrit le résultat dans chatbot/data/base-connaissances-chatbot.md.
- message_systeme() lit ce fichier généré et construit le message système envoyé au modèle :
  d'abord la section « Consignes », puis le reste du fichier comme seule source d'information.
"""

import json
import re
import unicodedata
from functools import lru_cache
from typing import Any

from django.conf import settings

from portfolio.contenu import lien_valide

TITRE_COMPLEMENTS = "## Compléments du site (générés depuis contenu.json)"
# Budget du message système (offre gratuite de Groq : tokens limités par jour)
TOKENS_BASE_MAX = 2500


class BaseIndisponible(Exception):
    """Le fichier de la base est absent ou mal formé."""


# --- Construction (commande construire_base_chatbot) ---------------------------------
# La base = le fichier rédigé par Binetou (allégé de sa mise en forme), puis seulement
# les informations de contenu.json qui n'y sont PAS déjà, en faits courts.


def _cle(texte: str) -> str:
    """Forme comparable : minuscules, sans accents ni ponctuation."""
    sans_accents = unicodedata.normalize("NFKD", texte).encode("ascii", "ignore").decode().lower()
    return re.sub(r"[^a-z0-9]+", " ", sans_accents).strip()


def _url_courte(url: str) -> str:
    return re.sub(r"^https?://(www\.)?", "", url).rstrip("/")


def _source_allegee(source: str) -> str:
    """Retire le titre, l'introduction (destinés aux humains) et le gras ; resserre les lignes vides."""
    debut = re.search(r"^## ", source, re.MULTILINE)
    texte = source[debut.start() :] if debut else source
    texte = texte.replace("**", "")
    texte = re.sub(r"[ \t]+$", "", texte, flags=re.MULTILINE)
    return re.sub(r"\n{3,}", "\n\n", texte).strip()


def _complements(c: dict[str, Any], deja: str) -> list[str]:
    """Faits de contenu.json absents du fichier de Binetou (« deja » = sa forme comparable)."""
    projets = c["projets"]
    vedette = projets["vedette"]
    faits: list[str] = []

    # Chiffres sans détail (« 10 projets conçus et livrés ») : ceux avec détail (« Startup fondée : … »,
    # « Langues : … ») répètent des informations déjà présentes dans le fichier de Binetou
    chiffres = [f"{ch['valeur']} {ch['libelle'].lower()}" for ch in c["chiffres"] if ch["valeur"].isdigit() and " : " not in ch["libelle"]]
    if chiffres:
        faits.append(f"Chiffres du site : {', '.join(chiffres)}.")

    application = (
        f"application : {_url_courte(vedette['lienApplication'])}"
        if lien_valide(vedette["lienApplication"])
        else "lien de l'application pas encore public, vidéo de présentation sur le site"
    )
    faits.append(f"{vedette['nom']} : devise {vedette['devise']} ; {application}.")

    tous = [(p["nom"], p["description"], p["lien"]["url"]) for p in projets["galerie"]]
    tous += [(a["nom"], a["detail"], a.get("url", "")) for a in projets["autres"]]
    # Projets absents du fichier de Binetou : nom, détail et lien sur une seule ligne (pas de nom répété)
    absents = [(nom, detail, url) for nom, detail, url in tous if _cle(nom) not in deja]
    if absents:
        faits.append(
            "Autres projets : "
            + " ; ".join(f"{n} ({d.rstrip('.')})" + (f" {_url_courte(u)}" if lien_valide(u) else "") for n, d, u in absents)
            + "."
        )
    noms_absents = {nom for nom, _, _ in absents}
    liens = [
        f"{nom} {_url_courte(url)}"
        for nom, _, url in tous
        if nom not in noms_absents and lien_valide(url) and _cle(_url_courte(url)) not in deja
    ]
    if liens:
        faits.append(f"Liens des projets : {' ; '.join(liens)}.")

    methode = c["methode"]
    # Les étapes seulement : leurs outils (UML, Figma, Docker…) sont déjà dans les compétences
    faits.append(f"Méthode : {' → '.join(e['titre'] for e in methode['etapes'])}.")
    faits.append(f"Engagements : {' ; '.join(e['titre'] for e in methode['engagements'])}.")


    outils: list[str] = []
    deja_colle = deja.replace(" ", "")
    for groupe in c["bandeaux"]["ruban1"] + c["bandeaux"]["ruban2"] + c["competences"]["groupes"]:
        for item in groupe["items"]:
            morceaux = [m.strip() for m in re.split(r"[·&]", item)]
            # « Tailwind CSS » et « TailwindCSS » sont le même outil : on compare aussi sans espaces
            if any(_cle(m).replace(" ", "") not in deja_colle for m in morceaux) and item not in outils:
                outils.append(item)
    if outils:
        faits.append(f"Autres outils : {', '.join(outils)}.")
    return faits


def construire_texte_base() -> str:
    """Texte complet de la base : le fichier de Binetou allégé, puis les compléments du site."""
    source = _source_allegee(settings.CHATBOT_SOURCE_MD.read_text(encoding="utf-8"))
    with open(settings.CONTENU_JSON, encoding="utf-8") as fichier:
        contenu = json.load(fichier)
    faits = _complements(contenu, _cle(source))
    return f"{source}\n\n{TITRE_COMPLEMENTS}\n" + "\n".join(f"- {f}" for f in faits) + "\n"


# --- Lecture (vue /api/chat/) ------------------------------------------------------------

_TITRE_CONSIGNES = re.compile(r"^## Consignes.*$", re.MULTILINE)
_TITRE_NIVEAU_2 = re.compile(r"^## ", re.MULTILINE)


def decouper_base(texte: str) -> tuple[str, str]:
    """Sépare la section « Consignes » du reste (le titre et l'introduction, destinés aux humains, sont ignorés)."""
    debut = _TITRE_CONSIGNES.search(texte)
    if not debut:
        raise BaseIndisponible("Section « ## Consignes » introuvable dans la base.")
    suite = _TITRE_NIVEAU_2.search(texte, debut.end())
    consignes = texte[debut.end() : suite.start() if suite else len(texte)].strip()
    reste = texte[suite.start() :].strip() if suite else ""
    if not consignes or not reste:
        raise BaseIndisponible("La base doit contenir les consignes puis les informations.")
    return consignes, reste


@lru_cache(maxsize=1)
def message_systeme() -> str:
    """Message système envoyé avec chaque question. Mis en cache : la base ne change qu'au déploiement."""
    try:
        texte = settings.CHATBOT_BASE.read_text(encoding="utf-8")
    except OSError as erreur:
        raise BaseIndisponible(f"Base introuvable : {settings.CHATBOT_BASE}") from erreur
    consignes, informations = decouper_base(texte)
    return (
        f"{consignes}\n\n"
        "# Informations sur Binetou (ta seule source : n'utilise rien d'autre)\n\n"
        f"{informations}"
    )
