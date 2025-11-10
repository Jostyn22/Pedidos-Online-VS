from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    crear_pedido,
    pedidos_cliente,
    pedidos_vendedor,
    cambiar_estado_pedido,
    imprimir_pedido,
    EliminarPedidoView,
    PedidoAdminViewSet
)
router = DefaultRouter()
router.register(r'', PedidoAdminViewSet, basename='pedidos')  
urlpatterns = [
    path("crear/", crear_pedido, name="crear_pedido"),
    path("cliente/", pedidos_cliente, name="pedidos_cliente"),
    path("vendedor/", pedidos_vendedor, name="pedidos_vendedor"),
    path("estado/<int:pedido_id>/", cambiar_estado_pedido, name="cambiar_estado_pedido"),
    path("", include(router.urls)),
    path('eliminar/<int:pedido_id>/', EliminarPedidoView.as_view()),
    path("imprimir/<int:pedido_id>/", imprimir_pedido, name="imprimir_pedido"),
]
