from django.urls import path
from .views import ConfirmarCompraView, ComprasClienteView

urlpatterns = [
    path('confirmar/', ConfirmarCompraView.as_view()),
    path('cliente/', ComprasClienteView.as_view()),
]
