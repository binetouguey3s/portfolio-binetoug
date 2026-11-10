"""
Boutons d'action sous les réponses de Binetou IA.

Ils sont choisis ici par des règles de mots-clés sur la question, jamais par l'IA :
le modèle ne produit ni identifiant ni lien. Seuls les identifiants présents dans
chatbot.actions de contenu.json peuvent sortir (2 au maximum) ; le front lit la cible.
Si la question est en anglais, les CV proposés sont les versions anglaises (cv-*-en).
"""

import re
import unicodedata

from portfolio.contenu import lire_contenu

ACTIONS_MAX = 2

# Ordre = priorité : un projet cité d'abord, puis le CV adapté, puis le contact, puis la galerie.
# Mots-clés écrits sans accents et en minuscules (la question est normalisée de la même façon).
REGLES: list[tuple[str, list[str]]] = [
    ("voir-sen-suivi", ["sen suivi", "sensuivi", "titou", "sante mentale", "bien-etre", "bien etre", "startup"]),
    ("voir-ande-setal", ["ande setal", "andesetal", "ande", "setal", "salubrite", "dakar plateau", "civic-tech"]),
    ("voir-yees-naa", ["yees naa", "yeesnaa", "yees", "riz", "marketplace", "qr code"]),
    ("voir-agrimeteo", ["agrimeteo", "agri meteo", "meteo", "climat", "chart.js"]),
    ("voir-vision", ["vision", "resnet", "resnet-50", "controle qualite", "pytorch", "computer vision"]),
    ("voir-senagrolink", ["senagrolink", "agriculteur", "agriculteurs"]),
    ("voir-afristory", ["afristory", "orange money", "hackathon"]),
    (
        "cv-back",
        ["back-end", "backend", "back end", "django", "drf", "fastapi", "api", "apis", "python",
         "serveur", "base de donnees", "postgresql", "postgres", "mysql", "docker", "nginx"],
    ),
    (
        "cv-front",
        ["front-end", "frontend", "front end", "angular", "react", "typescript", "javascript",
         "tailwind", "tailwindcss", "interface", "interfaces", "ui", "ux", "figma", "flutter", "mobile"],
    ),
    (
        "cv-general",
        ["cv", "curriculum", "resume", "stack", "competence", "competences", "skills",
         "technologies", "profil", "parcours", "experience", "formation", "full-stack", "fullstack"],
    ),
    (
        "ecrire-email",
        ["email", "e-mail", "mail", "contacter", "contact", "joindre", "ecrire", "telephone", "numero",
         "appeler", "disponible", "disponibilite", "available", "hire", "recruter", "recrutement",
         "embauche", "embaucher", "poste", "cdi", "cdd", "stage", "freelance", "mission"],
    ),
    ("voir-contact", ["formulaire", "form", "contacter", "contact", "disponible", "disponibilite", "available"]),
    ("voir-projets", ["projet", "projets", "realisation", "realisations", "portfolio", "project", "projects"]),
]

_CV_SPECIFIQUES = {"cv-back", "cv-front"}

# Mots très courants en anglais et rares en français : 2 suffisent pour dire « question en anglais »
_MOTS_ANGLAIS = {
    "the", "is", "are", "she", "her", "does", "do", "what", "which", "who", "how", "can", "could",
    "with", "about", "have", "has", "experience", "skills", "available", "work", "worked", "tell",
    "me", "download", "resume", "english", "projects", "hire", "would", "of", "in", "and", "you",
}
_MOTS_FRANCAIS = {"est", "elle", "les", "des", "une", "quelle", "quel", "sur", "avec", "son", "ses", "pour", "et"}


def est_en_anglais(question: str) -> bool:
    mots = re.findall(r"[a-z]+", normaliser(question))
    anglais = sum(m in _MOTS_ANGLAIS for m in mots)
    francais = sum(m in _MOTS_FRANCAIS for m in mots)
    return anglais >= 2 and anglais > francais


def normaliser(texte: str) -> str:
    """Minuscules, sans accents, apostrophes droites."""
    sans_accents = unicodedata.normalize("NFKD", texte).encode("ascii", "ignore").decode()
    return sans_accents.lower().replace("’", "'")


def _contient(texte: str, mot_cle: str) -> bool:
    return re.search(rf"(?<![a-z0-9]){re.escape(mot_cle)}(?![a-z0-9])", texte) is not None


def identifiants_autorises() -> set[str]:
    return {action["id"] for action in lire_contenu()["chatbot"]["actions"]}


def choisir_actions(question: str) -> list[str]:
    """Identifiants d'actions (2 au maximum) pour une question, uniquement parmi chatbot.actions."""
    texte = normaliser(question)
    trouves = [ident for ident, mots in REGLES if any(_contient(texte, mot) for mot in mots)]

    # Un seul CV : back et front à la fois (profil full-stack) → CV Général
    if _CV_SPECIFIQUES <= set(trouves):
        position = min(trouves.index(i) for i in _CV_SPECIFIQUES)
        trouves = [i for i in trouves if i not in _CV_SPECIFIQUES]
        trouves.insert(position, "cv-general")
    elif "cv-general" in trouves and _CV_SPECIFIQUES & set(trouves):
        trouves.remove("cv-general")

    # Question en anglais : les CV en anglais (cv-general → cv-general-en, etc.)
    if est_en_anglais(question):
        trouves = [f"{i}-en" if i.startswith("cv-") else i for i in trouves]

    autorises = identifiants_autorises()
    resultat: list[str] = []
    for ident in trouves:
        if ident in autorises and ident not in resultat:
            resultat.append(ident)
        if len(resultat) == ACTIONS_MAX:
            break
    return resultat
