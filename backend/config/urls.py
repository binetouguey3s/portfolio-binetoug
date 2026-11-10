"""Routes du back-end : l'API sous /api/ et l'administration sous /admin/."""

from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("portfolio.urls")),
    path("api/", include("chatbot.urls")),
]
