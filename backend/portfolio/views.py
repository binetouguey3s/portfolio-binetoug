import logging

from django.conf import settings
from django.core.mail import send_mail
from django.db import connection
from rest_framework import status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from .contenu import lire_contenu
from .models import Project
from .serializers import ContactSerializer, ProjectSerializer

journal = logging.getLogger(__name__)


class SanteView(APIView):
    """GET /api/sante/ : le front l'utilise pour savoir si l'API répond."""

    def get(self, request: Request) -> Response:
        try:
            with connection.cursor() as curseur:
                curseur.execute("SELECT 1")
        except Exception:  # base injoignable
            journal.exception("Base de données injoignable")
            return Response({"statut": "degrade", "base": "injoignable"}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        return Response({"statut": "ok", "base": "ok"})


class ProfilView(APIView):
    """GET /api/profil/ : le JSON affiché dans le terminal (profilApi de contenu.json)."""

    def get(self, request: Request) -> Response:
        return Response(lire_contenu()["profilApi"])


class ProjetsView(APIView):
    """GET /api/projets/ : la liste des projets, dans l'ordre (gérable dans l'admin)."""

    def get(self, request: Request) -> Response:
        projets = Project.objects.all()
        return Response(ProjectSerializer(projets, many=True).data)


class ContactView(APIView):
    """
    POST /api/contact/ : enregistre un message du formulaire.
    - Validation avec les messages de contenu.json (contact.formulaire.erreurs).
    - Anti-spam : champ piège « site_web » (réponse de succès, mais rien n'est enregistré)
      et limite de débit par adresse IP (LIMITE_CONTACT, 5 par heure par défaut).
    - Notification par email facultative (CONTACT_NOTIFY_EMAIL).
    """

    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "contact"

    def post(self, request: Request) -> Response:
        serializer = ContactSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"erreurs": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        if serializer.est_un_robot():
            # Le robot croit avoir réussi ; rien n'est enregistré
            return Response({"ok": True}, status=status.HTTP_201_CREATED)

        message = serializer.save()
        if settings.CONTACT_NOTIFY_EMAIL:
            # Le message est déjà enregistré : une notification qui échoue (mot de passe SMTP faux,
            # serveur injoignable…) ne doit jamais faire échouer l'envoi du formulaire.
            try:
                send_mail(
                    subject=f"Portfolio : nouveau message de {message.nom}",
                    message=f"{message.nom} <{message.email}>\n\n{message.message}",
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[settings.CONTACT_NOTIFY_EMAIL],
                )
            except Exception:
                journal.exception("Notification email du message %s impossible (voir les réglages EMAIL_*).", message.pk)
        return Response({"ok": True}, status=status.HTTP_201_CREATED)
