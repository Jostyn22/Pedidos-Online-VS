from django.db import models
from Usuarios.models import Usuario
from Productos.models import Producto

class Compra(models.Model):
    cliente = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name="compras")
    fecha = models.DateTimeField(auto_now_add=True)
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    def __str__(self):
        return f"Compra #{self.id} - {self.cliente.username}"
class CompraDetalle(models.Model):
    compra = models.ForeignKey(Compra, on_delete=models.CASCADE, related_name="detalles")
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE)
    cantidad = models.PositiveIntegerField(default=1)
    precio = models.DecimalField(max_digits=10, decimal_places=2)

    def subtotal(self):
        return self.cantidad * self.precio

    def __str__(self):
        return f"{self.producto.nombre} x {self.cantidad}"
