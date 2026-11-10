from django.core.validators import EmailValidator
from rest_framework import serializers

from .contenu import lire_contenu
from .models import ContactMessage, Project

NOM_MIN, NOM_MAX = 2, 120
MESSAGE_MIN, MESSAGE_MAX = 10, 4000


class ProjectSerializer(serializers.ModelSerializer):
    """Même forme que projets.galerie dans contenu.json, pour que le front n'ait rien à adapter."""

    num = serializers.SerializerMethodField()
    lien = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = ["num", "nom", "meta", "domaine", "description", "stack", "lien", "vedette"]

    def get_num(self, obj: Project) -> str:
        return f"{obj.ordre:02d}"

    def get_lien(self, obj: Project) -> dict[str, str]:
        return {"label": obj.label_lien, "url": obj.lien}


def _messages_erreur() -> dict[str, str]:
    """Messages de validation de contenu.json (identiques à ceux du front)."""
    return lire_contenu()["contact"]["formulaire"]["erreurs"]


class ContactSerializer(serializers.Serializer):
    nom = serializers.CharField(max_length=NOM_MAX, trim_whitespace=True)
    email = serializers.EmailField(max_length=254)
    message = serializers.CharField(max_length=MESSAGE_MAX, trim_whitespace=True)
    # Champ piège anti-spam : invisible pour les humains, rempli par les robots
    site_web = serializers.CharField(required=False, allow_blank=True, default="")

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        e = _messages_erreur()
        self.fields["nom"].error_messages.update({"required": e["nomRequis"], "blank": e["nomRequis"]})
        self.fields["email"].error_messages.update(
            {"required": e["emailRequis"], "blank": e["emailRequis"], "invalid": e["emailInvalide"]}
        )
        # Le validateur d'email est créé avec le message par défaut : on le remplace par le nôtre
        self.fields["email"].validators = [
            v for v in self.fields["email"].validators if not isinstance(v, EmailValidator)
        ] + [EmailValidator(message=e["emailInvalide"])]
        self.fields["message"].error_messages.update({"required": e["messageRequis"], "blank": e["messageRequis"]})

    def validate_nom(self, valeur: str) -> str:
        if len(valeur) < NOM_MIN:
            raise serializers.ValidationError(_messages_erreur()["nomCourt"])
        return valeur

    def validate_message(self, valeur: str) -> str:
        if len(valeur) < MESSAGE_MIN:
            raise serializers.ValidationError(_messages_erreur()["messageCourt"])
        return valeur

    def est_un_robot(self) -> bool:
        return bool(self.validated_data.get("site_web", "").strip())

    def create(self, validated_data) -> ContactMessage:
        validated_data.pop("site_web", None)
        return ContactMessage.objects.create(**validated_data)
