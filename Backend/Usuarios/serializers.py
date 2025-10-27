from rest_framework import serializers
from .models import Usuario
from django.contrib.auth.password_validation import validate_password

class RegistrarUsuarioSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = Usuario
        fields = ['id', 'username', 'email', 'password', 'password2', 'telefono', 'direccion', "rol"]

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Las contraseñas no coinciden."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        validated_data['rol'] = 'CLIENTE'
        user = Usuario.objects.create_user(**validated_data)
        return user
class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ["id", "username", "email", "telefono", "direccion", "rol"]
        read_only_fields = ["id", "rol"]

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance