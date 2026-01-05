# Envios/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from Pedidos.models import Pedido
from .models import Envio

@receiver(post_save, sender=Pedido)
def crear_envio_automatico(sender, instance, **kwargs):
    """
    Crea un envío automáticamente cuando un pedido pasa a LISTO
    """
    if instance.estado == "LISTO" and not hasattr(instance, "envio"):
        Envio.objects.create(
            pedido=instance,
            direccion_envio=getattr(instance, "direccion_envio", "Portoviejo")
        )
