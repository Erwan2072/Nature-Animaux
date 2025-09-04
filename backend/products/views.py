from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.pagination import PageNumberPagination
from bson import ObjectId
from .serializers import ProductSerializer
from nature_animaux.mongo_config import products_collection
import logging
import cloudinary.uploader
import re
import json

# Configuration du logger
logger = logging.getLogger(__name__)


# Vérification MongoDB
def check_mongo_connection():
    try:
        products_collection.find_one()
        return True
    except Exception as e:
        logger.error(f"❌ MongoDB non disponible : {e}")
        return False


# Aperçu des routes
@api_view(['GET'])
def api_overview(request):
    return Response({
        'List': '/products/',
        'Detail': '/product-detail/<str:pk>/',
        'Create': '/product-create/',
        'Update': '/product-update/<str:pk>/',
        'Delete': '/product-delete/<str:pk>/',
    })


import re
import json

def normalize_variations(data):
    """
    Reconstruit les variations envoyées via FormData (ex: variations[0][sku]) en une vraie liste de dicts.
    """
    pattern = re.compile(r'^variations\[(\d+)\]\[(\w+)\]$')
    variations = {}

    # 🔍 Reconstituer les variations à partir des champs FormData
    for key in list(data.keys()):
        match = pattern.match(key)
        if match:
            index, field = match.groups()
            if index not in variations:
                variations[index] = {}
            variations[index][field] = data.pop(key)

    # 🧪 Si variations ont été détectées dans FormData
    if variations:
        normalized = []
        for index in sorted(variations.keys(), key=int):
            v = variations[index]
            normalized.append({
                'sku': v.get('sku', ''),
                'price': float(v.get('price')) if v.get('price') not in [None, ''] else None,
                'weight': v.get('weight', '') or "Non défini",
                'stock': int(v.get('stock')) if v.get('stock') not in [None, ''] else 0,
            })
        data['variations'] = normalized
        return data

    # 🔄 Fallback pour JSON brut (au cas où)
    if "variations" in data:
        raw = data["variations"]
        if isinstance(raw, str):
            try:
                parsed = json.loads(raw)
                if isinstance(parsed, list):
                    data["variations"] = parsed
                else:
                    raise ValueError("Variations doit être une liste JSON.")
            except json.JSONDecodeError:
                raise ValueError("Format JSON invalide pour variations.")
        elif isinstance(raw, list):
            data["variations"] = raw

    return data



# --- DETAIL ---
@api_view(['GET'])
@permission_classes([AllowAny])
def product_detail(request, pk):
    if not check_mongo_connection():
        return Response({"error": "DB non accessible."}, status=500)

    if not ObjectId.is_valid(pk):
        return Response({"error": "ID invalide."}, status=400)

    product = products_collection.find_one({"_id": ObjectId(pk)})
    if not product:
        return Response({"error": "Produit non trouvé."}, status=404)

    product["_id"] = str(product["_id"])
    serializer = ProductSerializer(product)
    return Response(serializer.data)


# --- LIST ---
@api_view(['GET'])
@permission_classes([AllowAny])
def product_list(request):
    if not check_mongo_connection():
        return Response({"error": "DB non accessible."}, status=500)

    try:
        paginator = PageNumberPagination()
        paginator.page_size = 10

        # 🔍 Récupération des filtres dans l’URL
        animal = request.GET.get("animal")
        category = request.GET.get("category")

        filters = {}
        if animal:
            filters["animal"] = animal
        if category:
            filters["category"] = category

        # 🐾 On applique les filtres si présents
        products = list(products_collection.find(filters))

        for product in products:
            product["_id"] = str(product["_id"])
            product["title"] = product.get("title", "Produit sans titre")
            product["category"] = product.get("category", "Catégorie inconnue")
            product["animal"] = product.get("animal", "non défini")  # ✅ Ajout du champ animal
            product["imageUrl"] = product.get("imageUrl") or "assets/default-image.jpg"

            # Nettoyage des variations
            cleaned_variations = []
            for idx, v in enumerate(product.get("variations", [])):
                price_value = v.get("price")
                cleaned_variations.append({
                    "sku": v.get("sku") or f"REF-{product['_id']}-{idx+1}",
                    "weight": v.get("weight") or "Non défini",
                    "price": price_value if isinstance(price_value, (int, float)) else None,
                    "stock": v.get("stock", 0)
                })
            product["variations"] = cleaned_variations

            # Prix principal : le plus bas trouvé dans les variations
            valid_prices = [v["price"] for v in cleaned_variations if isinstance(v["price"], (int, float))]
            product["price"] = min(valid_prices) if valid_prices else None

        # Pagination
        paginated = paginator.paginate_queryset(products, request)
        serializer = ProductSerializer(paginated, many=True)
        return paginator.get_paginated_response(serializer.data)

    except Exception as e:
        logger.exception("❌ Erreur product_list")
        return Response({"error": str(e)}, status=500)



