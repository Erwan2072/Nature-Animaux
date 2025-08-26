from django.conf import settings
from django.db import models
from django.utils import timezone

User = settings.AUTH_USER_MODEL

class Cart(models.Model):
    user = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL)
    session_id = models.CharField(max_length=64, blank=True, db_index=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def subtotal(self):
        return sum(i.total_price for i in self.items.all())

class CartItem(models.Model):
    cart = models.ForeignKey(Cart, related_name="items", on_delete=models.CASCADE)
    product_id = models.CharField(max_length=50)  # ou 100 si besoin
    variant_id = models.CharField(max_length=100)   # SKU / poids / variation
    product_title = models.CharField(max_length=255, blank=True)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField(default=1)
    image_url = models.URLField(blank=True)

    class Meta:
        indexes = [models.Index(fields=["cart", "product_id", "variant_id"])]

    @property
    def total_price(self):
        return self.unit_price * self.quantity
