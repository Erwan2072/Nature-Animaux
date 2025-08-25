from rest_framework import serializers
from bson import ObjectId
from nature_animaux.mongo_config import products_collection
import json


class VariationSerializer(serializers.Serializer):
    """ Sérialiseur des variations de produit """
    id = serializers.CharField(read_only=True)
    sku = serializers.CharField(max_length=50, required=False, allow_blank=True, allow_null=True)
    price = serializers.FloatField(required=False, allow_null=True, default=None)
    weight = serializers.CharField(max_length=50, required=False, allow_blank=True, allow_null=True)
    stock = serializers.IntegerField(required=False, default=0)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if not data.get("id"):
            if data.get("sku"):
                data["id"] = str(data["sku"])
            else:
                data["id"] = f"{data.get('weight', 'no-weight')}-{data.get('price', 'no-price')}"
        return data


class ProductSerializer(serializers.Serializer):
    """ Sérialiseur principal des produits """
    id = serializers.CharField(source='_id', read_only=True)
    title = serializers.CharField(
        max_length=255, required=False, allow_blank=True, allow_null=True,
        default="Produit sans titre"
    )
    imageUrl = serializers.CharField(  # ⚡ garde bien "imageUrl" car ton front l'utilise
        max_length=500, required=False, allow_blank=True, allow_null=True, default=""
    )
    category = serializers.CharField(max_length=255, required=False, allow_blank=True, allow_null=True)
    sub_category = serializers.CharField(max_length=255, required=False, allow_blank=True, allow_null=True)
    brand = serializers.CharField(max_length=255, required=False, allow_blank=True, allow_null=True)
    color = serializers.CharField(max_length=50, required=False, allow_blank=True, allow_null=True)
    description = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    variations = VariationSerializer(many=True, required=False)

    # ⚡ Ajout du prix calculé dynamiquement
    price = serializers.SerializerMethodField()

    def get_price(self, obj):
        """Retourne le prix minimum parmi les variations"""
        variations = obj.get("variations", [])
        valid_prices = [v.get("price") for v in variations if v.get("price") is not None]
        if valid_prices:
            return min(valid_prices)
        return "Prix non disponible"

    def to_internal_value(self, data):
        """
        ✅ Parse les variations si envoyées en JSON string (FormData Angular).
        """
        if "variations" in data:
            raw_variations = data.get("variations")
            if isinstance(raw_variations, str):
                try:
                    parsed = json.loads(raw_variations)
                    data["variations"] = parsed
                except json.JSONDecodeError:
                    raise serializers.ValidationError({
                        "variations": "Format JSON invalide, attendu un tableau d'objets."
                    })
        return super().to_internal_value(data)

    def create(self, validated_data):
        """ Création d'un produit """
        variations_data = validated_data.pop('variations', [])
        print("📥 Variations reçues (create) :", variations_data)  # 🔎 Debug

        product_data = validated_data
        product_data['variations'] = variations_data

        product_data.setdefault("title", "Produit sans titre")
        product_data.setdefault("imageUrl", "assets/default-image.jpg")

        result = products_collection.insert_one(product_data)
        product_data['_id'] = str(result.inserted_id)
        return product_data

    def update(self, instance, validated_data):
        """ Mise à jour d'un produit """
        if '_id' not in instance or not ObjectId.is_valid(instance['_id']):
            raise serializers.ValidationError({'error': 'ID invalide ou manquant.'})

        product_id = ObjectId(instance['_id'])
        variations_data = validated_data.pop('variations', None)

        update_data = {k: v for k, v in validated_data.items() if v is not None}

        if variations_data is not None:
            print("📥 Variations reçues (update) :", variations_data)
            update_data['variations'] = variations_data

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
