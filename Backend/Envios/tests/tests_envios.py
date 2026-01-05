from django.test import TestCase
from django.contrib.auth import get_user_model
from Envios.models import Envio
from Pedidos.models import Pedido

Usuario = get_user_model()

class EnvioTestsSimples(TestCase):

    def crear_usuario(self):
        return Usuario.objects.create_user(username="usuario_test", password="123456")

    def crear_pedido(self):
        usuario = self.crear_usuario()
        return Pedido.objects.create(cliente=usuario, total=50)

    def test_crear_envio(self):
        pedido = self.crear_pedido()
        envio = Envio.objects.create(pedido=pedido, direccion_envio="Calle Falsa 123", estado="PENDIENTE")
        self.assertEqual(envio.estado, "PENDIENTE")
        self.assertEqual(envio.direccion_envio, "Calle Falsa 123")

    def test_cambiar_estado_envio(self):
        pedido = self.crear_pedido()
        envio = Envio.objects.create(pedido=pedido, direccion_envio="Calle Falsa 123", estado="PENDIENTE")
        envio.estado = "EN_CAMINO"
        envio.save()
        envio.refresh_from_db()
        self.assertEqual(envio.estado, "EN_CAMINO")

    def test_eliminar_envio(self):
        pedido = self.crear_pedido()
        envio = Envio.objects.create(pedido=pedido, direccion_envio="Calle Falsa 123", estado="PENDIENTE")
        envio.delete()
        self.assertFalse(Envio.objects.filter(pk=envio.pk).exists())
