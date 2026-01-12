from rest_framework import viewsets, filters, permissions, status
from django_filters.rest_framework import DjangoFilterBackend
from .models import Producto, Categoria, Marca
from .serializers import ProductoSerializer, CategoriaSerializer, MarcaSerializer
from rest_framework.decorators import api_view, action
from rest_framework.response import Response

class ProductoViewSet(viewsets.ModelViewSet):
    serializer_class = ProductoSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['categoria', 'marca', 'activo']
    search_fields = ['nombre', 'descripcion', 'categoria__nombre', 'marca__nombre']
    ordering_fields = ['precio', 'nombre', 'stock']
    ordering = ['nombre']
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
       

    def get_queryset(self):
    
        usuario = self.request.user
        if not usuario.is_authenticated:
            return Producto.objects.filter(activo=True)
        if usuario.rol == "ADMIN":
            return Producto.objects.all()
        if usuario.rol == "VENDEDOR":
            return Producto.objects.filter(vendedor=usuario)
        return Producto.objects.filter(activo=True)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        nombre = serializer.validated_data.get("nombre")
        marca = serializer.validated_data.get("marca")
        categoria = serializer.validated_data.get("categoria")
        stock = serializer.validated_data.get("stock", 0)
        precio_costo = serializer.validated_data.get("precio_costo") or 0
        porcentaje_ganancia = serializer.validated_data.get("porcentaje_ganancia") or 0

        producto_existente = Producto.objects.filter(
            nombre__iexact=nombre,
            marca=marca,
            categoria=categoria
        ).first()

        if producto_existente:
            producto_existente.stock += stock
            producto_existente.precio_costo = precio_costo
            producto_existente.porcentaje_ganancia = porcentaje_ganancia
            producto_existente.precio = precio_costo * (1 + porcentaje_ganancia / 100)

            producto_existente.save()

            return Response(
                {
                    "mensaje": "Stock actualizado correctamente.",
                    "producto": ProductoSerializer(producto_existente).data,
                },
            status=status.HTTP_200_OK,
        )
        precio = precio_costo * (1 + porcentaje_ganancia / 100)
        serializer.save(vendedor=request.user, precio=precio)
        return Response(
            {
                "mensaje": "Producto creado correctamente.",
                "producto": serializer.data,
            },
            status=status.HTTP_201_CREATED,
        )
        
    def destroy(self, request, *args, **kwargs):
        producto = self.get_object()

        if hasattr(producto, "pedidos_detalle") and producto.pedidos_detalle.exists():
            return Response(
                {"detail": "No se puede eliminar este producto porque está asociado a pedidos realizados."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        producto.delete()
        return Response(
            {"mensaje": "Producto eliminado correctamente."},
            status=status.HTTP_200_OK
        )
    @action(detail=False, methods=["patch"], url_path="aplicar-descuento-categoria")
    def aplicar_descuento_categoria(self, request):
        usuario = request.user

        if not usuario.is_authenticated or usuario.rol != "ADMIN":
            return Response(
                {"error": "No autorizado"},
                status=status.HTTP_403_FORBIDDEN
        )

        categoria_id = request.data.get("categoria_id")
        porcentaje = request.data.get("porcentaje_descuento")

        if categoria_id is None or porcentaje is None:
            return Response(
                {"error": "Debe enviar categoria_id y porcentaje_descuento"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            porcentaje = float(porcentaje)
            if porcentaje < 0 or porcentaje > 100:
                raise ValueError
        except ValueError:
            return Response(
                {"error": "Porcentaje inválido"},
                status=status.HTTP_400_BAD_REQUEST
        )

        productos = Producto.objects.filter(categoria_id=categoria_id)

        if not productos.exists():
             return Response(
                {"mensaje": "No hay productos en esa categoría"},
                status=status.HTTP_200_OK
            )

        for producto in productos:
            producto.porcentaje_descuento = porcentaje
            producto.save()  # recalcula precio y precio_final

        return Response(
            {
                "mensaje": f"Descuento {porcentaje}% aplicado correctamente",
                "productos_actualizados": productos.count()
            },
            status=status.HTTP_200_OK
    )
class CategoriaViewSet(viewsets.ModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer

class MarcaViewSet(viewsets.ModelViewSet):
    queryset = Marca.objects.all()
    serializer_class = MarcaSerializer
@api_view(["PATCH"])
def toggle_activo(request, producto_id):
    try:
        producto = Producto.objects.get(id=producto_id)
        producto.activo = not producto.activo
        producto.save()
        return Response({"estado": producto.activo})
    except Producto.DoesNotExist:
        return Response({"error": "Producto no encontrado"}, status=404)