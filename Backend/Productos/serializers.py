from rest_framework import serializers
from .models import Producto, Categoria, Marca
class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = '__all__'
class MarcaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Marca
        fields = '__all__'
class ProductoSerializer(serializers.ModelSerializer):
    categoria = CategoriaSerializer(read_only=True)
    marca = MarcaSerializer(read_only=True)
    categoria_id = serializers.PrimaryKeyRelatedField(
        queryset=Categoria.objects.all(), source='categoria', write_only=True, required=False
    )
    marca_id = serializers.PrimaryKeyRelatedField(
        queryset=Marca.objects.all(), source='marca', write_only=True, required=False
    )
    precio_costo = serializers.DecimalField(max_digits=10, decimal_places=2, required=True)
    porcentaje_ganancia = serializers.DecimalField(max_digits=5, decimal_places=2, required=True)

    class Meta:
        model = Producto
        fields = [
            'id', 'nombre', 'descripcion', 'precio', 'precio_costo', 'porcentaje_ganancia',
            'stock', 'categoria', 'marca', 'categoria_id', 'marca_id',
            'imagen', 'activo', 'fecha_creacion', 'vendedor'
        ]
        read_only_fields = ['vendedor', 'activo', 'precio']  

    def create(self, validated_data):
        validated_data["vendedor"] = self.context["request"].user
        precio_costo = validated_data.get("precio_costo", 0)
        porcentaje_ganancia = validated_data.get("porcentaje_ganancia", 0)
        validated_data["precio"] = precio_costo * (1 + porcentaje_ganancia / 100)

        nombre = validated_data.get("nombre")
        marca = validated_data.get("marca")
        categoria = validated_data.get("categoria")
        stock = validated_data.get("stock", 0)

        producto_existente = Producto.objects.filter(
            nombre__iexact=nombre,
            marca=marca,
            categoria=categoria
        ).first()

        if producto_existente:
            producto_existente.stock += stock
            producto_existente.precio_costo = validated_data.get("precio_costo", producto_existente.precio_costo)
            producto_existente.porcentaje_ganancia = validated_data.get("porcentaje_ganancia", producto_existente.porcentaje_ganancia)
            producto_existente.precio = producto_existente.precio_costo * (1 + producto_existente.porcentaje_ganancia / 100)
            producto_existente.save()
            return producto_existente
        return super().create(validated_data)

    def update(self, instance, validated_data):
        validated_data.pop("vendedor", None)
        if "precio_costo" in validated_data or "porcentaje_ganancia" in validated_data:
            precio_costo = validated_data.get("precio_costo", instance.precio_costo)
            porcentaje_ganancia = validated_data.get("porcentaje_ganancia", instance.porcentaje_ganancia)
            validated_data["precio"] = precio_costo * (1 + porcentaje_ganancia / 100)
        return super().update(instance, validated_data)
