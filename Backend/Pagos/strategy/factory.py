from .tarjeta import PagoTarjetaStrategy
from .efectivo import PagoEfectivoStrategy
from .transferencia import PagoTransferenciaStrategy

def obtener_estrategia(metodo):
    estrategias = {
        "TARJETA": PagoTarjetaStrategy(),
        "EFECTIVO": PagoEfectivoStrategy(),
        "TRANSFERENCIA": PagoTransferenciaStrategy(),
    }

    return estrategias.get(metodo)
