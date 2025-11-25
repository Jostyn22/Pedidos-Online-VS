from rest_framework import generics, permissions, status, generics, permissions, filters
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth.hashers import make_password
from .models import Usuario
from .serializers import UsuarioSerializer, RegistrarUsuarioSerializer
import re
# Registrar usuario
def validar_correo(email):
    return re.match(r'^[A-Za-z0-9._%+-]+@([A-Za-z0-9.-]+\.)?(utm\.edu\.ec|gmail\.com|hotmail\.com|outlook\.com)$', email, re.IGNORECASE)
class RegistrarUsuarioView(generics.CreateAPIView):
    queryset = Usuario.objects.all()
    serializer_class = RegistrarUsuarioSerializer
    permission_classes = [permissions.AllowAny]
    def post(self, request, *args, **kwargs):
        email = request.data.get("email", "").strip().lower()
        patron = re.compile(
            r'^[A-Za-z0-9._%+-]+@([A-Za-z0-9.-]+\.)?(utm\.edu\.ec|gmail\.com|hotmail\.com|outlook\.com)$',
            re.IGNORECASE,
        )
        if not patron.match(email):
            return Response(
                {"error": "El correo debe ser institucional (@utm.edu.ec) o de un dominio válido."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            usuario = serializer.save()
            return Response(
                {
                    "message": "Usuario registrado exitosamente",
                    "usuario": UsuarioSerializer(usuario).data,
                },
                status=status.HTTP_201_CREATED,
            )
        else:
            print("Errores del serializer:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
#Eliminar usuario (solo para administradores)
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

            # Evitar que el administrador se elimine a sí mismo
            if usuario.id == request.user.id:
                return Response(
                    {"detail": "No puedes eliminar tu propia cuenta."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # 🔥 Validar si el usuario tiene pedidos como cliente
            if usuario.pedidos_cliente.exists():
                return Response(
                    {"detail": "No se puede eliminar un usuario que tiene pedidos realizados como cliente."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # 🔥 Validar si el usuario tiene pedidos como vendedor
            if usuario.pedidos_vendedor.exists():
                return Response(
                    {"detail": "No se puede eliminar un usuario que tiene pedidos asignados como vendedor."},
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

# Login con JWT
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
#Actualizar datos del usuario autenticado
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
# Listar todos los usuarios (solo para administradores con filtros)
class ListarUsuariosView(generics.ListAPIView):
    serializer_class = UsuarioSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]  
    search_fields = ["username", "email", "rol"]  # campos donde buscar
    def get_queryset(self):
        # Solo permitir que el admin acceda
        if self.request.user.rol != "ADMIN":
            return Usuario.objects.none()
        queryset = Usuario.objects.all().order_by("id")
        # Filtro por rol 
        rol = self.request.query_params.get("rol")
        if rol:
            queryset = queryset.filter(rol__iexact=rol)
        return queryset
    def list(self, request, *args, **kwargs):
        if request.user.rol != "ADMIN":
            return Response(
                {"detail": "No tienes permiso para acceder a esta información."},
                status=status.HTTP_403_FORBIDDEN,
            )
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
# Cambiar rol de un usuario (solo para administradores)
class CambiarRolUsuarioView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def patch(self, request, pk):
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
            #Validar que el rol sea válido
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
#Verificar correo
class VerificarCorreoView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get("email")
        try:
            usuario = Usuario.objects.get(email=email)
            return Response(
                {"exists": True, "message": "Correo válido."},
                status=status.HTTP_200_OK,
            )
        except Usuario.DoesNotExist:
            return Response(
                {"exists": False, "message": "El correo no está registrado."},
                status=status.HTTP_404_NOT_FOUND,
            )
#Cambiar contraseña
class CambiarContrasenaView(APIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        email = request.data.get("email")
        nueva_contrasena = request.data.get("password")
        try:
            usuario = Usuario.objects.get(email=email)
            usuario.password = make_password(nueva_contrasena)
            usuario.save()
            return Response(
                {"message": "Contraseña actualizada correctamente."},
                status=status.HTTP_200_OK,
            )
        except Usuario.DoesNotExist:
            return Response(
                {"message": "Usuario no encontrado."},
                status=status.HTTP_404_NOT_FOUND,
            )