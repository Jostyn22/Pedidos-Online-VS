from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.urls import reverse
from Usuarios.models import Usuario
from Productos.models import Producto, Categoria, Marca
from Pedidos.models import Pedido, PedidoDetalle

class PedidoTestsCajaBlanca(APITestCase):

    def setUp(self):
        self.client = APIClient()

        # Usuarios
        self.admin = Usuario.objects.create_user(username="admin", password="Admin123!", rol="ADMIN")
        self.vendedor = Usuario.objects.create_user(username="vendedor", password="Vendedor123!", rol="VENDEDOR")
        self.cliente = Usuario.objects.create_user(username="cliente", password="Cliente123!", rol="CLIENTE")

        # Producto
        self.categoria = Categoria.objects.create(nombre="Electrónica")
        self.marca = Marca.objects.create(nombre="Samsung")
        self.producto = Producto.objects.create(
            vendedor=self.vendedor,
            nombre="Celular",
            precio_costo=100,
            porcentaje_ganancia=20,
            stock=10,
            categoria=self.categoria,
            marca=self.marca
        )

        # Pedido inicial
        self.pedido = Pedido.objects.create(cliente=self.cliente, vendedor=self.vendedor, total=0)
        self.detalle = PedidoDetalle.objects.create(pedido=self.pedido, producto=self.producto, cantidad=2, precio=self.producto.precio)
        self.pedido.total = self.detalle.subtotal()
        self.pedido.save()

    # =========================
    # CREAR PEDIDO
    # =========================
    def test_crear_pedido_exitoso(self):
        self.client.force_authenticate(user=self.cliente)
        data = {"carrito": [{"producto_id": self.producto.id, "cantidad": 3}]}
        response = self.client.post(reverse("crear_pedido"), data, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertIn("pedido_id", response.data)

    def test_crear_pedido_carrito_vacio(self):
        self.client.force_authenticate(user=self.cliente)
        response = self.client.post(reverse("crear_pedido"), {"carrito": []}, format='json')
        self.assertEqual(response.status_code, 400)

    def test_crear_pedido_stock_insuficiente(self):
        self.client.force_authenticate(user=self.cliente)
        data = {"carrito": [{"producto_id": self.producto.id, "cantidad": 1000}]}
        response = self.client.post(reverse("crear_pedido"), data, format='json')
        self.assertEqual(response.status_code, 400)

    # =========================
    # LISTADOS
    # =========================
    def test_pedidos_cliente_lista(self):
        self.client.force_authenticate(user=self.cliente)
        response = self.client.get(reverse("pedidos_cliente"))
        self.assertEqual(response.status_code, 200)
        for pedido in response.data:
            self.assertEqual(pedido["cliente"], self.cliente.id)

    def test_pedidos_vendedor_lista(self):
        self.client.force_authenticate(user=self.vendedor)
        response = self.client.get(reverse("pedidos_vendedor"))
        self.assertEqual(response.status_code, 200)
        for pedido in response.data:
            self.assertEqual(pedido["vendedor"], self.vendedor.id)

    def test_pedidos_vendedor_no_es_vendedor(self):
        self.client.force_authenticate(user=self.cliente)
        response = self.client.get(reverse("pedidos_vendedor"))
        self.assertEqual(response.status_code, 403)

    # =========================
    # CAMBIAR ESTADO
    # =========================
    def test_cambiar_estado_exitoso(self):
        self.client.force_authenticate(user=self.vendedor)
        response = self.client.patch(reverse("cambiar_estado_pedido", args=[self.pedido.id]))
        self.assertEqual(response.status_code, 200)
        self.pedido.refresh_from_db()
        self.assertNotEqual(self.pedido.estado, "PENDIENTE")

    def test_cambiar_estado_no_permisos(self):
        self.client.force_authenticate(user=self.cliente)
        response = self.client.patch(reverse("cambiar_estado_pedido", args=[self.pedido.id]))
        self.assertEqual(response.status_code, 403)

    def test_cambiar_estado_pedido_no_existe(self):
        self.client.force_authenticate(user=self.vendedor)
        response = self.client.patch(reverse("cambiar_estado_pedido", args=[9999]))
        self.assertEqual(response.status_code, 404)

