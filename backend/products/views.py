from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.pagination import PageNumberPagination
from bson import ObjectId, errors
from .serializers import ProductSerializer
from nature_animaux.mongo_config import products_collection
import logging

# Configuration du logger
logger = logging.getLogger(__name__)

# ✅ API Overview
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


# ✅ Liste des produits
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def product_list(request):
    """Liste tous les produits avec pagination."""
    try:
        logger.info(f"Accès à la liste des produits par l'utilisateur : {request.user}")

        products = list(products_collection.find({}))

        if not products:
            return Response({"message": "Aucun produit trouvé."}, status=200)

        # Pagination
        paginator = PageNumberPagination()
        paginator.page_size = 10
        paginated_products = paginator.paginate_queryset(products, request)

        # Sérialisation avec conversion ObjectId en str
        for product in paginated_products:
            product["_id"] = str(product["_id"])

        serializer = ProductSerializer(paginated_products, many=True)
        return paginator.get_paginated_response(serializer.data)

    except Exception as e:
        logger.error(f"Erreur lors de la récupération des produits : {e}")
        return Response({"error": "Erreur interne du serveur."}, status=500)


# ✅ Détails d'un produit
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def product_detail(request, pk):
    """Récupère les détails d'un produit."""
    try:
        if not ObjectId.is_valid(pk):
            return Response({"error": "ID invalide."}, status=400)

        product = products_collection.find_one({"_id": ObjectId(pk)})

        if not product:
            return Response({"error": "Produit non trouvé."}, status=404)

        product["_id"] = str(product["_id"])
        serializer = ProductSerializer(product)
        return Response(serializer.data)

    except Exception as e:
        logger.error(f"Erreur lors de la récupération du produit {pk} : {e}")
        return Response({"error": "Erreur interne du serveur."}, status=500)


# ✅ Création d'un produit
@api_view(['POST'])
@permission_classes([IsAdminUser])
def product_create(request):
    """Crée un nouveau produit."""
    try:
        serializer = ProductSerializer(data=request.data)

        if serializer.is_valid():
            product_data = serializer.validated_data
            product_data["variations"] = request.data.get("variations", [])

            result = products_collection.insert_one(product_data)
            product_data["_id"] = str(result.inserted_id)

            return Response(product_data, status=201)

        return Response(serializer.errors, status=400)

    except Exception as e:
        logger.error(f"Erreur lors de la création du produit : {e}")
        return Response({"error": "Erreur interne du serveur."}, status=500)


# ✅ Mise à jour d'un produit (Correction majeure)
@api_view(['PUT'])
@permission_classes([IsAdminUser])
def product_update(request, pk):
    """Met à jour un produit existant."""
    try:
        if not ObjectId.is_valid(pk):
            return Response({"error": "ID invalide."}, status=400)

        existing_product = products_collection.find_one({"_id": ObjectId(pk)})

        if not existing_product:
            return Response({"error": "Produit non trouvé."}, status=404)

        # ✅ Correction ici : utilisation correcte de `partial=True`
        serializer = ProductSerializer(existing_product, data=request.data, partial=True)

        if serializer.is_valid():
            updated_data = {k: v for k, v in serializer.validated_data.items() if v is not None}

            # Mise à jour de l'élément dans MongoDB
            products_collection.update_one({"_id": ObjectId(pk)}, {"$set": updated_data})

            # Récupération du produit mis à jour
            updated_product = products_collection.find_one({"_id": ObjectId(pk)})
            updated_product["_id"] = str(updated_product["_id"])

            return Response(updated_product)

        return Response(serializer.errors, status=400)

    except errors.InvalidId:
        return Response({"error": "ID non valide."}, status=400)
    except Exception as e:
        logger.error(f"Erreur lors de la mise à jour du produit {pk} : {e}")
        return Response({"error": "Erreur interne du serveur."}, status=500)


# ✅ Suppression d'un produit avec debug
@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def product_delete(request, pk):
    """Supprime un produit."""
    try:
        logger.info(f"Tentative de suppression du produit avec ID : {pk}")
        print(f"Tentative de suppression du produit avec ID : {pk}")

        if not ObjectId.is_valid(pk):
            logger.error("ID invalide reçu pour la suppression.")
            print("ID invalide reçu pour la suppression.")
            return Response({"error": "ID invalide."}, status=400)

        result = products_collection.delete_one({"_id": ObjectId(pk)})
        print(f"Résultat de la suppression : {result.deleted_count}")

        if result.deleted_count == 0:
            logger.warning("Produit non trouvé pour suppression.")
            print("Produit non trouvé pour suppression.")
            return Response({"error": "Produit non trouvé."}, status=404)

        logger.info("Produit supprimé avec succès.")
        print("Produit supprimé avec succès.")
        return Response({"message": "Produit supprimé avec succès."}, status=200)

    except Exception as e:
        logger.error(f"Erreur lors de la suppression du produit {pk} : {e}")
        print(f"Erreur lors de la suppression du produit {pk} : {e}")
        return Response({"error": "Erreur interne du serveur."}, status=500)

