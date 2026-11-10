from django.contrib import admin

from .models import ContactMessage, Project

admin.site.site_header = "Portfolio de Binetou Gueye"
admin.site.site_title = "Administration du portfolio"
admin.site.index_title = "Gestion du contenu"


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ("ordre", "nom", "domaine", "vedette", "a_un_lien")
    list_display_links = ("nom",)
    list_editable = ("ordre",)
    list_filter = ("vedette",)
    search_fields = ("nom", "meta", "description")

    @admin.display(boolean=True, description="lien")
    def a_un_lien(self, obj: Project) -> bool:
        return bool(obj.lien)


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ("date", "nom", "email", "apercu", "lu")
    list_filter = ("lu", "date")
    search_fields = ("nom", "email", "message")
    readonly_fields = ("nom", "email", "message", "date")
    actions = ["marquer_lus"]

    @admin.display(description="message")
    def apercu(self, obj: ContactMessage) -> str:
        return obj.message[:80] + ("…" if len(obj.message) > 80 else "")

    @admin.action(description="Marquer comme lus")
    def marquer_lus(self, request, queryset):
        queryset.update(lu=True)

    def has_add_permission(self, request) -> bool:
        # Les messages arrivent uniquement par le formulaire du site
        return False
