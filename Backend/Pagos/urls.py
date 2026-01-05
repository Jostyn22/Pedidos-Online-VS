from rest_framework.routers import DefaultRouter
from .views import PagoViewSet

router = DefaultRouter()
router.register(r'', PagoViewSet, basename='pagos')  

urlpatterns = router.urls

