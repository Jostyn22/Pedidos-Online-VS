from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from Usuarios.models import Usuario
from rest_framework.test import force_authenticate

User = get_user_model()


# ======================================================
# REGISTRO DE USUARIOS
# ======================================================
class RegistrarUsuarioTests(APITestCase):

    def setUp(self):
        self.client = APIClient()
        self.url = reverse("registrar_usuario")

    def test_registro_exitoso(self):
        data = {
            "username": "usuario_test",
            "email": "usuario@gmail.com",
            "password": "Password123!",
            "password2": "Password123!"
        }

        response = self.client.post(self.url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username="usuario_test").exists())


# ======================================================
# LOGIN
# ======================================================
class LoginTests(APITestCase):

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="usuario_login",
            password="Password123!",
            rol="CLIENTE"
        )
        self.url = reverse("login_usuario")

    def test_login_correcto(self):
        response = self.client.post(
            self.url,
            {"username": "usuario_login", "password": "Password123!"},
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_login_incorrecto(self):
        response = self.client.post(
            self.url,
            {"username": "usuario_login", "password": "mal"},
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


# ======================================================
# USUARIO ACTUAL
# ======================================================
class UsuarioActualTests(APITestCase):

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="actual",
            password="Password123!",
            rol="CLIENTE"
        )
        self.url = reverse("usuario_actual")

    def test_autenticado(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_no_autenticado(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


# ======================================================
# LISTAR USUARIOS (ADMIN)
# ======================================================
class ListarUsuariosTests(APITestCase):

    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_user(
            username="admin",
            password="Admin123!",
            rol="ADMIN"
        )
        self.user = User.objects.create_user(
            username="normal",
            password="Password123!",
            rol="CLIENTE"
        )
        self.url = reverse("listar_usuarios")

    def test_admin_puede_listar(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_no_admin_no_puede_listar(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


# ======================================================
# CAMBIAR ROL
# ======================================================
class CambiarRolUsuarioTests(APITestCase):

    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_user(
            username="admin_rol",
            password="Admin123!",
            rol="ADMIN"
        )
        self.user = User.objects.create_user(
            username="usuario_rol",
            password="Password123!",
            rol="CLIENTE"
        )
        self.url = reverse("cambiar_rol_usuario", args=[self.user.id])

    def test_admin_cambia_rol(self):
        self.client.force_authenticate(user=self.admin)

        response = self.client.patch(
            self.url, {"rol": "VENDEDOR"}, format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_rol_invalido(self):
        self.client.force_authenticate(user=self.admin)

        response = self.client.patch(
            self.url, {"rol": "ROL_FALSO"}, format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_usuario_no_existe(self):
        self.client.force_authenticate(user=self.admin)

        url = reverse("cambiar_rol_usuario", args=[9999])
        response = self.client.patch(
            url, {"rol": "CLIENTE"}, format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


# ======================================================
# ELIMINAR USUARIO
# ======================================================
class EliminarUsuarioTests(APITestCase):

    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_user(
            username="admin_delete",
            password="Admin123!",
            rol="ADMIN"
        )
        self.user = User.objects.create_user(
            username="usuario_delete",
            password="Password123!",
            rol="CLIENTE"
        )
        self.url = reverse("eliminar_usuario", args=[self.user.id])

    def test_admin_elimina(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_no_admin_no_puede(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
class VerificarCorreoTests(APITestCase):

    def setUp(self):
        self.usuario = Usuario.objects.create_user(
            username="testuser",
            email="test@gmail.com",
            password="123456"
        )
        self.url = reverse("verificar_correo")

    def test_correo_existe(self):
        response = self.client.post(self.url, {
            "email": "test@gmail.com"
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["exists"])

    def test_correo_no_existe(self):
        response = self.client.post(self.url, {
            "email": "noexiste@gmail.com"
        })
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertFalse(response.data["exists"])


class CambiarContrasenaTests(APITestCase):

    def setUp(self):
        self.usuario = Usuario.objects.create_user(
            username="testuser",
            email="test@gmail.com",
            password="123456"
        )
        self.url = reverse("cambiar_contrasena")

    def test_cambio_contrasena_exitoso(self):
        response = self.client.post(self.url, {
            "email": "test@gmail.com",
            "password": "nuevapass123"
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Verificar que la contraseña realmente cambió
        self.usuario.refresh_from_db()
        self.assertTrue(self.usuario.check_password("nuevapass123"))

    def test_usuario_no_existe(self):
        response = self.client.post(self.url, {
            "email": "noexiste@gmail.com",
            "password": "123456"
        })
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
class ActualizarUsuarioTests(APITestCase):

    def setUp(self):
        self.usuario = Usuario.objects.create_user(
            username="testuser",
            email="test@gmail.com",
            password="123456"
        )
        self.url = reverse("actualizar_usuario")

    def test_usuario_autenticado_actualiza_datos(self):
        self.client.force_authenticate(user=self.usuario)

        response = self.client.put(self.url, {
            "username": "nuevo_nombre",
            "email": "nuevo@gmail.com"
        })

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.usuario.refresh_from_db()
        self.assertEqual(self.usuario.username, "nuevo_nombre")
        self.assertEqual(self.usuario.email, "nuevo@gmail.com")

    def test_usuario_no_autenticado_no_puede_actualizar(self):
        response = self.client.put(self.url, {
            "username": "nuevo_nombre"
        })

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
class EliminarUsuarioTests(APITestCase):

    def setUp(self):
        self.admin = Usuario.objects.create_user(
            username="admin",
            email="admin@gmail.com",
            password="123456",
            rol="ADMIN"
        )

        self.usuario = Usuario.objects.create_user(
            username="cliente",
            email="cliente@gmail.com",
            password="123456",
            rol="CLIENTE"
        )

        self.url = lambda pk: reverse("eliminar_usuario", args=[pk])

    def test_admin_elimina_usuario(self):
        self.client.force_authenticate(user=self.admin)

        response = self.client.delete(self.url(self.usuario.id))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(Usuario.objects.filter(id=self.usuario.id).exists())

    def test_no_admin_no_puede_eliminar(self):
        self.client.force_authenticate(user=self.usuario)

        response = self.client.delete(self.url(self.admin.id))

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_no_puede_eliminarse_a_si_mismo(self):
        self.client.force_authenticate(user=self.admin)

        response = self.client.delete(self.url(self.admin.id))

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_usuario_no_existe(self):
        self.client.force_authenticate(user=self.admin)

        response = self.client.delete(self.url(9999))

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
