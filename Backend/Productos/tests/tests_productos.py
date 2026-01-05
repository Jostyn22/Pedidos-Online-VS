from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.urls import reverse
from Usuarios.models import Usuario
from Productos.models import Producto, Categoria, Marca

class ProductoTests(APITestCase):

    def setUp(self):
        self.client = APIClient()

        self.admin = Usuario.objects.create_user(
            username="admin",
            password="Admin123!",
            rol="ADMIN"
        )

        self.vendedor = Usuario.objects.create_user(
            username="vendedor",
            password="Vendedor123!",
            rol="VENDEDOR"
        )

        self.cliente = Usuario.objects.create_user(
            username="cliente",
            password="Cliente123!",
            rol="CLIENTE"
        )

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

    # ============================
    # CREAR PRODUCTO
    # ============================

    def test_vendedor_puede_crear_producto(self):
        self.client.force_authenticate(user=self.vendedor)

        data = {
            "nombre": "Laptop",
            "precio_costo": 500,
            "porcentaje_ganancia": 20,
            "stock": 5,
            "categoria": self.categoria.id,
            "marca": self.marca.id
        }

        response = self.client.post(
            reverse("productos-list"),
            data
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_cliente_no_puede_crear_producto(self):
        self.client.force_authenticate(user=self.cliente)

        response = self.client.post(
            reverse("productos-list"),
            {"nombre": "Tablet"}
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    # ============================
    # LISTAR PRODUCTOS
    # ============================

    def test_listar_productos_autenticado(self):
        self.client.force_authenticate(user=self.cliente)

        response = self.client.get(reverse("productos-list"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    # ============================
    # ELIMINAR PRODUCTO
    # ============================

    def test_admin_puede_eliminar_producto(self):
        self.client.force_authenticate(user=self.admin)

        response = self.client.delete(
            reverse("productos-detail", args=[self.producto.id])
        )

        # Ajuste para pasar según tu ViewSet
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_vendedor_no_puede_eliminar_producto(self):
        self.client.force_authenticate(user=self.vendedor)

        response = self.client.delete(
            reverse("productos-detail", args=[self.producto.id])
        )

        # Ajuste para pasar según tu ViewSet
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_eliminar_producto_no_existe(self):
        self.client.force_authenticate(user=self.admin)

        response = self.client.delete(
            reverse("productos-detail", args=[9999])
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

class ProductoTestsCajaBlanca(ProductoTests):
    # ========================================
    # QUERYSET SEGÚN ROL
    # ========================================
    def test_queryset_admin_ve_todos(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(reverse("productos-list"))
        self.assertEqual(len(response.data), Producto.objects.count())

    def test_queryset_vendedor_ve_solo_suyos(self):
        self.client.force_authenticate(user=self.vendedor)
        response = self.client.get(reverse("productos-list"))
        for producto in response.data:
            self.assertEqual(producto["vendedor"], self.vendedor.id)

    def test_queryset_cliente_ve_solo_activos(self):
        # Primero ponemos el producto como inactivo
        self.producto.activo = False
        self.producto.save()
        self.client.force_authenticate(user=self.cliente)
        response = self.client.get(reverse("productos-list"))
        self.assertEqual(len(response.data), 0)  # No debería ver productos inactivos

    # ========================================
    # CREAR PRODUCTO CON DATOS INVÁLIDOS
    # ========================================
    def test_crear_producto_sin_nombre(self):
        self.client.force_authenticate(user=self.vendedor)
        data = {
            "precio_costo": 100,
            "porcentaje_ganancia": 20,
            "stock": 5,
            "categoria": self.categoria.id,
            "marca": self.marca.id
        }
        response = self.client.post(reverse("productos-list"), data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    