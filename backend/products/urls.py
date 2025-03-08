from django.urls import path
from .views import (
    api_overview,
    product_list,
    product_detail,
    product_create,
    product_update,
    product_delete,
)

urlpatterns = [
    path('api-overview/', api_overview, name='api-overview'),
    path('product-list/', product_list, name='product-list'),  # ✅ Liste des produits
    path('product-detail/<str:pk>/', product_detail, name='product-detail'),  # ✅ Détails d'un produit
    path('product-create/', product_create, name='product-create'),  # ✅ Création
    path('product-update/<str:pk>/', product_update, name='product-update'),  # ✅ Mise à jour
    path('product-delete/<str:pk>/', product_delete, name='product-delete'),  # ✅ Suppression
]
