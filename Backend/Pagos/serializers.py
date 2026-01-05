from rest_framework import serializers
from .models import Pago

class PagoSerializer(serializers.ModelSerializer):
    # Campo extra para mostrar el nombre del cliente asociado al pedido
    pedido_cliente_nombre = serializers.CharField(
        source="pedido.cliente.username",  # Ajusta según tu modelo
        read_only=True
    )

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