# --- CREATE ---
@api_view(['POST'])
@permission_classes([IsAdminUser])
def product_create(request):
    if not check_mongo_connection():
        return Response({"error": "DB non accessible."}, status=500)

    try:
        data = request.data.copy()
        logger.info(f"[CREATE] Data reçue: {list(data.keys())}, Files: {list(request.FILES.keys())}")

        # ✅ Reconstruire correctement les variations depuis FormData
        variations = []
        i = 0
        while f"variations[{i}][sku]" in data:
            variation = {
                "sku": data.get(f"variations[{i}][sku]"),
                "price": float(data.get(f"variations[{i}][price]", 0)) if data.get(f"variations[{i}][price]") else None,
                "weight": data.get(f"variations[{i}][weight]"),
                "stock": int(data.get(f"variations[{i}][stock]", 0)) if data.get(f"variations[{i}][stock]") else 0,
            }
            variations.append(variation)
            i += 1

        data["variations"] = variations

        # Upload image si envoyée
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
                logger.exception("❌ Cloudinary create")
                return Response({"error": f"Erreur Cloudinary: {e}"}, status=500)

        serializer = ProductSerializer(data=data)
        if serializer.is_valid():
            product = serializer.save()
            return Response(ProductSerializer(product).data, status=201)

        logger.error(f"❌ Validation errors (create): {serializer.errors}")
        return Response(serializer.errors, status=400)

    except Exception as e:
        logger.exception("❌ Erreur product_create")
        return Response({"error": "Erreur interne du serveur."}, status=500)


# --- UPDATE ---
@api_view(['PUT'])
@permission_classes([IsAdminUser])
def product_update(request, pk):
    if not check_mongo_connection():
        return Response({"error": "DB non accessible."}, status=500)

    if not ObjectId.is_valid(pk):
        return Response({"error": "ID invalide."}, status=400)

    existing = products_collection.find_one({"_id": ObjectId(pk)})
    if not existing:
        return Response({"error": "Produit non trouvé."}, status=404)

    try:
        data = request.data.copy()
        logger.info(f"[UPDATE] Data reçue: {list(data.keys())}, Files: {list(request.FILES.keys())}")

        # Variations
        try:
            data = normalize_variations(data)
        except ValueError as e:
            return Response({"error": str(e)}, status=400)

        # Upload image si nouvelle envoyée
        if 'image' in request.FILES:
            try:
                old_image_url = existing.get("imageUrl")
                if old_image_url and "cloudinary" in old_image_url:
                    old_id = old_image_url.split("/")[-1].split(".")[0]
                    cloudinary.uploader.destroy(f"products/{old_id}")
                    logger.info(f"✅ Ancienne image supprimée (id: {old_id})")

                up = cloudinary.uploader.upload(
                    request.FILES['image'],
                    folder="products",
                    use_filename=True,
                    unique_filename=False
                )
                data['imageUrl'] = up.get('secure_url', '')
            except Exception as e:
                logger.exception("❌ Cloudinary update")
                return Response({"error": f"Erreur Cloudinary: {e}"}, status=500)

        serializer = ProductSerializer(instance=existing, data=data, partial=True)
        if serializer.is_valid():
            updated = serializer.save()
            return Response(ProductSerializer(updated).data, status=200)

        logger.error(f"❌ Validation errors (update): {serializer.errors}")
        return Response(serializer.errors, status=400)

    except Exception as e:
        logger.exception("❌ Erreur product_update")
        return Response({"error": "Erreur interne du serveur."}, status=500)


# --- DELETE ---
@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def product_delete(request, pk):
    if not check_mongo_connection():
        return Response({"error": "DB non accessible."}, status=500)

    if not ObjectId.is_valid(pk):
        return Response({"error": "ID invalide."}, status=400)

    product = products_collection.find_one({"_id": ObjectId(pk)})
    if not product:
        return Response({"error": "Produit non trouvé."}, status=404)

    try:
        # Supprimer image Cloudinary si présente
        image_url = product.get("imageUrl")
        if image_url and "cloudinary" in image_url:
            try:
                public_id = image_url.split("/")[-1].split(".")[0]
                cloudinary.uploader.destroy(f"products/{public_id}")
                logger.info(f"✅ Image supprimée (id: {public_id})")
            except Exception as e:
                logger.warning(f"⚠️ Erreur suppression image: {e}")

        # Supprimer produit
        result = products_collection.delete_one({"_id": ObjectId(pk)})
        if result.deleted_count == 0:
            return Response({"error": "Échec suppression produit."}, status=500)

        return Response({"message": "✅ Produit supprimé."}, status=200)

    except Exception as e:
        logger.exception("❌ Erreur product_delete")
        return Response({"error": "Erreur interne du serveur."}, status=500)
