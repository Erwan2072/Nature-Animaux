from rest_framework import serializers
from .models import DeliveryChoice


class DeliveryChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeliveryChoice
        fields = ["id", "order", "mode", "fees"]
        read_only_fields = ["id"]
