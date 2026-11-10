"""
Filet de sécurité : le modèle ne doit jamais inventer de lien.

Toute adresse web de la réponse qui n'est pas écrite dans la base de connaissances est retirée
(ex. « https://www.binetougueye.com/cv-general.pdf » inventé). Les liens réels (GitHub, LinkedIn,
démos des projets…) et l'adresse email restent. Les CV sont proposés par les boutons d'action.
"""

import re

# Adresse avec schéma ou www, ou domaine nu (yeesnaa.com, github.com/…). Pas la partie après « @ » d'un email.
_URL = re.compile(
    r"(?<![@\w.-])(?:https?://|www\.)[^\s<>()\[\]«»\"']+"
    r"|(?<![@\w.-])(?:[a-z0-9-]+\.)+(?:com|app|site|sn|dev|io|org|net|fr|ai)(?:/[^\s<>()\[\]«»\"']*)?",
    re.IGNORECASE,
)
_LIEN_MARKDOWN = re.compile(r"\[([^\]]+)\]\(([^)\s]+)\)")
# Ligne vidée par le retrait d'un lien, ex. « - Front-End : » ou « Lien : »
_LIGNE_VIDE = re.compile(r"^\s*(?:[-•*]\s*)?[^\n:]{0,60}:\s*$")
_PONCTUATION_FINALE = ".,;:!?"


def _forme(url: str) -> str:
    url = url.lower().rstrip(_PONCTUATION_FINALE)
    url = re.sub(r"^https?://", "", url)
    url = re.sub(r"^www\.", "", url)
    return url.rstrip("/")


def urls_autorisees(base: str) -> set[str]:
    """Adresses écrites dans la base de connaissances (seules autorisées dans les réponses)."""
    return {_forme(m.group(0)) for m in _URL.finditer(base)}


def retirer_liens_inventes(texte: str, autorisees: set[str]) -> str:
    # [texte](url) → « texte url » : l'url passe ensuite par le même contrôle
    texte = _LIEN_MARKDOWN.sub(lambda m: f"{m.group(1)} {m.group(2)}", texte)

    def garder_ou_retirer(m: re.Match[str]) -> str:
        brut = m.group(0)
        fin = brut[len(brut.rstrip(_PONCTUATION_FINALE)) :]  # ponctuation de la phrase, à garder
        return brut if _forme(brut) in autorisees else fin

    texte = _URL.sub(garder_ou_retirer, texte)
    lignes = [ligne.rstrip() for ligne in texte.split("\n")]
    lignes = [re.sub(r"[ \t]{2,}", " ", ligne) for ligne in lignes if not _LIGNE_VIDE.match(ligne)]
    texte = "\n".join(lignes)
    return re.sub(r"\n{3,}", "\n\n", texte).strip()
