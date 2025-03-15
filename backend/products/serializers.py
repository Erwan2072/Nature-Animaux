from rest_framework import serializers
from bson import ObjectId
from nature_animaux.mongo_config import products_collection

class VariationSerializer(serializers.Serializer):
    """✅ Sérialiseur des variations de produit"""
    sku = serializers.CharField(max_length=50, required=False, allow_blank=True, allow_null=True)
    price = serializers.FloatField(required=False, allow_null=True, default=None)
    weight = serializers.CharField(max_length=50, required=False, allow_blank=True, allow_null=True)
    stock = serializers.IntegerField(required=False, default=0)

class ProductSerializer(serializers.Serializer):
    """✅ Sérialiseur principal des produits"""
    id = serializers.CharField(source='_id', read_only=True)
    title = serializers.CharField(max_length=255, required=False, allow_blank=True, allow_null=True, default="Produit sans titre")
    image_url = serializers.CharField(max_length=500, required=False, allow_blank=True, allow_null=True, default="")  # ✅ Ajout du champ image
    category = serializers.CharField(max_length=255, required=False, allow_blank=True, allow_null=True)
    sub_category = serializers.CharField(max_length=255, required=False, allow_blank=True, allow_null=True)
    brand = serializers.CharField(max_length=255, required=False, allow_blank=True, allow_null=True)
    color = serializers.CharField(max_length=50, required=False, allow_blank=True, allow_null=True)
    description = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    variations = serializers.ListField(child=VariationSerializer(), required=False, default=list)

    def create(self, validated_data):
        """✅ Création d'un produit en assurant que tous les champs sont bien remplis"""
        variations_data = validated_data.pop('variations', [])
        product_data = validated_data
        product_data['variations'] = variations_data

        # ✅ Vérification et mise en place d'une valeur par défaut si `title` ou `image_url` est vide
        if not product_data.get("title"):
            product_data["title"] = "Produit sans titre"
        if not product_data.get("image_url"):
            product_data["image_url"] = "/assets/no-image.png"  # ✅ Image par défaut si aucune n'est fournie

        result = products_collection.insert_one(product_data)
        product_data['_id'] = str(result.inserted_id)
        return product_data

    def update(self, instance, validated_data):
        """✅ Mise à jour d'un produit en conservant les valeurs existantes"""
        if '_id' not in instance or not ObjectId.is_valid(instance['_id']):
            raise serializers.ValidationError({'error': 'ID invalide ou manquant.'})

        product_id = ObjectId(instance['_id'])
        variations_data = validated_data.pop('variations', None)

        # ✅ Mise à jour en évitant d'écraser les champs avec `None`
        update_data = {k: v for k, v in validated_data.items() if v is not None}

        if variations_data is not None:
            update_data['variations'] = variations_data

        # ✅ S'assurer que `title` et `image_url` ont toujours une valeur
        if "title" in update_data and not update_data["title"]:
            update_data["title"] = "Produit sans titre"
        if "image_url" in update_data and not update_data["image_url"]:
            update_data["image_url"] = "/assets/no-image.png"

        products_collection.update_one({'_id': product_id}, {'$set': update_data})
        updated_product = products_collection.find_one({'_id': product_id})

        if updated_product:
            updated_product['_id'] = str(updated_product['_id'])
            return updated_product
        else:
            raise serializers.ValidationError({'error': 'Erreur lors de la mise à jour du produit.'})
