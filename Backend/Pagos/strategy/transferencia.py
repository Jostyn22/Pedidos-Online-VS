from .base import MetodoPagoStrategy

class PagoTransferenciaStrategy(MetodoPagoStrategy):

    def procesar_pago(self, pago):
        # Las transferencias pueden quedar pendientes de revisión
        if not pago.referencia:
            raise ValueError("Debe agregar número de transferencia")

        pago.estado_pago = "PENDIENTE"
        pago.save()
        return True
