from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from .models import Envio
from .serializers import EnvioSerializer
from Pedidos.models import Pedido

class CrearEnvioAPIView(APIView):

    def post(self, request, pedido_id):

        try:
            pedido = Pedido.objects.get(id=pedido_id)
        except Pedido.DoesNotExist:
            return Response(
                {"error": "Pedido no encontrado"},
                status=status.HTTP_404_NOT_FOUND
            )

        if pedido.estado != "LISTO":
            return Response(
                {"error": "El pedido aún no está listo para envío"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if hasattr(pedido, "envio"):
            return Response(
                {"error": "Este pedido ya tiene un envío"},
                status=status.HTTP_400_BAD_REQUEST
            )

        direccion = request.data.get("direccion_envio")
        if not direccion:
            return Response(
                {"error": "Debe proporcionar una dirección de envío"},
                status=status.HTTP_400_BAD_REQUEST
            )

        envio = Envio.objects.create(
            pedido=pedido,
            direccion_envio=direccion
        )

        serializer = EnvioSerializer(envio)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
class EnviosVendedorAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        usuario = request.user

        envios = Envio.objects.filter(
            pedido__vendedor=usuario
        ).select_related("pedido")

        serializer = EnvioSerializer(envios, many=True)
        return Response(serializer.data)
class CambiarEstadoEnvioAPIView(APIView):

    def patch(self, request, envio_id):
        try:
            envio = Envio.objects.get(id=envio_id)
        except Envio.DoesNotExist:
            return Response(
                {"error": "Envío no encontrado"},
                status=status.HTTP_404_NOT_FOUND
            )

        # Flujo automático de estados
        if envio.estado == "PENDIENTE":
            envio.estado = "EN_CAMINO"
            envio.fecha_envio = timezone.now()

        elif envio.estado == "EN_CAMINO":
            envio.estado = "ENTREGADO"
            envio.fecha_entrega = timezone.now()

            # sincronizar pedido
            envio.pedido.estado = "ENTREGADO"
            envio.pedido.save()

        else:
            return Response(
                {"error": "El envío ya fue completado"},
                status=status.HTTP_400_BAD_REQUEST
            )

        envio.save()

        return Response(
            {"mensaje": "Estado del envío actualizado"},
            status=status.HTTP_200_OK
        )
