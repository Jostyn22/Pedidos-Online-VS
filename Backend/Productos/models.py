from django.db import models
from Usuarios.models import Usuario  
from decimal import Decimal

class Categoria(models.Model):
    nombre = models.CharField(max_length=50, unique=True)
    descripcion = models.TextField(blank=True)

    def __str__(self):
        return self.nombre


class Marca(models.Model):
    nombre = models.CharField(max_length=50, unique=True)
    descripcion = models.TextField(blank=True)

    def __str__(self):
        return self.nombre


class Producto(models.Model):
    vendedor = models.ForeignKey(Usuario, on_delete=models.CASCADE, related_name="productos")
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField(blank=True)

    precio_costo = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    porcentaje_ganancia = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    
    porcentaje_descuento = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0
    )

    precio = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    precio_final = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    stock = models.PositiveIntegerField(default=0)
    categoria = models.ForeignKey(Categoria, on_delete=models.SET_NULL, null=True, blank=True)
    marca = models.ForeignKey(Marca, on_delete=models.SET_NULL, null=True, blank=True)
    imagen = models.ImageField(upload_to='productos/', blank=True, null=True)
    activo = models.BooleanField(default=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        precio_costo = Decimal(self.precio_costo)
        ganancia = Decimal(self.porcentaje_ganancia)
        descuento = Decimal(self.porcentaje_descuento)
    # Precio con ganancia
        self.precio = precio_costo * (Decimal("1") + (ganancia / Decimal("100")))
    # Precio con descuento
        self.precio_final = self.precio * (Decimal("1") - (descuento / Decimal("100")))
        super().save(*args, **kwargs)
    def __str__(self):
        return self.nombre
