from .base import MetodoPagoStrategy

class PagoTarjetaStrategy(MetodoPagoStrategy):

    def procesar_pago(self, pago):
        # Aquí iría validación real con pasarela de pago (Stripe, PayPhone, etc.)
        if not pago.referencia:
            raise ValueError("Se requiere código de autorización para pagos con tarjeta")

        pago.estado_pago = "PAGADO"
        pago.save()
        return True
