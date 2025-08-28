from django.db import models
from django.conf import settings
from cart.models import Cart


class Order(models.Model):
    """Représente une commande validée à partir d’un panier."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="orders"
    )
    cart = models.OneToOneField(
        Cart,
        on_delete=models.CASCADE,
        related_name="order"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    total_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    def __str__(self):
        return f"Order {self.id} - {self.user.email}"
