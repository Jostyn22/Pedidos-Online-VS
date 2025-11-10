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
    class Meta:
        model = Producto
        fields = [
            'id', 'nombre', 'descripcion', 'precio', 'stock',
            'categoria', 'marca', 'categoria_id', 'marca_id',
            'imagen', 'activo', 'fecha_creacion', 'vendedor'
        ]
        read_only_fields = ['vendedor', 'activo']
    def create(self, validated_data):
        validated_data["vendedor"] = self.context["request"].user
        return super().create(validated_data)
    def update(self, instance, validated_data):
        validated_data.pop("vendedor", None)
        return super().update(instance, validated_data)
