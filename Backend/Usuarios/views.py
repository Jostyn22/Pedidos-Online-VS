from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import Usuario
from .serializers import UsuarioSerializer, RegistrarUsuarioSerializer
# Registrar usuario
class RegistrarUsuarioView(generics.CreateAPIView):
    queryset = Usuario.objects.all()
    serializer_class = RegistrarUsuarioSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            usuario = serializer.save()
            return Response(
                {
                    "message": "Usuario registrado exitosamente ✅",
                    "usuario": UsuarioSerializer(usuario).data,
                },
                status=status.HTTP_201_CREATED,
            )
        else:
            print("❌ Errores del serializer:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
# 🗑️ Eliminar usuario (solo para administradores)
class EliminarUsuarioView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, pk):
        # Solo los administradores pueden eliminar
        if request.user.rol != "ADMIN":
            return Response(
                {"detail": "No tienes permiso para eliminar usuarios."},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            usuario = Usuario.objects.get(pk=pk)

            # 🚫 Evitar que el administrador se elimine a sí mismo
            if usuario.id == request.user.id:
                return Response(
                    {"detail": "No puedes eliminar tu propia cuenta."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            usuario.delete()
            return Response(
                {"message": f"Usuario '{usuario.username}' eliminado correctamente."},
                status=status.HTTP_200_OK,
            )

        except Usuario.DoesNotExist:
            return Response(
                {"detail": "Usuario no encontrado."},
                status=status.HTTP_404_NOT_FOUND,
            )

# 🟡 Login con JWT
class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        user = authenticate(username=username, password=password)
        if user is not None:
            refresh = RefreshToken.for_user(user)
            return Response(
                {
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                    "username": user.username,
                    "rol": user.rol,
                }
            )
        else:
            return Response(
                {"error": "Credenciales incorrectas"},
                status=status.HTTP_400_BAD_REQUEST,
            )
# Actualizar datos del usuario autenticado
class ActualizarUsuarioView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request):
        usuario = request.user
        serializer = UsuarioSerializer(usuario, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "Datos de la cuenta actualizados correctamente ", "usuario": serializer.data},
                status=status.HTTP_200_OK,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
# Obtener y actualizar usuario actual autenticado
class UsuarioActualView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UsuarioSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        usuario = request.user
        serializer = UsuarioSerializer(usuario, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(
                {
                    "usuario": serializer.data,
                },
                status=status.HTTP_200_OK,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Listar todos los usuarios (solo para administradores)
class ListarUsuariosView(generics.ListAPIView):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        # Solo permitir al admin acceder
        if request.user.rol != "ADMIN":
            return Response(
                {"detail": "No tienes permiso para acceder a esta información."},
                status=status.HTTP_403_FORBIDDEN,
            )
        usuarios = Usuario.objects.all().order_by("id")
        serializer = self.get_serializer(usuarios, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
# Cambiar rol de un usuario (solo para administradores)
class CambiarRolUsuarioView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        # Solo los administradores pueden modificar roles
        if request.user.rol != "ADMIN":
            return Response(
                {"detail": "No tienes permiso para modificar roles."},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            usuario = Usuario.objects.get(pk=pk)
            if usuario.id == request.user.id:
                return Response(
                    {"detail": "No puedes cambiar tu propio rol como administrador."},
                    status=status.HTTP_403_FORBIDDEN,
                )

            nuevo_rol = request.data.get("rol")

            # 🔍 Validar que el rol sea válido
            if nuevo_rol not in ["ADMIN", "CLIENTE", "VENDEDOR", "REPARTIDOR"]:
                return Response(
                    {"detail": "Rol no válido."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            usuario.rol = nuevo_rol
            usuario.save()

            return Response(
                {"message": f"Rol del usuario '{usuario.username}' actualizado a {nuevo_rol}"},
                status=status.HTTP_200_OK,
            )

        except Usuario.DoesNotExist:
            return Response(
                {"detail": "Usuario no encontrado."},
                status=status.HTTP_404_NOT_FOUND,
            )
