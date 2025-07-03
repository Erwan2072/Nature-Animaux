from django.urls import path
from . import views

app_name = 'products'

urlpatterns = [
    path('', views.product_list, name='product-list'),  # Route racine pour /products/
    path('product-detail/<str:pk>/', views.product_detail, name='product-detail'),
    path('product-create/', views.product_create, name='product-create'),
    path('product-update/<str:pk>/', views.product_update, name='product-update'),
    path('product-delete/<str:pk>/', views.product_delete, name='product-delete'),
]
