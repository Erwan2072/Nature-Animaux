# payments/models.py
from django.db import models
from django.contrib.auth.models import User  # adapte si tu as un User custom

class Payment(models.Model):
    STATUS_CHOICES = [
        ("created", "Created"),
        ("succeeded", "Succeeded"),
        ("failed", "Failed"),
        ("pending", "Pending"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="payments")
    amount = models.IntegerField()  # en centimes
    currency = models.CharField(max_length=10, default="eur")
    stripe_payment_intent = models.CharField(max_length=255)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="created")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Payment {self.id} - {self.user.username} - {self.status}"
