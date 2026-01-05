from decimal import Decimal
from django.test import TestCase
from Usuarios.models import Usuario
from Productos.models import Producto
from Compras.models import Compra, CompraDetalle

class ComprasTestsSimples(TestCase):
    def setUp(self):
        # Usuarios
        self.vendedor = Usuario.objects.create_user(username="vendedor1", password="1234")
        self.cliente = Usuario.objects.create_user(username="cliente1", password="1234")

        # Producto
        self.producto = Producto.objects.create(
            nombre="Producto Simple",
            precio=Decimal("15.00"),  
            stock=10,
            vendedor=self.vendedor
        )

        # Compra
        self.compra = Compra.objects.create(
            cliente=self.cliente,
            total=Decimal("15.00")  
        )

        CompraDetalle.objects.create(
            compra=self.compra,
            producto=self.producto,
            cantidad=1,
            precio=Decimal("15.00")  
        )

    def test_compra_creada(self):
        self.assertEqual(Compra.objects.count(), 1)
        self.assertEqual(self.compra.cliente.username, "cliente1")
        self.assertEqual(self.compra.total, Decimal("15.00"))

    def test_detalle_compra(self):
        detalle = CompraDetalle.objects.get(compra=self.compra)
        self.assertEqual(detalle.producto.nombre, "Producto Simple")
        self.assertEqual(detalle.cantidad, 1)
        self.assertEqual(detalle.precio, Decimal("15.00"))  
