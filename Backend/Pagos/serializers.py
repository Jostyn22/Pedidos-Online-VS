from rest_framework import serializers
from .models import Pago
from Pedidos.models import Pedido

class PagoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pago
        fields = "__all__"

    def validate(self, data):
        pedido = data["pedido"]

        # Validar solo en creación, no en actualización
        if not self.instance:
            if hasattr(pedido, "pago"):
                raise serializers.ValidationError("Este pedido ya tiene un pago registrado.")
        
        # Validar monto exacto
        monto = data.get("monto")
        if monto is not None and monto != pedido.total:
            raise serializers.ValidationError("El monto debe coincidir exactamente con el total del pedido.")

        return data
