from abc import ABC, abstractmethod

class MetodoPagoStrategy(ABC):

    @abstractmethod
    def procesar_pago(self, pago):
        """Procesa el pago según su método"""
        pass
