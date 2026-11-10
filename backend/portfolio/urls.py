from django.urls import path

from .views import ContactView, ProfilView, ProjetsView, SanteView

urlpatterns = [
    path("sante/", SanteView.as_view(), name="sante"),
    path("profil/", ProfilView.as_view(), name="profil"),
    path("projets/", ProjetsView.as_view(), name="projets"),
    path("contact/", ContactView.as_view(), name="contact"),
]
