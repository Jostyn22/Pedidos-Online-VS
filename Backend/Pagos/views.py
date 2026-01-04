from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from .models import Pago
from Pedidos.models import Pedido
from Compras.models import Compra
from .serializers import PagoSerializer


# --- Métodos auxiliares ---
def procesar_pago(pago: Pago, nuevo_estado: str = None):
    """Aplica validaciones y estrategia de estado."""
    if nuevo_estado:
        if nuevo_estado not in ["PENDIENTE", "PAGADO", "RECHAZADO"]:
            raise ValueError("Estado inválido")
        pago.estado_pago = nuevo_estado

    pago.save()  # El save aplica automáticamente la estrategia sobre el pedido
    return pago


def obtener_pagos(cliente=None, compra_id=None):
    """Retorna un queryset de pagos filtrados por cliente o por compra."""
    pagos = Pago.objects.all().order_by('-fecha_pago')
    if cliente:
        pagos = pagos.filter(pedido__cliente=cliente)
    if compra_id:
        pagos = pagos.filter(compra_id=compra_id)
    return pagos


# --- ViewSet ---
class PagoViewSet(viewsets.ViewSet):
    """
    ViewSet unificado para gestionar pagos.
    """
    def get_permissions(self):
        """Define permisos según la acción."""
        if self.action in ['cambiar_estado']:
            permission_classes = [IsAdminUser]
        else:
            permission_classes = [IsAuthenticated]
        return [perm() for perm in permission_classes]

    @action(detail=False, methods=['post'])
    def registrar(self, request):
        """Registrar un pago para un pedido."""
        pedido_id = request.data.get("pedido")  # <-- recibimos "pedido" desde el frontend
        try:
            pedido = Pedido.objects.get(id=pedido_id)
        except Pedido.DoesNotExist:
            return Response({"error": "Pedido no encontrado"}, status=404)

        if pedido.cliente != request.user:
            return Response({"error": "No puedes pagar pedidos de otro usuario"}, status=403)

        serializer = PagoSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Validación del monto
        monto = serializer.validated_data.get("monto")
        if monto != pedido.total:
            return Response({"error": "El monto debe coincidir exactamente con el total del pedido."}, status=400)

        pago = serializer.save()
        pago = procesar_pago(pago)

        return Response({"mensaje": "Pago registrado correctamente", "pago": PagoSerializer(pago).data}, status=201)
    @action(detail=False, methods=['get'])
    def mis_pagos(self, request):
        """Listar todos los pagos del usuario autenticado."""
        pagos = obtener_pagos(cliente=request.user)
        return Response(PagoSerializer(pagos, many=True).data)

    @action(detail=True, methods=['get'], url_path='por-compra')
    def pagos_por_compra(self, request, pk=None):
        """Listar pagos por compra."""
        pagos = obtener_pagos(compra_id=pk)
        return Response(PagoSerializer(pagos, many=True).data)

    @action(detail=True, methods=['patch'], url_path='cambiar-estado')
    def cambiar_estado(self, request, pk=None):
        """Cambiar el estado de un pago (solo admin)."""
        try:
            pago = Pago.objects.get(id=pk)
        except Pago.DoesNotExist:
            return Response({"error": "Pago no encontrado"}, status=404)

        nuevo_estado = request.data.get("estado_pago")
        try:
            pago = procesar_pago(pago, nuevo_estado=nuevo_estado)
        except ValueError as e:
            return Response({"error": str(e)}, status=400)

        return Response({
            "mensaje": "Estado del pago actualizado",
            "pago": PagoSerializer(pago).data,
            "estado_pedido_actual": pago.pedido.estado
        })
