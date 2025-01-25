from rest_framework import serializers
from .models import Product

class ProductSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=255)
    category = serializers.CharField(max_length=255)
    sub_category = serializers.CharField(max_length=255)
    brand = serializers.CharField(max_length=255)
    color = serializers.CharField(max_length=50, required=False, allow_null=True)
    sku = serializers.CharField(max_length=50, required=False, allow_null=True)
    price = serializers.FloatField(required=False, allow_null=True)
    weight = serializers.FloatField(required=False, allow_null=True)
    stock = serializers.IntegerField(required=False, allow_null=True)
    description = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    def create(self, validated_data):
        """Créer un produit dans MongoDB à partir des données validées."""
        product = Product(**validated_data)
        product.save()
        return product

    def update(self, instance, validated_data):
        """Mettre à jour un produit existant dans MongoDB."""
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance
