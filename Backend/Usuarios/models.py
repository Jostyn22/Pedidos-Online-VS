from django.contrib.auth.models import AbstractUser
from django.db import models

class Usuario(AbstractUser):
    ROLES = [
        ('ADMIN', 'Administrador'),
        ('CLIENTE', 'Cliente'),
        ('VENDEDOR', 'Vendedor'),
        ('REPARTIDOR', 'Repartidor'),
    ]
    rol = models.CharField("Rol", max_length=15, choices=ROLES, default='CLIENTE')
    telefono = models.CharField("Teléfono", max_length=15, blank=True, null=True)
    direccion = models.CharField("Dirección", max_length=255, blank=True, null=True)
    fecha_registro = models.DateTimeField("Fecha de registro", auto_now_add=True)

    class Meta:
        verbose_name = "Usuario"
        verbose_name_plural = "Usuarios"

    def __str__(self):
        return f"{self.username} ({self.get_rol_display()})"
