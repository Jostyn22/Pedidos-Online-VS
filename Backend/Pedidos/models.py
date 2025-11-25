from django.db import models
from Usuarios.models import Usuario
from Productos.models import Producto

class Pedido(models.Model):
    ESTADOS = [
        ("PENDIENTE", "Pendiente"),
        ("PREPARANDO", "Preparando"),
        ("LISTO", "Listo para entregar"),
        ("ENTREGADO", "Entregado"),
        ("CANCELADO", "Cancelado"),
    ]

    cliente = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name="pedidos_cliente")
    vendedor = models.ForeignKey(Usuario, on_delete=models.SET_NULL, null=True, blank=True, related_name="pedidos_vendedor")
    fecha = models.DateTimeField(auto_now_add=True)
    estado = models.CharField(max_length=20, choices=ESTADOS, default="PENDIENTE")
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    def __str__(self):
        return f"Pedido #{self.id} - {self.cliente.username}"


class PedidoDetalle(models.Model):
    pedido = models.ForeignKey(Pedido, on_delete=models.CASCADE, related_name="detalles")
    producto = models.ForeignKey(
        Producto,
        on_delete=models.PROTECT,
        related_name="pedidos_detalle"
    )
    cantidad = models.PositiveIntegerField(default=1)
    precio = models.DecimalField(max_digits=10, decimal_places=2)

    def subtotal(self):
        return self.cantidad * self.precio

    def __str__(self):
        return f"{self.producto.nombre} x {self.cantidad}"

