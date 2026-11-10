from rest_framework import serializers

QUESTION_MAX = 500
# Un échange = une question + une réponse
ECHANGES_MAX = 6
TEXTE_HISTORIQUE_MAX = 4000

# Rôles envoyés par le front (src/lib/chat-service.ts) → rôles de l'API Groq
ROLES = {"utilisateur": "user", "user": "user", "assistant": "assistant"}


class EchangeSerializer(serializers.Serializer):
    role = serializers.ChoiceField(choices=list(ROLES))
    texte = serializers.CharField(max_length=TEXTE_HISTORIQUE_MAX, trim_whitespace=True)


class ChatSerializer(serializers.Serializer):
    """Corps de POST /api/chat/ : { "message": "…", "history": [{ "role": "utilisateur", "texte": "…" }] }"""

    message = serializers.CharField(
        max_length=QUESTION_MAX,
        trim_whitespace=True,
        error_messages={
            "required": "Écrivez une question.",
            "blank": "Écrivez une question.",
            "max_length": f"La question ne doit pas dépasser {QUESTION_MAX} caractères.",
        },
    )
    history = EchangeSerializer(many=True, required=False, default=list)

    def historique_pour_groq(self) -> list[dict[str, str]]:
        """Les 6 derniers échanges seulement, au format attendu par Groq."""
        derniers = self.validated_data["history"][-ECHANGES_MAX * 2 :]
        return [{"role": ROLES[e["role"]], "content": e["texte"]} for e in derniers]
