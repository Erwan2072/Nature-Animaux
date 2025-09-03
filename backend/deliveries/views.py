from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from .models import DeliveryChoice
from .serializers import DeliveryChoiceSerializer
from orders.models import Order
from cart.models import Cart, CartItem
from products.models import Product
from decimal import Decimal
from bson import ObjectId


class DeliveryChoiceView(generics.CreateAPIView):
    """Permet de choisir ou modifier le mode de livraison pour une commande."""

    serializer_class = DeliveryChoiceSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        order_id = request.data.get("order")
        mode = request.data.get("mode")
        fees = request.data.get("fees", 0.00)

        try:
            order = Order.objects.get(id=order_id)
        except Order.DoesNotExist:
            return Response({"error": "Order not found"}, status=status.HTTP_404_NOT_FOUND)

        # Vérifie si un choix existe déjà → on met à jour
        delivery, created = DeliveryChoice.objects.update_or_create(
            order=order,
            defaults={"mode": mode, "fees": fees},
        )

        # Met à jour le total de la commande (articles + frais)
        order.total_price = order.cart.subtotal + Decimal(str(fees))
        order.save()

        serializer = self.get_serializer(delivery)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ListDeliveryChoicesView(generics.ListAPIView):
    """Lister toutes les livraisons de l’utilisateur connecté."""

    serializer_class = DeliveryChoiceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return DeliveryChoice.objects.filter(order__user=self.request.user)


class DeliveryChoiceDetailView(generics.RetrieveAPIView):
    """Voir le détail d’un choix de livraison précis."""

    serializer_class = DeliveryChoiceSerializer
    permission_classes = [IsAuthenticated]
    queryset = DeliveryChoice.objects.all()


class DeleteDeliveryChoiceView(generics.DestroyAPIView):
    """Supprimer un choix de livraison."""

    serializer_class = DeliveryChoiceSerializer
    permission_classes = [IsAuthenticated]
    queryset = DeliveryChoice.objects.all()


# ----------------------------
# 🚚 Mock dynamique du calcul livraison
# ----------------------------
class MockDeliveryOptionsView(APIView):
    """
    Retourne :
    - le sous-total du panier,
    - le poids total,
    - le détail des articles (id, titre, quantité, prix unitaire, total, poids),
    - et les frais de livraison mockés (Colissimo, Mondial Relay, Chronopost).
    """

    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        # 🔹 Récupérer le panier (session ou user)
        user = request.user if request.user.is_authenticated else None
        sid = request.session.session_key or ""
        if not request.session.session_key:
            request.session.save()
            sid = request.session.session_key

        cart, _ = Cart.objects.get_or_create(user=user, session_id=sid)

        # 🔹 Calcul du poids total + détails articles
        total_weight = 0
        items_detail = []

        for item in cart.items.all():
            # Valeur par défaut → poids du CartItem
            weight = float(item.weight) if item.weight else 0

            print(f"🛒 Item: {item.product_title} | Qty={item.quantity} | Poids enregistré={item.weight}")

            # Si pas de poids dans le CartItem, tenter côté Mongo
            if weight == 0:
                product = Product.find(item.product_id)
                if product:
                    variation = next(
                        (v for v in product.variations if v.get("sku") == item.variant_id),
                        None
                    )
                    if variation and "weight" in variation:
                        weight = float(variation["weight"])
                        print(f"👉 Fallback Mongo trouvé : {weight}")

            total_weight += weight * item.quantity

            items_detail.append({
                "id": item.id,
                "product_id": item.product_id,
                "variant_id": item.variant_id,
                "title": item.product_title,
                "unit_price": float(item.unit_price),
                "quantity": item.quantity,
                "total_price": float(item.total_price),
                "weight": weight,
            })

        print(f"📦 TOTAL WEIGHT calculé = {total_weight}")

        if total_weight == 0:
            total_weight = 1  # fallback si aucun poids trouvé

        # 🔹 Sous-total
        subtotal = float(cart.subtotal)

        # 🔹 Tarifs mockés
        def colissimo_price(w):
            if w <= 5: return 6.50
            if w <= 10: return 8.50
            if w <= 20: return 12.00
            return 18.00

        def mondial_relay_price(w):
            if w <= 5: return 4.90
            if w <= 10: return 6.90
            if w <= 20: return 9.50
            return 14.00

        def chronopost_price(w):
            if w <= 5: return 9.90
            if w <= 10: return 12.90
            if w <= 20: return 18.90
            return 25.00

        options = [
            {"mode": "colissimo", "label": "Colissimo", "fees": colissimo_price(total_weight)},
            {"mode": "mondial_relay", "label": "Mondial Relay", "fees": mondial_relay_price(total_weight)},
            {"mode": "chronopost", "label": "Chronopost", "fees": chronopost_price(total_weight)},
        ]

        print("📦 Poids total calculé :", total_weight)
        print("🛒 Subtotal :", subtotal)


        # 🔹 Réponse finale
        return Response({
            "subtotal": subtotal,
            "total_weight": total_weight,
            "items": items_detail,
            "options": options
        })
