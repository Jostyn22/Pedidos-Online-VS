from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from Usuarios.models import Usuario
from Productos.models import Producto, Categoria, Marca
from Pedidos.models import Pedido
from Pagos.models import Pago

class PagoTestsCajaBlanca(APITestCase):

    def setUp(self):
        self.client = APIClient()

        # Usuarios
        self.admin = Usuario.objects.create_user(
            username="admin", password="Admin123!", rol="ADMIN"
        )
        self.cliente = Usuario.objects.create_user(
            username="cliente", password="Cliente123!", rol="CLIENTE"
        )
        self.vendedor = Usuario.objects.create_user(
            username="vendedor", password="Vendedor123!", rol="VENDEDOR"
        )

        # Productos
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

        # Pedido
        self.pedido = Pedido.objects.create(
            cliente=self.cliente,
            vendedor=self.vendedor,
            total=self.producto.precio * 2
        )

    # ============================
    # REGISTRAR PAGO
    # ============================

    def test_registrar_pago_valido(self):
        self.client.force_authenticate(user=self.cliente)
        data = {
            "pedido": self.pedido.id,
            "metodo": "TARJETA",
            "monto": float(self.pedido.total)
        }
        response = self.client.post("/api/pagos/registrar/", data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("mensaje", response.data)

    def test_registrar_pago_monto_incorrecto(self):
        self.client.force_authenticate(user=self.cliente)
        data = {
            "pedido": self.pedido.id,
            "metodo": "TARJETA",
            "monto": 1  # monto incorrecto
        }
        response = self.client.post("/api/pagos/registrar/", data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    # ============================
    # LISTAR PAGOS
    # ============================

    def test_listar_mis_pagos(self):
        Pago.objects.create(
            pedido=self.pedido,
            metodo="TARJETA",
            monto=self.pedido.total
        )
        self.client.force_authenticate(user=self.cliente)
        response = self.client.get("/api/pagos/mis_pagos/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(len(response.data) >= 1)

    def test_listar_pagos_admin(self):
        Pago.objects.create(
            pedido=self.pedido,
            metodo="TARJETA",
            monto=self.pedido.total
        )
        self.client.force_authenticate(user=self.admin)
        response = self.client.get("/api/pagos/admin/listar/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(len(response.data) >= 1)

    # ============================
    # CAMBIAR ESTADO DEL PAGO
    # ============================

    def test_cambiar_estado_pago_no_admin(self):
        pago = Pago.objects.create(
            pedido=self.pedido,
            metodo="TARJETA",
            monto=self.pedido.total
        )
        self.client.force_authenticate(user=self.cliente)
        response = self.client.patch(f"/api/pagos/{pago.id}/cambiar-estado/", {"estado_pago": "PAGADO"})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
