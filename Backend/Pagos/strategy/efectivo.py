from .base import MetodoPagoStrategy

class PagoEfectivoStrategy(MetodoPagoStrategy):

    def procesar_pago(self, pago):
        # Pagos en efectivo normalmente se marcan como PAGADO inmediatamente
        pago.estado_pago = "PAGADO"
        pago.save()
        return True
