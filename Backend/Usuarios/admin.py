from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Usuario
@admin.register(Usuario)
class UsuarioAdmin(UserAdmin):
    list_display = ('username', 'email', 'rol', 'is_active', 'is_staff', 'fecha_registro')
    search_fields = ('username', 'email', 'rol')
    list_filter = ('rol', 'is_active', 'is_staff')
    ordering = ('-fecha_registro',)

    fieldsets = (
        ('Credenciales', {'fields': ('username', 'password')}),
        ('Información personal', {'fields': ('first_name', 'last_name', 'email', 'telefono', 'direccion')}),
        ('Permisos y roles', {'fields': ('rol', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Fechas importantes', {'fields': ('last_login', 'date_joined', 'fecha_registro')}),
    )

    add_fieldsets = (
        ('Registrar nuevo usuario', {
            'classes': ('wide',),
            'fields': ('username', 'email', 'password1', 'password2', 'rol', 'telefono', 'direccion', 'is_staff', 'is_active')}
        ),
    )
