from rest_framework import serializers
from bson import ObjectId
from nature_animaux.mongo_config import products_collection  # Importation de la collection MongoDB

class VariationSerializer(serializers.Serializer):
    sku = serializers.CharField(max_length=50)
    price = serializers.FloatField()
    weight = serializers.CharField(max_length=50)
    stock = serializers.IntegerField()

class ProductSerializer(serializers.Serializer):
    id = serializers.CharField(source='_id', read_only=True)  # ✅ Ajout de l'ID
    title = serializers.CharField(max_length=255)
    category = serializers.CharField(max_length=255)
    sub_category = serializers.CharField(max_length=255)
    brand = serializers.CharField(max_length=255)
    color = serializers.CharField(max_length=50, required=False, allow_null=True)
    description = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    variations = VariationSerializer(many=True, required=False)  # ✅ Ajout des variations

    def create(self, validated_data):
        """Créer un produit dans MongoDB à partir des données validées."""
        variations_data = validated_data.pop('variations', [])

        # Insertion dans MongoDB
        product_data = validated_data
        product_data["variations"] = variations_data
        result = products_collection.insert_one(product_data)

        # Ajout de l'ID inséré
        product_data["_id"] = str(result.inserted_id)

        return product_data

    def update(self, instance, validated_data):
        """Mettre à jour un produit existant dans MongoDB."""
        if "_id" not in instance or not ObjectId.is_valid(instance["_id"]):
            raise serializers.ValidationError({"error": "ID invalide ou manquant."})

        product_id = ObjectId(instance["_id"])
        variations_data = validated_data.pop('variations', None)

        update_data = {k: v for k, v in validated_data.items() if v is not None}

        if variations_data is not None:
            update_data["variations"] = variations_data  # ✅ Mise à jour des variations

        # Mise à jour dans MongoDB
        products_collection.update_one({"_id": product_id}, {"$set": update_data})

        # Récupérer l'élément mis à jour
        updated_product = products_collection.find_one({"_id": product_id})

        if updated_product:
            updated_product["_id"] = str(updated_product["_id"])  # Conversion de l'ID
            return updated_product
        else:
            raise serializers.ValidationError({"error": "Erreur lors de la mise à jour du produit."})
