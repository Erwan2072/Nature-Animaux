import uuid
from django.conf import settings
from django.db import models
from django.utils import timezone
from decimal import Decimal

User = settings.AUTH_USER_MODEL


class Cart(models.Model):
    user = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL)
    session_id = models.CharField(max_length=64, blank=True, db_index=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def subtotal(self):
        """Sous-total = somme des prix des items"""
        return sum((i.total_price for i in self.items.all()), Decimal("0.00"))

    @property
    def total_weight(self):
        """Poids total du panier en kg (poids * quantité pour chaque item)."""
        return sum((i.total_weight for i in self.items.all()), Decimal("0.00"))


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, related_name="items", on_delete=models.CASCADE)
    product_id = models.CharField(max_length=50)
    variant_id = models.CharField(max_length=100)
    product_title = models.CharField(max_length=255, blank=True)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField(default=1)
    image_url = models.URLField(blank=True)

    # ✅ poids unitaire en DecimalField
    weight = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        default=0.0,
        help_text="Poids unitaire de la variation (en kg)"
    )

    class Meta:
        indexes = [models.Index(fields=["cart", "product_id", "variant_id"])]

    @property
    def total_price(self):
        return self.unit_price * self.quantity

    @property
    def total_weight(self):
        return (self.weight or Decimal("0.00")) * self.quantity


class DeliveryChoice(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    cart = models.OneToOneField(Cart, on_delete=models.CASCADE, related_name="delivery_choice")
    mode = models.CharField(
        max_length=100,
        choices=[
            ("retrait", "Retrait au dépôt"),
            ("livraison", "Livraison standard"),
            ("mondial_relay", "Mondial Relay"),
            ("chronopost", "Chronopost"),
            ("colissimo", "Colissimo"),
        ],
        default="retrait"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.cart} - {self.mode}"
