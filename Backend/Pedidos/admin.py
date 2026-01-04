from django.contrib import admin
from .models import Pedido, PedidoDetalle

@admin.register(Pedido)
class PedidoAdmin(admin.ModelAdmin):
    list_display = ("id", "cliente", "estado", "total", "fecha")
    list_filter = ("estado", "fecha")
    search_fields = ("cliente__username",)
    ordering = ("-fecha",)

@admin.register(PedidoDetalle)
class PedidoDetalleAdmin(admin.ModelAdmin):
    list_display = ("pedido", "producto", "cantidad", "precio")
