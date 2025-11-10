from rest_framework import viewsets, filters, permissions
from django_filters.rest_framework import DjangoFilterBackend
from .models import Producto, Categoria, Marca
from .serializers import ProductoSerializer, CategoriaSerializer, MarcaSerializer
from rest_framework.decorators import api_view
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
    def perform_create(self, serializer):
        serializer.save(vendedor=self.request.user)
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