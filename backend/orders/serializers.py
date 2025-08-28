from rest_framework import serializers
from .models import Order
from deliveries.models import DeliveryChoice


class DeliveryChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeliveryChoice
        fields = ["id", "mode", "fees"]


class OrderSerializer(serializers.ModelSerializer):
    delivery_choice = DeliveryChoiceSerializer(read_only=True)

    class Meta:
        model = Order
        fields = ["id", "user", "cart", "total_price", "created_at", "delivery_choice"]
        read_only_fields = ["id", "created_at"]
