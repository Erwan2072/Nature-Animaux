from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework.permissions import AllowAny
from .views import home  # ✅ Importer la vue home


# ✅ Configuration de Swagger & Redoc
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
     # ✅ Route racine
    path('', home, name="home"),  # ✅ Ajout de la route racine
    # ✅ Admin Panel Django
    path('admin/', admin.site.urls),

    # ✅ Produits (produits stockés en MongoDB)
    path('products/', include(('products.urls', 'products'), namespace='products')),

    # ✅ Authentification & Utilisateurs
    path('api/', include(('users.urls', 'users'), namespace='users')),  # Auth & users API

    # ✅ Documentation Swagger & Redoc
    path('swagger.json', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),

    # ✅ Authentification Allauth
    path('accounts/', include('allauth.urls')),
]

# ✅ Servir les fichiers statiques en mode développement
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)


