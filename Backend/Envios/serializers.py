from rest_framework import serializers
from .models import Envio

class EnvioSerializer(serializers.ModelSerializer):

    class Meta:
        model = Envio
        fields = "__all__"
        read_only_fields = (
            "estado",
            "fecha_envio",
            "fecha_entrega",
            "creado_en",
            "actualizado_en",
        )
