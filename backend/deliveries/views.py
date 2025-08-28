from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import DeliveryChoice
from .serializers import DeliveryChoiceSerializer
from orders.models import Order
from decimal import Decimal


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
