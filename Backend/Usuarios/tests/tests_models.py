from django.test import TestCase
from Usuarios.models import Usuario
from django.core.exceptions import ValidationError
from django.utils import timezone

class UsuarioModelCajaBlancaTest(TestCase):

    def test_creacion_usuario_por_defecto(self):
        """
        Camino interno:
        - rol no especificado → default = CLIENTE
        """
        usuario = Usuario.objects.create_user(
            username="cliente1",
            password="1234"
        )
        self.assertEqual(usuario.rol, "CLIENTE")
        self.assertIsNotNone(usuario.fecha_registro)

    def test_creacion_usuario_admin(self):
        """
        Camino interno:
        - rol explícito ADMIN
        """
        usuario = Usuario.objects.create_user(
            username="admin1",
            password="1234",
            rol="ADMIN"
        )
        self.assertEqual(usuario.rol, "ADMIN")

    def test_creacion_usuario_vendedor(self):
        usuario = Usuario.objects.create_user(
            username="vendedor1",
            password="1234",
            rol="VENDEDOR"
        )
        self.assertEqual(usuario.rol, "VENDEDOR")

    def test_campos_opcionales_nulos(self):
        """
        telefono y direccion permiten null / blank
        """
        usuario = Usuario.objects.create_user(
            username="user_opcional",
            password="1234"
        )
        self.assertIsNone(usuario.telefono)
        self.assertIsNone(usuario.direccion)

    def test_campos_opcionales_con_valor(self):
        usuario = Usuario.objects.create_user(
            username="user_datos",
            password="1234",
            telefono="0999999999",
            direccion="Av. Siempre Viva"
        )
        self.assertEqual(usuario.telefono, "0999999999")
        self.assertEqual(usuario.direccion, "Av. Siempre Viva")

    def test_metodo_str(self):
        """
        Cubre el método __str__
        """
        usuario = Usuario.objects.create_user(
            username="juan",
            password="1234",
            rol="CLIENTE"
        )
        self.assertEqual(str(usuario), "juan (Cliente)")

    def test_rol_invalido(self):
        """
        Camino de error:
        rol fuera de choices
        """
        usuario = Usuario(
            username="invalido",
            rol="OTRO"
        )
        with self.assertRaises(ValidationError):
            usuario.full_clean()

    def test_fecha_registro_automatica(self):
        usuario = Usuario.objects.create_user(
            username="fecha_test",
            password="1234"
        )
        self.assertLessEqual(usuario.fecha_registro, timezone.now())
