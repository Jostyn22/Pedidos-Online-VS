from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import Compra, CompraDetalle
from Productos.models import Producto
from .serializers import CompraSerializer


class ConfirmarCompraView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        cliente = request.user
        carrito = request.data.get("carrito", [])

        if not carrito:
            return Response({"error": "El carrito está vacío."}, status=status.HTTP_400_BAD_REQUEST)

        compra = Compra.objects.create(cliente=cliente, total=0)
        total_compra = 0

        for item in carrito:
            producto = Producto.objects.get(id=item["producto_id"])
            cantidad = item.get("cantidad", 1)
            precio = producto.precio

            CompraDetalle.objects.create(
                compra=compra,
                producto=producto,
                cantidad=cantidad,
                precio=precio
            )

            total_compra += cantidad * precio

        compra.total = total_compra
        compra.save()

        return Response({"message": "Compra realizada con éxito.", "compra_id": compra.id}, status=status.HTTP_201_CREATED)

class ComprasClienteView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        compras = Compra.objects.filter(cliente=request.user).order_by("-fecha")
        return Response(CompraSerializer(compras, many=True).data)
