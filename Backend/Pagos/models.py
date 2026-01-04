from django.db import models
from decimal import Decimal, ROUND_HALF_UP
from Pedidos.models import Pedido


class Pago(models.Model):
    METODO_PAGO = (
        ('TARJETA', 'Tarjeta'),
        ('EFECTIVO', 'Efectivo'),
        ('TRANSFERENCIA', 'Transferencia'),
    )

    ESTADO_PAGO = (
        ('PENDIENTE', 'Pendiente'),
        ('PAGADO', 'Pagado'),
        ('RECHAZADO', 'Rechazado'),
    )

    pedido = models.OneToOneField(
        Pedido,
        on_delete=models.CASCADE,
        related_name="pago"
    )
    metodo = models.CharField(max_length=20, choices=METODO_PAGO)
    monto = models.DecimalField(max_digits=10, decimal_places=2)
    referencia = models.CharField(max_length=100, null=True, blank=True)
    estado_pago = models.CharField(
        max_length=20,
        choices=ESTADO_PAGO,
        default="PENDIENTE"
    )
    fecha_pago = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        # VALIDAR QUE NO EXISTA OTRO PAGO PARA EL PEDIDO
        if self.pk is None and Pago.objects.filter(pedido=self.pedido).exists():
            raise ValueError("Este pedido ya tiene un pago registrado.")

        # NORMALIZAR DECIMALES
        monto_pedido = Decimal(self.pedido.total).quantize(
            Decimal("0.01"), rounding=ROUND_HALF_UP
        )

        monto_pago = Decimal(self.monto).quantize(
            Decimal("0.01"), rounding=ROUND_HALF_UP
        )

        # VALIDAR MONTO
        if monto_pago != monto_pedido:
            raise ValueError(
                f"El monto debe coincidir exactamente con el total del pedido ({monto_pedido})."
            )

        super().save(*args, **kwargs)

        # APLICAR ESTRATEGIA SEGÚN ESTADO DEL PAGO
        strategy = PagoStrategyFactory.get_strategy(self.estado_pago)
        strategy.apply(self.pedido)

    def __str__(self):
        return f"Pago #{self.id} - Pedido #{self.pedido.id} - {self.estado_pago}"


# ==========================
# PATRÓN STRATEGY
# ==========================

class PagoStrategy:
    def apply(self, pedido: Pedido):
        raise NotImplementedError("Cada estrategia debe implementar el método apply()")


class PendienteStrategy(PagoStrategy):
    def apply(self, pedido: Pedido):
        # No se realizan cambios
        pass


class PagadoStrategy(PagoStrategy):
    def apply(self, pedido: Pedido):
        pedido.estado = "PREPARANDO"
        pedido.save()


class RechazadoStrategy(PagoStrategy):
    def apply(self, pedido: Pedido):
        pedido.estado = "PENDIENTE"
        pedido.save()


# ==========================
# FACTORY
# ==========================

class PagoStrategyFactory:
    strategies = {
        "PENDIENTE": PendienteStrategy(),
        "PAGADO": PagadoStrategy(),
        "RECHAZADO": RechazadoStrategy(),
    }

    @classmethod
    def get_strategy(cls, estado_pago):
        return cls.strategies.get(estado_pago, PendienteStrategy())
