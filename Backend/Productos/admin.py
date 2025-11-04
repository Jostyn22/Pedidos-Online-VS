from django.contrib import admin
from .models import Producto, Categoria, Marca

@admin.register(Producto)
class ProductoAdmin(admin.ModelAdmin):
    list_display = ("nombre", "precio", "stock", "categoria", "marca", "activo")
    list_filter = ("activo", "categoria", "marca")
    search_fields = ("nombre", "descripcion")
admin.site.register(Categoria)
admin.site.register(Marca)
