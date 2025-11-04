from rest_framework import routers
from .views import ProductoViewSet, CategoriaViewSet, MarcaViewSet

router = routers.DefaultRouter()
router.register(r'productos', ProductoViewSet)
router.register(r'categorias', CategoriaViewSet)
router.register(r'marcas', MarcaViewSet)

urlpatterns = router.urls
