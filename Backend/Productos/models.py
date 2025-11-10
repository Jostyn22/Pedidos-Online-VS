from django.db import models
from Usuarios.models import Usuario  
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
    precio = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.PositiveIntegerField(default=0)
    categoria = models.ForeignKey(Categoria, on_delete=models.SET_NULL, null=True, blank=True)
    marca = models.ForeignKey(Marca, on_delete=models.SET_NULL, null=True, blank=True)
    imagen = models.ImageField(upload_to='productos/', blank=True, null=True)
    activo = models.BooleanField(default=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return self.nombre
