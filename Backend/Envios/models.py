# Envios/models.py
from django.db import models
from Pedidos.models import Pedido

class Envio(models.Model):

    ESTADOS = [
        ("PENDIENTE", "Pendiente"),
        ("EN_CAMINO", "En camino"),
        ("ENTREGADO", "Entregado"),
        ("CANCELADO", "Cancelado"),
    ]

    pedido = models.OneToOneField(
        Pedido,
        on_delete=models.CASCADE,
        related_name="envio"
    )

    direccion_envio = models.TextField()
    estado = models.CharField(
        max_length=20,
        choices=ESTADOS,
        default="PENDIENTE"
    )

    fecha_envio = models.DateTimeField(null=True, blank=True)
    fecha_entrega = models.DateTimeField(null=True, blank=True)

    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Envío #{self.id} - Pedido #{self.pedido.id}"
