# Envios/apps.py
from django.apps import AppConfig

class EnviosConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "Envios"

    def ready(self):
        # Importamos los signals para que se registren
        import Envios.signals
