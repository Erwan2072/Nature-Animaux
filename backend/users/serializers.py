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


# ==========================
# Nouveaux serializers email
# ==========================

class UpdateEmailSerializer(serializers.Serializer):
    """Demande de changement d'email"""
    new_email = serializers.EmailField()

    def validate_new_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Cet email est déjà utilisé.")
        return value

    def save(self, user):
        """Stocke l'email en attente de confirmation"""
        user.pending_email = self.validated_data['new_email']
        user.save(update_fields=['pending_email'])
        return user


class ConfirmEmailSerializer(serializers.Serializer):
    """Validation du changement d'email via le token reçu par mail"""
    token = serializers.CharField()

    def save(self, user):
        # Ici, la validation du token sera gérée dans la view
        if not user.pending_email:
            raise serializers.ValidationError("Aucun email en attente de confirmation.")
        
        user.email = user.pending_email
        user.pending_email = None
        user.is_email_verified = True
        user.save(update_fields=['email', 'pending_email', 'is_email_verified'])
        return user
