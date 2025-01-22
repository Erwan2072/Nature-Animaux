from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from nature_animaux.mongo_config import products_collection  # Import MongoDB collection
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
        # Récupère les filtres passés dans l'URL
        filter_params = {}
        if 'title' in request.GET:
            filter_params['title'] = request.GET['title']
        if 'category' in request.GET:
            filter_params['category'] = request.GET['category']
        if 'brand' in request.GET:
            filter_params['brand'] = request.GET['brand']

        # Récupère les produits depuis MongoDB en appliquant les filtres
        products = list(products_collection.find(filter_params))

        # Convertit ObjectId en chaîne de caractères
        for product in products:
            product['_id'] = str(product['_id'])

        # Configure la pagination
        paginator = PageNumberPagination()
        paginator.page_size = 10

        # Applique la pagination
        paginated_products = paginator.paginate_queryset(products, request)

        # Retourne une réponse paginée
        return paginator.get_paginated_response(paginated_products)
    except Exception as e:
        return Response({"error": f"Failed to fetch products: {str(e)}"}, status=500)


# Détails d'un produit
@api_view(['GET'])
def product_detail(request, pk):
    try:
        # Vérifie si l'ID est valide
        if not ObjectId.is_valid(pk):
            return Response({"error": "Invalid ID format"}, status=400)

        product = products_collection.find_one({"_id": ObjectId(pk)})
        if product:
            product['_id'] = str(product['_id'])  # Convertit ObjectId en chaîne de caractères
            return Response(product)
        else:
            return Response({"error": "Product not found"}, status=404)
    except Exception as e:
        return Response({"error": f"Failed to fetch product: {str(e)}"}, status=500)

# Création d'un produit
@api_view(['POST'])
def product_create(request):
    try:
        product_data = request.data

        # Validation minimale des données
        required_fields = ["title", "category", "variations"]
        missing_fields = [field for field in required_fields if field not in product_data]
        if missing_fields:
            return Response({"error": f"Missing fields: {', '.join(missing_fields)}"}, status=400)

        result = products_collection.insert_one(product_data)  # Insère un produit
        product_data['_id'] = str(result.inserted_id)  # Ajoute l'ID généré à la réponse
        return Response(product_data, status=201)
    except Exception as e:
        return Response({"error": f"Failed to create product: {str(e)}"}, status=500)

# Mise à jour d'un produit
@api_view(['POST'])
def product_update(request, pk):
    try:
        # Vérifie si l'ID est valide
        if not ObjectId.is_valid(pk):
            return Response({"error": "Invalid ID format"}, status=400)

        product_data = request.data
        result = products_collection.update_one(
            {"_id": ObjectId(pk)}, {"$set": product_data}
        )
        if result.matched_count == 0:
            return Response({"error": "Product not found"}, status=404)
        return Response({"message": "Product updated successfully"})
    except Exception as e:
        return Response({"error": f"Failed to update product: {str(e)}"}, status=500)

# Suppression d'un produit
@api_view(['DELETE'])
def product_delete(request, pk):
    try:
        # Vérifie si l'ID est valide
        if not ObjectId.is_valid(pk):
            return Response({"error": "Invalid ID format"}, status=400)

        result = products_collection.delete_one({"_id": ObjectId(pk)})
        if result.deleted_count == 0:
            return Response({"error": "Product not found"}, status=404)
        return Response({"message": "Product deleted successfully!"})
    except Exception as e:
        return Response({"error": f"Failed to delete product: {str(e)}"}, status=500)
