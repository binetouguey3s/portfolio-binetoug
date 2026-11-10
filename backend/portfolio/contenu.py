"""Lecture de content/contenu.json (source unique des textes du site)."""

import json
from functools import lru_cache
from typing import Any

from django.conf import settings


@lru_cache(maxsize=1)
def lire_contenu() -> dict[str, Any]:
    """Contenu du site. Mis en cache : le fichier ne change qu'au déploiement."""
    with open(settings.CONTENU_JSON, encoding="utf-8") as fichier:
        return json.load(fichier)


def lien_valide(url: str | None) -> bool:
    """Même règle que le front : vide ou « A_COMPLETER… » = pas de lien."""
    return bool(url and url.strip() and not url.startswith("A_COMPLETER"))
