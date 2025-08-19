from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.pagination import PageNumberPagination
from bson import ObjectId
from .serializers import ProductSerializer
from nature_animaux.mongo_config import products_collection
import logging
import cloudinary.uploader
import json

# Configuration du logger
logger = logging.getLogger(__name__)

#  Vérification si MongoDB est disponible
def check_mongo_connection():
    try:
        products_collection.find_one()
        return True
    except Exception as e:
        logger.error(f" MongoDB non disponible : {e}")
        return False

# API Overview
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

# Détails d'un produit (accessible à tous)
@api_view(['GET'])
@permission_classes([AllowAny])
def product_detail(request, pk):
    """Récupère les détails d'un produit."""
    if not check_mongo_connection():
        return Response({"error": "Base de données MongoDB non accessible."}, status=500)

    try:
        logger.info(f" Recherche du produit avec l'ID : '{pk}'")

        if not ObjectId.is_valid(pk):
            return Response({"error": "ID invalide."}, status=400)

        product = products_collection.find_one({"_id": ObjectId(pk)})
        if not product:
            return Response({"error": "Produit non trouvé."}, status=404)

        product["_id"] = str(product["_id"])
        serializer = ProductSerializer(product)
        return Response(serializer.data)

    except Exception as e:
        logger.error(f" Erreur lors de la récupération du produit {pk} : {e}")
        return Response({"error": "Erreur interne du serveur."}, status=500)

# Liste des produits avec pagination et correction de format
@api_view(['GET'])
@permission_classes([AllowAny])
def product_list(request):
    """Liste tous les produits avec pagination."""
    if not check_mongo_connection():
        return Response({"error": "Base de données MongoDB non accessible."}, status=500)

    try:
        paginator = PageNumberPagination()
        paginator.page_size = 10  # Définit la taille de la pagination
        products = list(products_collection.find({}))

        if not products:
            return Response({"message": "Aucun produit trouvé."}, status=200)

        # Correction des valeurs manquantes
        for product in products:
            product["_id"] = str(product["_id"])
            product["title"] = product.get("title", "Produit sans titre")
            product["category"] = product.get("category", "Catégorie inconnue")

            # ✅ Correction image : garde Cloudinary si dispo, sinon image par défaut
            product["imageUrl"] = product.get("imageUrl") or "assets/default-image.jpg"

            # Vérifier la présence de variations et définir un prix minimum
            product["variations"] = product.get("variations", [])
            if product["variations"]:
                product["price"] = min(
                    v.get("price", float('inf')) for v in product["variations"] if "price" in v
                )
            else:
                product["price"] = "Prix non disponible"

        # Correction de la pagination
        paginated_products = paginator.paginate_queryset(products, request)
        serializer = ProductSerializer(paginated_products, many=True)
        return paginator.get_paginated_response(serializer.data)  # Utilisation correcte de `get_paginated_response()`

    except Exception as e:
        logger.error(f"Erreur lors de la récupération des produits : {e}")
        return Response({"error": "Erreur interne du serveur."}, status=500)

# --- Normalisation des variations ---
def normalize_variations(data):
    """Transforme 'variations' en liste de dicts valide pour le serializer."""
    if "variations" in data:
        if isinstance(data["variations"], str):
            try:
                data["variations"] = json.loads(data["variations"])
            except json.JSONDecodeError:
                raise ValueError("Format JSON invalide pour variations.")
        elif isinstance(data["variations"], list):
            # Vérifie que c’est une liste de dicts
            if not all(isinstance(v, dict) for v in data["variations"]):
                raise ValueError("Chaque variation doit être un objet JSON (dict).")
    return data


# --- CREATE ---
@api_view(['POST'])
@permission_classes([IsAdminUser])
def product_create(request):
    if not check_mongo_connection():
        return Response({"error": "Base de données MongoDB non accessible."}, status=500)

    try:
        data = request.data.copy()
        logger.info(f"[CREATE] Données reçues : {data.keys()} | files: {list(request.FILES.keys())}")

        # Normalisation des variations
        try:
            data = normalize_variations(data)
        except ValueError as e:
            return Response({"error": str(e)}, status=400)

        # Upload Cloudinary si image envoyée
        if 'image' in request.FILES:
            try:
                up = cloudinary.uploader.upload(
                    request.FILES['image'],
                    folder="products",
                    use_filename=True,
                    unique_filename=False
                )
                data['imageUrl'] = up.get('secure_url', '')
            except Exception as e:
                logger.exception("Erreur Cloudinary (create)")
                return Response({"error": f"Erreur Cloudinary: {e}"}, status=500)

        serializer = ProductSerializer(data=data)
        if serializer.is_valid():
            product = serializer.save()
            return Response(ProductSerializer(product).data, status=201)

        logger.error(f"Validation errors (create) : {serializer.errors}")
        return Response(serializer.errors, status=400)

    except Exception as e:
        logger.exception("Erreur lors de la création du produit")
        return Response({"error": "Erreur interne du serveur."}, status=500)


