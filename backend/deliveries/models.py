from django.db import models
from orders.models import Order


class DeliveryChoice(models.Model):
    """Représente le choix du mode de livraison pour une commande."""

    MODE_CHOICES = [
        ("RETRAIT", "Retrait en dépôt"),
        ("COLISSIMO", "Colissimo"),
        ("MONDIAL_RELAY", "Mondial Relay"),
    ]

    order = models.OneToOneField(
        Order,
        on_delete=models.CASCADE,
        related_name="delivery_choice"
    )
    mode = models.CharField(max_length=50, choices=MODE_CHOICES)
    fees = models.DecimalField(max_digits=6, decimal_places=2, default=0.00)

    def __str__(self):
        return f"{self.get_mode_display()} - {self.fees} €"
