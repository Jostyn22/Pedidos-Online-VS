from rest_framework import routers
from django.urls import path
from .views import ProductoViewSet, CategoriaViewSet, MarcaViewSet
from .views import toggle_activo

router = routers.DefaultRouter()
router.register(r'productos', ProductoViewSet, basename='productos')  
router.register(r'categorias', CategoriaViewSet)
router.register(r'marcas', MarcaViewSet)
urlpatterns = router.urls + [
    path("productos/toggle/<int:producto_id>/", toggle_activo),
]