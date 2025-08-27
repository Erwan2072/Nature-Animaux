from rest_framework import serializers
from .models import Cart, CartItem

class CartItemCreateSerializer(serializers.Serializer):
    product_id = serializers.CharField()  # ✅ tu avais doublé la ligne, je garde CharField (Mongo ID ou SKU)
    variant_id = serializers.CharField()
    quantity = serializers.IntegerField(min_value=1)
    unit_price = serializers.DecimalField(max_digits=10, decimal_places=2)
    product_title = serializers.CharField(allow_blank=True, required=False)
    image_url = serializers.URLField(allow_blank=True, required=False)


class CartItemSerializer(serializers.ModelSerializer):
    total_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = CartItem
        fields = [
            "id",
            "product_id",
            "variant_id",
            "product_title",
            "unit_price",
            "quantity",
            "total_price",
            "image_url",
        ]


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    #champs pour livraison
    delivery_method = serializers.CharField(allow_blank=True, required=False)
    delivery_price = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)

    class Meta:
        model = Cart
        fields = ["id", "items", "subtotal", "delivery_method", "delivery_price"]
