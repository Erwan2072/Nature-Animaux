from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.pagination import PageNumberPagination
from .serializers import ProductSerializer
from .models import Product
import logging

# Configurer le logger pour le débogage
logger = logging.getLogger(__name__)

# API Overview
@api_view(['GET'])
def api_overview(request):
    """Affiche un aperçu des routes disponibles."""
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
@permission_classes([IsAuthenticated])
def product_list(request):
    """Liste tous les produits avec pagination."""
    try:
        logger.info("Accès à la liste des produits par l'utilisateur : %s", request.user)
        products = Product.find_all()

        # Pagination
        paginator = PageNumberPagination()
        paginator.page_size = 10  # Nombre de produits par page
        paginated_products = paginator.paginate_queryset(products, request)

        # Sérialisation
        serializer = ProductSerializer(paginated_products, many=True)
        return paginator.get_paginated_response(serializer.data)
    except Exception as e:
        logger.error("Erreur lors de la récupération des produits : %s", str(e))
        return Response({"error": f"Erreur interne : {str(e)}"}, status=500)


# Détails d'un produit
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def product_detail(request, pk):
    """Récupère les détails d'un produit."""
    try:
        logger.info("Accès aux détails du produit %s par l'utilisateur : %s", pk, request.user)
        product = Product.find(pk)
        if not product:
            logger.warning("Produit non trouvé : %s", pk)
            return Response({"error": "Produit non trouvé."}, status=404)

        serializer = ProductSerializer(product)
        return Response(serializer.data)
    except Exception as e:
        logger.error("Erreur lors de la récupération du produit %s : %s", pk, str(e))
        return Response({"error": f"Erreur interne : {str(e)}"}, status=500)


# Création d'un produit
@api_view(['POST'])
@permission_classes([IsAdminUser])
def product_create(request):
    """Crée un nouveau produit."""
    try:
        logger.info("Création d'un produit par l'administrateur : %s", request.user)
        serializer = ProductSerializer(data=request.data)
        if serializer.is_valid():
            product = Product(**serializer.validated_data)
            product.save()
            return Response(ProductSerializer(product).data, status=201)

        logger.warning("Échec de la validation : %s", serializer.errors)
        return Response(serializer.errors, status=400)
    except Exception as e:
        logger.error("Erreur lors de la création du produit : %s", str(e))
        return Response({"error": f"Erreur interne : {str(e)}"}, status=500)


# Mise à jour d'un produit
@api_view(['POST'])
@permission_classes([IsAdminUser])
def product_update(request, pk):
    """Met à jour un produit existant."""
    try:
        logger.info("Mise à jour du produit %s par l'administrateur : %s", pk, request.user)
        product = Product.find(pk)
        if not product:
            logger.warning("Produit non trouvé pour mise à jour : %s", pk)
            return Response({"error": "Produit non trouvé."}, status=404)

        serializer = ProductSerializer(product, data=request.data)
        if serializer.is_valid():
            for attr, value in serializer.validated_data.items():
                setattr(product, attr, value)
            product.save()
            return Response(ProductSerializer(product).data)

        logger.warning("Échec de la validation pour mise à jour : %s", serializer.errors)
        return Response(serializer.errors, status=400)
    except Exception as e:
        logger.error("Erreur lors de la mise à jour du produit %s : %s", pk, str(e))
        return Response({"error": f"Erreur interne : {str(e)}"}, status=500)


# Suppression d'un produit
@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def product_delete(request, pk):
    """Supprime un produit."""
    try:
        logger.info("Suppression du produit %s par l'administrateur : %s", pk, request.user)
        product = Product.find(pk)
        if not product:
            logger.warning("Produit non trouvé pour suppression : %s", pk)
            return Response({"error": "Produit non trouvé."}, status=404)

        Product.delete(pk)
        return Response({"message": "Produit supprimé avec succès."})
    except Exception as e:
        logger.error("Erreur lors de la suppression du produit %s : %s", pk, str(e))
        return Response({"error": f"Erreur interne : {str(e)}"}, status=500)
