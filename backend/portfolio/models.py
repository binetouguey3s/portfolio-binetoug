from django.db import models


class Project(models.Model):
    """Projet affiché dans la section Projets (gérable dans l'admin Django)."""

    ordre = models.PositiveSmallIntegerField("ordre", default=0, help_text="Position dans la galerie (1, 2, 3…).")
    nom = models.CharField("nom", max_length=120)
    meta = models.CharField("méta", max_length=200, blank=True, help_text="Ex. « Lead back-end · Mairie de Dakar Plateau ».")
    domaine = models.CharField("domaine", max_length=80, blank=True, help_text="Ex. « CIVIC-TECH ».")
    description = models.TextField("description")
    stack = models.JSONField("stack", default=list, blank=True, help_text='Liste de technologies, ex. ["Django 5", "DRF"].')
    lien = models.URLField("lien", blank=True, help_text="Laisser vide pour masquer le bouton.")
    label_lien = models.CharField("texte du lien", max_length=60, blank=True, help_text="Ex. « GitHub ↗ ».")
    vedette = models.BooleanField("projet vedette", default=False, help_text="Sen Suivi la Solution.")

    class Meta:
        ordering = ["ordre", "id"]
        verbose_name = "projet"
        verbose_name_plural = "projets"

    def __str__(self) -> str:
        return self.nom


class ContactMessage(models.Model):
    """Message envoyé depuis le formulaire de contact."""

    nom = models.CharField("nom", max_length=120)
    email = models.EmailField("email")
    message = models.TextField("message")
    date = models.DateTimeField("reçu le", auto_now_add=True)
    lu = models.BooleanField("lu", default=False)

    class Meta:
        ordering = ["-date"]
        verbose_name = "message de contact"
        verbose_name_plural = "messages de contact"

    def __str__(self) -> str:
        return f"{self.nom} <{self.email}> — {self.date:%d/%m/%Y %H:%M}"
