"""Point d'entrée WSGI (serveur de production et Vercel)."""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

application = get_wsgi_application()
# Vercel utilise « application » (WSGI_APPLICATION) ; « app » est gardé pour les autres hébergeurs
app = application
