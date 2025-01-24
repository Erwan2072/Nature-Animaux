from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser  # Import des permissions
from rest_framework.pagination import PageNumberPagination
from .serializers import ProductSerializer  # Import du sérialiseur
from .models import Product  # Import du modèle
from bson import ObjectId  # Pour manipuler les ObjectId MongoDB

# API Overview
@api_view(['GET'])
def api_overview(request):
    api_urls = {
        'List': '/product-list/',
        'Detail': '/product-detail/<str:pk>/',
        'Create': '/product-create/',
        'Update': '/product-update/<str:pk>/',
        'Delete': '/product-delete/<str:pk>/',
    }
    return Response(api_urls)

# Liste tous les produits
@api_view(['GET'])
def product_list(request):
    try:
        # Récupère les produits via le modèle
        products = Product.all()

        # Pagination
        paginator = PageNumberPagination()
        paginator.page_size = 10
        paginated_products = paginator.paginate_queryset(products, request)

        # Sérialisation des données
        serializer = ProductSerializer(paginated_products, many=True)
        return paginator.get_paginated_response(serializer.data)
    except Exception as e:
        return Response({"error": f"Failed to fetch products: {str(e)}"}, status=500)

# Détails d'un produit
@api_view(['GET'])
def product_detail(request, pk):
    try:
        # Récupère le produit par ID
        product = Product.find(pk)
        if not product:
            return Response({"error": "Product not found"}, status=404)

        # Sérialisation des données
        serializer = ProductSerializer(product)
        return Response(serializer.data)
    except Exception as e:
        return Response({"error": f"Failed to fetch product: {str(e)}"}, status=500)

# Création d'un produit
@api_view(['POST'])
@permission_classes([IsAdminUser])  # Limite l'accès aux administrateurs
def product_create(request):
    serializer = ProductSerializer(data=request.data)
    if serializer.is_valid():
        # Crée un produit à partir des données validées
        product = Product(**serializer.validated_data)
        product.save()
        return Response(ProductSerializer(product).data, status=201)
    return Response(serializer.errors, status=400)

# Mise à jour d'un produit
@api_view(['POST'])
@permission_classes([IsAdminUser])  # Limite l'accès aux administrateurs
def product_update(request, pk):
    product = Product.find(pk)
    if not product:
        return Response({"error": "Product not found"}, status=404)

    serializer = ProductSerializer(product, data=request.data)
    if serializer.is_valid():
        # Met à jour les attributs du produit
        for attr, value in serializer.validated_data.items():
            setattr(product, attr, value)
        product.save()
        return Response(ProductSerializer(product).data)
    return Response(serializer.errors, status=400)

# Suppression d'un produit
@api_view(['DELETE'])
@permission_classes([IsAdminUser])  # Limite l'accès aux administrateurs
def product_delete(request, pk):
    product = Product.find(pk)
    if not product:
        return Response({"error": "Product not found"}, status=404)

    Product.delete(pk)
    return Response({"message": "Product deleted successfully!"})
