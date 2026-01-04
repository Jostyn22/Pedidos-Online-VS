from django.contrib import admin
from .models import Envio


@admin.register(Envio)
class EnvioAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "pedido",
        "estado",
        "direccion_envio",
        "fecha_envio",
        "fecha_entrega",
        "creado_en",
    )

    list_filter = ("estado", "creado_en")
    search_fields = ("pedido__id", "direccion_envio")
    ordering = ("-creado_en",)
