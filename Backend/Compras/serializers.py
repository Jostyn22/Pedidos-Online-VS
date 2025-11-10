from rest_framework import serializers
from .models import Compra, CompraDetalle
from Productos.serializers import ProductoSerializer


class CompraDetalleSerializer(serializers.ModelSerializer):
    producto = ProductoSerializer(read_only=True)
    subtotal = serializers.SerializerMethodField()

    def get_subtotal(self, obj):
        return obj.subtotal()

    class Meta:
        model = CompraDetalle
        fields = ['producto', 'cantidad', 'precio', 'subtotal']


class CompraSerializer(serializers.ModelSerializer):
    detalles = CompraDetalleSerializer(many=True, read_only=True)

    class Meta:
        model = Compra
        fields = ['id', 'fecha', 'total', 'detalles']
