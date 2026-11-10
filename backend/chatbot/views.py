import logging

from rest_framework import status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from portfolio.contenu import lire_contenu

from .actions import choisir_actions
from .base import BaseIndisponible, message_systeme
from .groq import ModeleIndisponible, demander_au_modele
from .liens import retirer_liens_inventes, urls_autorisees
from .serializers import ChatSerializer

journal = logging.getLogger(__name__)

MESSAGE_INDISPONIBLE_DEFAUT = "Binetou IA est momentanément indisponible. Réessayez plus tard."


def _message_hors_ligne() -> str:
    """Même texte que le front quand l'assistante ne répond pas (chatbot.horsLigne)."""
    try:
        return lire_contenu()["chatbot"]["horsLigne"]
    except (OSError, KeyError, ValueError):
        return MESSAGE_INDISPONIBLE_DEFAUT


class ChatView(APIView):
    """
    POST /api/chat/ : une question à Binetou IA.
    - Entrée : { "message": "…" (500 caractères max), "history": [...] } ; seuls les 6 derniers échanges sont gardés.
    - Sortie : { "reponse": "…", "actions": ["cv-back", …] } (2 actions max, choisies par mots-clés, jamais par l'IA).
    - Limite de débit par adresse IP (LIMITE_CHAT, 20 par heure par défaut).
    - Groq indisponible, délai de 20 s dépassé ou configuration manquante : 503 avec un message clair.
    Aucune conversation n'est enregistrée.
    """

    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "chat"

    def post(self, request: Request) -> Response:
        serializer = ChatSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"erreurs": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        question = serializer.validated_data["message"]
        try:
            systeme = message_systeme()
            messages = [
                {"role": "system", "content": systeme},
                *serializer.historique_pour_groq(),
                {"role": "user", "content": question},
            ]
            reponse = demander_au_modele(messages)
        except (BaseIndisponible, ModeleIndisponible) as erreur:
            journal.warning("Chatbot indisponible : %s", erreur)
            return Response({"erreur": _message_hors_ligne()}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        # Filet de sécurité : aucune adresse web absente de la base ne sort (les CV passent par les boutons)
        reponse = retirer_liens_inventes(reponse, urls_autorisees(systeme))
        return Response({"reponse": reponse, "actions": choisir_actions(question)})
