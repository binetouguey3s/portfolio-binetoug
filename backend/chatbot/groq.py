"""
Appel à l'API GroqCloud (compatible OpenAI) avec httpx.

Modèle principal : GROQ_MODEL. Si Groq répond 429 (limite atteinte) ou dépasse le délai,
une seule nouvelle tentative est faite avec GROQ_MODEL_SECOURS avant d'abandonner.
Chaque requête est notée dans les logs avec le nombre de tokens envoyés.
"""

import logging
import re

import httpx
from django.conf import settings

journal = logging.getLogger(__name__)

TEMPERATURE = 0.3
DELAI_SECONDES = 20
JETONS_REPONSE_MAX = 400
# Estimation pour le français avec le tokenizer Llama 3 (environ 3,5 caractères par token)
CARACTERES_PAR_TOKEN = 3.5


class ModeleIndisponible(Exception):
    """Groq n'a pas pu répondre : clé ou modèle manquant, délai dépassé, erreur réseau ou réponse inattendue."""


class _ReessayerAvecSecours(ModeleIndisponible):
    """Limite atteinte (429) ou délai dépassé : le modèle de secours peut être tenté."""


def options_du_modele(modele: str) -> dict[str, object]:
    """
    Qwen 3 et gpt-oss « réfléchissent » avant de répondre : cette réflexion consomme des tokens
    du plafond de réponse. On la coupe (Qwen) ou on la réduit au minimum sans la renvoyer (gpt-oss).
    """
    if modele.startswith("qwen/qwen3"):
        return {"reasoning_effort": "none"}
    if modele.startswith("openai/gpt-oss"):
        return {"reasoning_effort": "low", "include_reasoning": False}
    return {}


def texte_simple(texte: str) -> str:
    """Retire la mise en forme Markdown (gras, italique, titres, code) : le chat affiche du texte brut."""
    texte = re.sub(r"(\*\*|__)(.+?)\1", r"\2", texte)
    texte = re.sub(r"(?<![\w*])\*(?!\s)(.+?)(?<!\s)\*(?![\w*])", r"\1", texte)
    texte = re.sub(r"^#{1,6}\s+", "", texte, flags=re.MULTILINE)
    texte = re.sub(r"^\s*[*•]\s+", "- ", texte, flags=re.MULTILINE)
    texte = texte.replace("`", "")
    return re.sub(r"[ \t]+$", "", texte, flags=re.MULTILINE).strip()


def estimer_tokens(texte: str) -> int:
    return round(len(texte) / CARACTERES_PAR_TOKEN)


def _appeler(modele: str, messages: list[dict[str, str]]) -> str:
    estimation = sum(estimer_tokens(m["content"]) for m in messages)
    try:
        reponse = httpx.post(
            settings.GROQ_URL,
            headers={"Authorization": f"Bearer {settings.GROQ_API_KEY}"},
            json={
                "model": modele,
                "messages": messages,
                "temperature": TEMPERATURE,
                "max_tokens": JETONS_REPONSE_MAX,
                **options_du_modele(modele),
            },
            timeout=DELAI_SECONDES,
        )
        reponse.raise_for_status()
        donnees = reponse.json()
        texte = donnees["choices"][0]["message"]["content"]
    except httpx.TimeoutException as erreur:
        journal.warning("Groq %s : délai de %d s dépassé (~%d tokens envoyés).", modele, DELAI_SECONDES, estimation)
        raise _ReessayerAvecSecours(f"{modele} n'a pas répondu en {DELAI_SECONDES} s.") from erreur
    except httpx.HTTPStatusError as erreur:
        code = erreur.response.status_code
        # Le corps d'erreur de Groq aide au diagnostic (il ne contient pas la clé)
        journal.warning("Groq %s : code %s (~%d tokens envoyés) : %s", modele, code, estimation, erreur.response.text[:300])
        classe = _ReessayerAvecSecours if code == 429 else ModeleIndisponible
        raise classe(f"{modele} a répondu avec le code {code}.") from erreur
    except httpx.HTTPError as erreur:
        raise ModeleIndisponible(f"Groq injoignable : {erreur.__class__.__name__}.") from erreur
    except (ValueError, KeyError, IndexError, TypeError) as erreur:
        raise ModeleIndisponible("Réponse de Groq dans un format inattendu.") from erreur

    if not isinstance(texte, str) or not texte.strip():
        raise ModeleIndisponible("Réponse vide de Groq.")

    usage = donnees.get("usage") or {}
    journal.info(
        "Groq %s : %s tokens envoyés, %s tokens en réponse.",
        modele,
        usage.get("prompt_tokens", f"~{estimation}"),
        usage.get("completion_tokens", "?"),
    )
    return texte_simple(texte)


def demander_au_modele(messages: list[dict[str, str]]) -> str:
    """Envoie la conversation au modèle principal (puis au secours si besoin) et renvoie sa réponse."""
    if not settings.GROQ_API_KEY or not settings.GROQ_MODEL:
        raise ModeleIndisponible("GROQ_API_KEY ou GROQ_MODEL n'est pas configuré.")
    try:
        return _appeler(settings.GROQ_MODEL, messages)
    except _ReessayerAvecSecours:
        secours = settings.GROQ_MODEL_SECOURS
        if not secours or secours == settings.GROQ_MODEL:
            raise
        journal.warning("Nouvelle tentative avec le modèle de secours %s.", secours)
        return _appeler(secours, messages)
