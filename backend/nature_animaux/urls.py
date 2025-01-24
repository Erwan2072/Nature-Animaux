"""
URL configuration for nature_animaux project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework.permissions import AllowAny

# Configuration de Swagger et Redoc
schema_view = get_schema_view(
    openapi.Info(
        title="Nature & Animaux API",
        default_version='v1',
        description="Documentation interactive des endpoints de l'API",
        terms_of_service="https://www.google.com/policies/terms/",
        contact=openapi.Contact(email="contact@nature-animaux.fr"),
        license=openapi.License(name="MIT License"),
    ),
    public=True,
    permission_classes=[AllowAny],
)

urlpatterns = [
    path('admin/', admin.site.urls),  # Route pour l'administration
    path('products/', include('products.urls')),  # Inclusion des routes de l'app "products"
    path('swagger.json', schema_view.without_ui(cache_timeout=0), name='schema-json'),  # Route pour le schéma JSON
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),  # Redoc directement via drf-yasg
]

# Configuration pour servir les fichiers statiques en mode développement
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
