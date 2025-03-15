from rest_framework import serializers
from bson import ObjectId
from nature_animaux.mongo_config import products_collection

class VariationSerializer(serializers.Serializer):
    """✅ Sérialiseur des variations de produit"""
    sku = serializers.CharField(max_length=50, required=False, allow_blank=True, allow_null=True)
    price = serializers.FloatField(required=False, default=None)
    weight = serializers.CharField(max_length=50, required=False, allow_blank=True, allow_null=True)
    stock = serializers.IntegerField(required=False, default=0)

class ProductSerializer(serializers.Serializer):
    """✅ Sérialiseur principal des produits"""
    id = serializers.CharField(source='_id', read_only=True)
    title = serializers.CharField(max_length=255, required=False, allow_blank=True, allow_null=True)
    category = serializers.CharField(max_length=255, required=False, allow_blank=True, allow_null=True)
    sub_category = serializers.CharField(max_length=255, required=False, allow_blank=True, allow_null=True)
    brand = serializers.CharField(max_length=255, required=False, allow_blank=True, allow_null=True)
    color = serializers.CharField(max_length=50, required=False, allow_blank=True, allow_null=True)
    description = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    variations = serializers.ListField(child=VariationSerializer(), required=False, default=list)

    def create(self, validated_data):
        """✅ Création d'un produit sans obligation de champs"""
        variations_data = validated_data.pop('variations', [])
        product_data = validated_data
        product_data['variations'] = variations_data

        result = products_collection.insert_one(product_data)
        product_data['_id'] = str(result.inserted_id)
        return product_data

    def update(self, instance, validated_data):
        """✅ Mise à jour sécurisée d'un produit sans forcer les valeurs obligatoires"""
        if '_id' not in instance or not ObjectId.is_valid(instance['_id']):
            raise serializers.ValidationError({'error': 'ID invalide ou manquant.'})

        product_id = ObjectId(instance['_id'])
        variations_data = validated_data.pop('variations', None)

        # ✅ Mise à jour sans écraser les champs non renseignés
        update_data = {k: v for k, v in validated_data.items() if v is not None}

        if variations_data is not None:
            update_data['variations'] = variations_data

        products_collection.update_one({'_id': product_id}, {'$set': update_data})
        updated_product = products_collection.find_one({'_id': product_id})

        if updated_product:
            updated_product['_id'] = str(updated_product['_id'])
            return updated_product
        else:
            raise serializers.ValidationError({'error': 'Erreur lors de la mise à jour du produit.'})
