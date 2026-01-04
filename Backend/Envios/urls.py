from django.urls import path
from .views import (
    CrearEnvioAPIView,
    CambiarEstadoEnvioAPIView,
    EnviosVendedorAPIView
)

urlpatterns = [
    path("crear/<int:pedido_id>/", CrearEnvioAPIView.as_view()),
    path("estado/<int:envio_id>/", CambiarEstadoEnvioAPIView.as_view()),
    path("vendedor/", EnviosVendedorAPIView.as_view()),
]
