from rest_framework import serializers
from .models import Pedido, PedidoDetalle
from Usuarios.models import Usuario

class PedidoDetalleSerializer(serializers.ModelSerializer):
    class Meta:
        model = PedidoDetalle
        fields = "__all__"

class PedidoSerializer(serializers.ModelSerializer):
    detalles = PedidoDetalleSerializer(many=True, read_only=True)
    fecha = serializers.DateTimeField(format="%Y-%m-%d %H:%M")  
    cliente_nombre = serializers.CharField(source="cliente.username", read_only=True)  

    class Meta:
        model = Pedido
        fields = "__all__"
