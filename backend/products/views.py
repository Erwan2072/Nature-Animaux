from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.pagination import PageNumberPagination
from bson import ObjectId
from .serializers import ProductSerializer
from nature_animaux.mongo_config import products_collection
import logging

# Configuration du logger
logger = logging.getLogger(__name__)

# ✅ Vérification si MongoDB est disponible
def check_mongo_connection():
    try:
        products_collection.find_one()
        return True
    except Exception as e:
        logger.error(f"🚨 MongoDB non disponible : {e}")
        return False

# ✅ API Overview
@api_view(['GET'])
def api_overview(request):
    """Affiche un aperçu des routes disponibles."""
    api_urls = {
        'List': '/products/',
        'Detail': '/product-detail/<str:pk>/',
        'Create': '/product-create/',
        'Update': '/product-update/<str:pk>/',
        'Delete': '/product-delete/<str:pk>/',
    }
    return Response(api_urls)

# ✅ Détails d'un produit (accessible à tous)
@api_view(['GET'])
@permission_classes([AllowAny])
def product_detail(request, pk):
    """Récupère les détails d'un produit."""
    if not check_mongo_connection():
        return Response({"error": "Base de données MongoDB non accessible."}, status=500)

    try:
        logger.info(f"🔍 Recherche du produit avec l'ID : '{pk}'")

        if not ObjectId.is_valid(pk):
            return Response({"error": "ID invalide."}, status=400)

        product = products_collection.find_one({"_id": ObjectId(pk)})
        if not product:
            return Response({"error": "Produit non trouvé."}, status=404)

        product["_id"] = str(product["_id"])
        serializer = ProductSerializer(product)
        return Response(serializer.data)

    except Exception as e:
        logger.error(f"❌ Erreur lors de la récupération du produit {pk} : {e}")
        return Response({"error": "Erreur interne du serveur."}, status=500)

# ✅ Liste des produits avec pagination et correction de format
@api_view(['GET'])
@permission_classes([AllowAny])
def product_list(request):
    """Liste tous les produits avec pagination."""
    if not check_mongo_connection():
        return Response({"error": "Base de données MongoDB non accessible."}, status=500)

    try:
        paginator = PageNumberPagination()
        paginator.page_size = 10  # ✅ Définit la taille de la pagination
        products = list(products_collection.find({}))

        if not products:
            return Response({"message": "Aucun produit trouvé."}, status=200)

        # 🔥 Correction des valeurs manquantes
        for product in products:
            product["_id"] = str(product["_id"])
            product["title"] = product.get("title", "Produit sans titre")
            product["category"] = product.get("category", "Catégorie inconnue")
            product["imageUrl"] = product.get("imageUrl", "assets/default-image.jpg")

            # ✅ Vérifier la présence de variations et définir un prix minimum
            product["variations"] = product.get("variations", [])
            if product["variations"]:
                product["price"] = min(v.get("price", float('inf')) for v in product["variations"] if "price" in v)
            else:
                product["price"] = "Prix non disponible"

        # ✅ Correction de la pagination
        paginated_products = paginator.paginate_queryset(products, request)
        serializer = ProductSerializer(paginated_products, many=True)
        return paginator.get_paginated_response(serializer.data)  # ✅ Utilisation correcte de `get_paginated_response()`

    except Exception as e:
        logger.error(f"❌ Erreur lors de la récupération des produits : {e}")
        return Response({"error": "Erreur interne du serveur."}, status=500)

# ✅ Création d'un produit (réservé aux admins)
@api_view(['POST'])
@permission_classes([IsAdminUser])
def product_create(request):
    """Crée un nouveau produit."""
    if not check_mongo_connection():
        return Response({"error": "Base de données MongoDB non accessible."}, status=500)

    try:
        logger.info(f"📩 Données reçues : {request.data}")

        serializer = ProductSerializer(data=request.data)
        if serializer.is_valid():
            product_data = serializer.validated_data

            # ✅ Valeurs par défaut si absentes
            product_data["title"] = product_data.get("title", "Produit sans titre")
            product_data["category"] = product_data.get("category", "Catégorie inconnue")
            product_data["imageUrl"] = product_data.get("imageUrl", "assets/default-image.jpg")

            result = products_collection.insert_one(product_data)
            product_data["_id"] = str(result.inserted_id)

            logger.info(f"✅ Produit ajouté : {product_data['title']} ({product_data['_id']})")
            return Response(product_data, status=201)

        logger.error(f"❌ Erreurs de validation : {serializer.errors}")
        return Response(serializer.errors, status=400)

    except Exception as e:
        logger.error(f"❌ Erreur lors de la création du produit : {e}")
        return Response({"error": "Erreur interne du serveur."}, status=500)

# ✅ Mise à jour d'un produit (réservé aux admins)
@api_view(['PUT'])
@permission_classes([IsAdminUser])
def product_update(request, pk):
    """Met à jour un produit existant."""
    if not check_mongo_connection():
        return Response({"error": "Base de données MongoDB non accessible."}, status=500)

    try:
        if not ObjectId.is_valid(pk):
            return Response({"error": "ID invalide."}, status=400)

        existing_product = products_collection.find_one({"_id": ObjectId(pk)})
        if not existing_product:
            return Response({"error": "Produit non trouvé."}, status=404)

        logger.info(f"📩 Données reçues pour mise à jour : {request.data}")

        serializer = ProductSerializer(data=request.data, partial=True)
        if serializer.is_valid():
            updated_data = {k: v for k, v in serializer.validated_data.items() if v is not None}

            # ✅ Conserver les anciennes valeurs si elles ne sont pas fournies
            updated_data["title"] = updated_data.get("title", existing_product.get("title", "Produit sans titre"))
            updated_data["category"] = updated_data.get("category", existing_product.get("category", "Catégorie inconnue"))
            updated_data["imageUrl"] = updated_data.get("imageUrl", existing_product.get("imageUrl", "assets/default-image.jpg"))

            products_collection.update_one({"_id": ObjectId(pk)}, {"$set": updated_data})

            updated_product = products_collection.find_one({"_id": ObjectId(pk)})
            updated_product["_id"] = str(updated_product["_id"])

            logger.info(f"✅ Produit mis à jour : {updated_product['title']} ({updated_product['_id']})")
            return Response(updated_product)

        logger.error(f"❌ Erreurs de validation : {serializer.errors}")
        return Response(serializer.errors, status=400)

    except Exception as e:
        logger.error(f"❌ Erreur lors de la mise à jour du produit {pk} : {e}")
        return Response({"error": "Erreur interne du serveur."}, status=500)

# ✅ Suppression d'un produit (réservé aux admins)
@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def product_delete(request, pk):
    """Supprime un produit."""
    if not check_mongo_connection():
        return Response({"error": "Base de données MongoDB non accessible."}, status=500)

    try:
        if not ObjectId.is_valid(pk):
            return Response({"error": "ID invalide."}, status=400)

        result = products_collection.delete_one({"_id": ObjectId(pk)})
        if result.deleted_count == 0:
            return Response({"error": "Produit non trouvé."}, status=404)

        logger.info(f"🗑️ Produit supprimé avec succès (ID: {pk})")
        return Response({"message": "Produit supprimé avec succès."}, status=200)

    except Exception as e:
        logger.error(f"❌ Erreur lors de la suppression du produit {pk} : {e}")
        return Response({"error": "Erreur interne du serveur."}, status=500)
