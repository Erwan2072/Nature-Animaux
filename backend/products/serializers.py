from rest_framework import serializers
from bson import ObjectId
from nature_animaux.mongo_config import products_collection
import json


class VariationSerializer(serializers.Serializer):
    """ Sérialiseur des variations de produit """
    sku = serializers.CharField(max_length=50, required=False, allow_blank=True, allow_null=True)
    price = serializers.FloatField(required=False, allow_null=True, default=None)
    weight = serializers.CharField(max_length=50, required=False, allow_blank=True, allow_null=True)
    stock = serializers.IntegerField(required=False, default=0)


class ProductSerializer(serializers.Serializer):
    """ Sérialiseur principal des produits """
    id = serializers.CharField(source='_id', read_only=True)
    title = serializers.CharField(
        max_length=255, required=False, allow_blank=True, allow_null=True,
        default="Produit sans titre"
    )
    # ⚡ Champ unique pour l’URL image (Cloudinary ou fallback)
    imageUrl = serializers.CharField(
        max_length=500, required=False, allow_blank=True, allow_null=True, default=""
    )
    category = serializers.CharField(max_length=255, required=False, allow_blank=True, allow_null=True)
    sub_category = serializers.CharField(max_length=255, required=False, allow_blank=True, allow_null=True)
    brand = serializers.CharField(max_length=255, required=False, allow_blank=True, allow_null=True)
    color = serializers.CharField(max_length=50, required=False, allow_blank=True, allow_null=True)
    description = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    # ✅ variations = liste d’objets
    variations = VariationSerializer(many=True, required=False)

    def to_internal_value(self, data):
        """
        Accepte variations envoyées sous forme de string JSON (FormData).
        Exemple : request.data["variations"] = "[{...}, {...}]"
        """
        if "variations" in data and isinstance(data["variations"], str):
            try:
                data["variations"] = json.loads(data["variations"])
            except json.JSONDecodeError:
                raise serializers.ValidationError({
                    "variations": "Format JSON invalide, attendu un tableau d'objets."
                })
        return super().to_internal_value(data)

    def create(self, validated_data):
        """ Création d'un produit (sans gérer l’upload ici, Cloudinary le fait déjà) """
        variations_data = validated_data.pop('variations', [])
        product_data = validated_data
        product_data['variations'] = variations_data

        # Valeur par défaut titre
        if not product_data.get("title"):
            product_data["title"] = "Produit sans titre"

        # Valeur par défaut image (si Cloudinary n’a rien mis)
        if not product_data.get("imageUrl"):
            product_data["imageUrl"] = "assets/default-image.jpg"

        result = products_collection.insert_one(product_data)
        product_data['_id'] = str(result.inserted_id)
        return product_data

    def update(self, instance, validated_data):
        """ Mise à jour d'un produit (sans gérer l’upload ici, Cloudinary le fait déjà) """
        if '_id' not in instance or not ObjectId.is_valid(instance['_id']):
            raise serializers.ValidationError({'error': 'ID invalide ou manquant.'})

        product_id = ObjectId(instance['_id'])
        variations_data = validated_data.pop('variations', None)

        update_data = {k: v for k, v in validated_data.items() if v is not None}

        if variations_data is not None:
            update_data['variations'] = variations_data

        # Valeurs par défaut
        if "title" in update_data and not update_data["title"]:
            update_data["title"] = "Produit sans titre"
        if "imageUrl" in update_data and not update_data["imageUrl"]:
            update_data["imageUrl"] = "assets/default-image.jpg"

        products_collection.update_one({'_id': product_id}, {'$set': update_data})
        updated_product = products_collection.find_one({'_id': product_id})

        if updated_product:
            updated_product['_id'] = str(updated_product['_id'])
            return updated_product
        else:
            raise serializers.ValidationError({'error': 'Erreur lors de la mise à jour du produit.'})
