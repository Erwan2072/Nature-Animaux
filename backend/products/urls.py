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
    path('', api_overview, name='api-overview'),
    path('product-list/', product_list, name='product-list'),
    path('product-detail/<str:pk>/', product_detail, name='product-detail'),
    path('product-create/', product_create, name='product-create'),
    path('product-update/<str:pk>/', product_update, name='product-update'),
    path('product-delete/<str:pk>/', product_delete, name='product-delete'),
]
