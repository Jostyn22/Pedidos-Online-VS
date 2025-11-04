from django.urls import path
from .views import (
    RegistrarUsuarioView,
    LoginView,
    UsuarioActualView,
    ListarUsuariosView,
    CambiarRolUsuarioView,
    EliminarUsuarioView,
    ActualizarUsuarioView,
    VerificarCorreoView, 
    CambiarContrasenaView,

)

urlpatterns = [
    #Autenticación y registro
    path('registrar/', RegistrarUsuarioView.as_view(), name='registrar_usuario'),
    path('login/', LoginView.as_view(), name='login_usuario'),
    path('actual/', UsuarioActualView.as_view(), name='usuario_actual'),
    path('actualizar/', ActualizarUsuarioView.as_view(), name='actualizar_usuario'),
    path("recuperar/verificar/", VerificarCorreoView.as_view(), name="verificar_correo"),
    path("recuperar/cambiar/", CambiarContrasenaView.as_view(), name="cambiar_contrasena"), 
    #Endpoints de administración
    path('listar/', ListarUsuariosView.as_view(), name='listar_usuarios'),
    path('cambiar_rol/<int:pk>/', CambiarRolUsuarioView.as_view(), name='cambiar_rol_usuario'),
    path('eliminar/<int:pk>/', EliminarUsuarioView.as_view(), name='eliminar_usuario'),
    
]