# --- UPDATE ---
@api_view(['PUT'])
@permission_classes([IsAdminUser])
def product_update(request, pk):
    if not check_mongo_connection():
        return Response({"error": "Base de données MongoDB non accessible."}, status=500)

    try:
        if not ObjectId.is_valid(pk):
            return Response({"error": "ID invalide."}, status=400)

        existing_product = products_collection.find_one({"_id": ObjectId(pk)})
        if not existing_product:
            return Response({"error": "Produit non trouvé."}, status=404)

        data = request.data.copy()
        logger.info(f"[UPDATE] Données reçues : {data.keys()} | files: {list(request.FILES.keys())}")

        # Normalisation des variations
        try:
            data = normalize_variations(data)
        except ValueError as e:
            return Response({"error": str(e)}, status=400)

        # Upload Cloudinary si nouvelle image envoyée
        if 'image' in request.FILES:
            try:
                old_image_url = existing_product.get("imageUrl")
                if old_image_url and "cloudinary" in old_image_url:
                    try:
                        old_public_id = old_image_url.split("/")[-1].split(".")[0]
                        cloudinary.uploader.destroy(f"products/{old_public_id}")
                        logger.info(f"Ancienne image supprimée (Cloudinary id: {old_public_id})")
                    except Exception as e:
                        logger.warning(f"Impossible de supprimer l'ancienne image : {e}")

                up = cloudinary.uploader.upload(
                    request.FILES['image'],
                    folder="products",
                    use_filename=True,
                    unique_filename=False
                )
                data['imageUrl'] = up.get('secure_url', '')
            except Exception as e:
                logger.exception("Erreur Cloudinary (update)")
                return Response({"error": f"Erreur Cloudinary: {e}"}, status=500)

        serializer = ProductSerializer(instance=existing_product, data=data, partial=True)
        if serializer.is_valid():
            updated_product = serializer.save()
            return Response(ProductSerializer(updated_product).data, status=200)

        logger.error(f"Validation errors (update) : {serializer.errors}")
        return Response(serializer.errors, status=400)

    except Exception as e:
        logger.exception(f"Erreur lors de la mise à jour du produit {pk}")
        return Response({"error": "Erreur interne du serveur."}, status=500)

# Suppression d'un produit (réservé aux admins)
@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def product_delete(request, pk):
    """Supprime un produit ainsi que son image Cloudinary si présente."""
    if not check_mongo_connection():
        return Response({"error": "Base de données MongoDB non accessible."}, status=500)

    try:
        if not ObjectId.is_valid(pk):
            return Response({"error": "ID invalide."}, status=400)

        # Récupérer le produit avant suppression pour avoir l'image
        product = products_collection.find_one({"_id": ObjectId(pk)})
        if not product:
            return Response({"error": "Produit non trouvé."}, status=404)

        # Supprimer l'image Cloudinary si elle existe
        image_url = product.get("imageUrl")
        if image_url and "cloudinary" in image_url:
            try:
                # Récupérer public_id à partir de l'URL Cloudinary
                public_id = image_url.split("/")[-1].split(".")[0]
                cloudinary.uploader.destroy(f"products/{public_id}")
                logger.info(f"Image Cloudinary supprimée (public_id: {public_id})")
            except Exception as e:
                logger.warning(f"Impossible de supprimer l'image Cloudinary : {e}")

        # Supprimer le produit dans MongoDB
        result = products_collection.delete_one({"_id": ObjectId(pk)})
        if result.deleted_count == 0:
            return Response({"error": "Échec suppression du produit."}, status=500)

        logger.info(f"Produit supprimé avec succès (ID: {pk})")
        return Response({"message": "Produit supprimé avec succès."}, status=200)

    except Exception as e:
        logger.error(f"Erreur lors de la suppression du produit {pk} : {e}")
        return Response({"error": "Erreur interne du serveur."}, status=500)
