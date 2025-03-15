from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User

class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['email', 'first_name', 'last_name', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            password=validated_data['password']
        )
        return user

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        email = data.get('email')
        password = data.get('password')

        user = authenticate(username=email, password=password)
        if user is None:
            raise serializers.ValidationError('Identifiants incorrects')

        return {'user': user}

class AddressSerializer(serializers.Serializer):
    """Serializer pour l'adresse utilisateur"""
    country = serializers.CharField()
    address = serializers.CharField()
    address_complement = serializers.CharField(required=False, allow_blank=True)
    intercom = serializers.CharField(required=False, allow_blank=True)
    zip_code = serializers.CharField()
    city = serializers.CharField()
    region = serializers.CharField(required=False, allow_blank=True)

class PaymentSerializer(serializers.Serializer):
    """Serializer pour les informations de paiement"""
    last4 = serializers.CharField()
    card_name = serializers.CharField()
    card_expiry = serializers.CharField()
