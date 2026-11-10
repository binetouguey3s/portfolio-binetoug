"""
Réglages Django du portfolio de Binetou Gueye.

Tout ce qui change entre le local et la production passe par des variables
d'environnement (fichier backend/.env en local, réglages Vercel en production).
Voir backend/.env.example. Aucun secret n'est écrit dans ce fichier.
"""

import os
from pathlib import Path

import dj_database_url
from django.core.exceptions import ImproperlyConfigured
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
# Racine du dépôt (contient content/, design/, docs/…)
REPO_DIR = BASE_DIR.parent

# Charge backend/.env s'il existe (en production, Vercel fournit les variables)
load_dotenv(BASE_DIR / ".env")


def env_bool(nom: str, defaut: bool = False) -> bool:
    return os.getenv(nom, str(defaut)).strip().lower() in {"1", "true", "vrai", "oui", "yes"}


def env_liste(nom: str, defaut: str = "") -> list[str]:
    return [v.strip() for v in os.getenv(nom, defaut).split(",") if v.strip()]


DEBUG = env_bool("DEBUG", False)

SECRET_KEY = os.getenv("SECRET_KEY", "")
if not SECRET_KEY:
    if DEBUG:
        # Clé de développement uniquement : jamais utilisée en production
        SECRET_KEY = "dev-seulement-ne-pas-utiliser-en-production"
    else:
        raise ImproperlyConfigured("SECRET_KEY doit être définie quand DEBUG=False.")

ALLOWED_HOSTS = env_liste("ALLOWED_HOSTS", "localhost,127.0.0.1")

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "corsheaders",
    "portfolio",
    "chatbot",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"

# Base de données : Neon (PostgreSQL) via DATABASE_URL, sinon SQLite en local
DATABASE_URL = os.getenv("DATABASE_URL", "").strip()
if DATABASE_URL:
    DATABASES = {
        "default": dj_database_url.parse(
            DATABASE_URL,
            conn_max_age=60,
            conn_health_checks=True,
            ssl_require=DATABASE_URL.startswith("postgres"),
        )
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "fr"
TIME_ZONE = "Africa/Dakar"
USE_I18N = True
USE_TZ = True

# Fichiers statiques (admin Django), servis par WhiteNoise
STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STORAGES = {
    "default": {"BACKEND": "django.core.files.storage.FileSystemStorage"},
    "staticfiles": {"BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage"},
}

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# CORS : seulement l'URL du front (ex. http://localhost:5173,https://portfolio-binetou.vercel.app)
# En local, le front peut être ouvert sous localhost ou 127.0.0.1 : les deux sont autorisés par défaut
CORS_ALLOWED_ORIGINS = env_liste("CORS_ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
CSRF_TRUSTED_ORIGINS = env_liste("CSRF_TRUSTED_ORIGINS", "")

# API REST
REST_FRAMEWORK = {
    "DEFAULT_RENDERER_CLASSES": ["rest_framework.renderers.JSONRenderer"]
    + (["rest_framework.renderers.BrowsableAPIRenderer"] if DEBUG else []),
    "DEFAULT_PARSER_CLASSES": ["rest_framework.parsers.JSONParser"],
    "DEFAULT_AUTHENTICATION_CLASSES": [],
    "DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.AllowAny"],
    "UNAUTHENTICATED_USER": None,
    # Limites de débit par adresse IP (voir portfolio/views.py et chatbot/views.py)
    "DEFAULT_THROTTLE_RATES": {
        "contact": os.getenv("LIMITE_CONTACT", "5/hour"),
        "chat": os.getenv("LIMITE_CHAT", "20/hour"),
    },
}

# Contenu du site : content/contenu.json (source unique des textes).
# En production, si le dépôt complet n'est pas disponible, on peut indiquer un autre chemin.
CONTENU_JSON = Path(os.getenv("CONTENU_JSON", REPO_DIR / "content" / "contenu.json"))

# Chatbot « Binetou IA » (app chatbot)
# Source rédigée par Binetou, puis base générée par « python manage.py construire_base_chatbot »
CHATBOT_SOURCE_MD = REPO_DIR / "content" / "base-connaissances-chatbot.md"
CHATBOT_BASE = BASE_DIR / "chatbot" / "data" / "base-connaissances-chatbot.md"
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "").strip()
GROQ_MODEL = os.getenv("GROQ_MODEL", "").strip()
# Modèle tenté une fois si le principal répond 429 (limite atteinte) ou dépasse le délai
GROQ_MODEL_SECOURS = os.getenv("GROQ_MODEL_SECOURS", "").strip()
GROQ_URL = os.getenv("GROQ_URL", "https://api.groq.com/openai/v1/chat/completions")

# Notification par email des messages du formulaire (facultatif)
CONTACT_NOTIFY_EMAIL = os.getenv("CONTACT_NOTIFY_EMAIL", "").strip()
EMAIL_BACKEND = os.getenv("EMAIL_BACKEND", "django.core.mail.backends.console.EmailBackend")
EMAIL_HOST = os.getenv("EMAIL_HOST", "")
EMAIL_PORT = int(os.getenv("EMAIL_PORT", "587"))
EMAIL_HOST_USER = os.getenv("EMAIL_HOST_USER", "")
EMAIL_HOST_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD", "")
EMAIL_USE_TLS = env_bool("EMAIL_USE_TLS", True)
DEFAULT_FROM_EMAIL = os.getenv("DEFAULT_FROM_EMAIL", "portfolio@localhost")

# Sécurité en production
if not DEBUG:
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
    SECURE_SSL_REDIRECT = env_bool("SECURE_SSL_REDIRECT", True)
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_HSTS_SECONDS = 60 * 60 * 24 * 30
    SECURE_CONTENT_TYPE_NOSNIFF = True
    SECURE_REFERRER_POLICY = "same-origin"

# Journaux : les messages des apps (dont les tokens envoyés à Groq) s'affichent dans la console
# (terminal en local, onglet Logs de Vercel en production)
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {"console": {"class": "logging.StreamHandler"}},
    "loggers": {
        "chatbot": {"handlers": ["console"], "level": "INFO"},
        "portfolio": {"handlers": ["console"], "level": "INFO"},
    },
}
