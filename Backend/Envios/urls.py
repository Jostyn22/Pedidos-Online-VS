from django.urls import path
from .views import (
    CrearEnvioAPIView,
    EnviosVendedorAPIView,
    CambiarEstadoEnvioAPIView,
    ListarEnviosAdminAPIView,
    EliminarEnvioAdminAPIView
)

urlpatterns = [
    # Crear un envío para un pedido específico
    path('crear/<int:pedido_id>/', CrearEnvioAPIView.as_view(), name='crear_envio'),

    # Listar envíos del vendedor logueado
    path('vendedor/', EnviosVendedorAPIView.as_view(), name='envios_vendedor'),

    # Cambiar el estado de un envío específico
    path('cambiar-estado/<int:envio_id>/', CambiarEstadoEnvioAPIView.as_view(), name='cambiar_estado_envio'),

    # Listar todos los envíos (solo admin)
    path('admin/listar/', ListarEnviosAdminAPIView.as_view(), name='listar_envios_admin'),

    # Eliminar un envío (solo admin)
    path('admin/eliminar/<int:pk>/', EliminarEnvioAdminAPIView.as_view(), name='eliminar_envio_admin'),
]
