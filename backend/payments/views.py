# payments/views.py
import stripe
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from .models import Payment

stripe.api_key = settings.STRIPE_SECRET_KEY

@csrf_exempt
@login_required
def create_payment(request):
    if request.method == "POST":
        try:
            amount = int(request.POST.get("amount", 0))  # ex: 2000 = 20.00€
            user = request.user

            # 1. Créer le PaymentIntent Stripe
            intent = stripe.PaymentIntent.create(
                amount=amount,
                currency="eur",
                automatic_payment_methods={"enabled": True},
            )

            # 2. Sauvegarder en base
            payment = Payment.objects.create(
                user=user,
                amount=amount,
                currency="eur",
                stripe_payment_intent=intent["id"],
                status="created",
            )

            return JsonResponse({
                "clientSecret": intent["client_secret"],
                "paymentId": payment.id
            })

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

    return JsonResponse({"error": "Invalid request"}, status=400)
