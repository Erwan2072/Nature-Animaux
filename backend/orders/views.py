from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Order
from .serializers import OrderSerializer
from cart.models import Cart


class CreateOrderView(generics.CreateAPIView):
    """Créer une commande à partir d’un panier existant."""

    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        cart_id = request.data.get("cart_id")

        if not cart_id:
            return Response({"error": "cart_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            cart = Cart.objects.get(id=cart_id)
        except Cart.DoesNotExist:
            return Response({"error": "Cart not found"}, status=status.HTTP_404_NOT_FOUND)

        # Vérifie si le cart a déjà une commande
        if hasattr(cart, "order"):
            return Response({"error": "This cart already has an order"}, status=status.HTTP_400_BAD_REQUEST)

        # 🔥 Utiliser la propriété subtotal au lieu de total_price
        order = Order.objects.create(
            user=request.user,
            cart=cart,
            total_price=cart.subtotal
        )

        serializer = self.get_serializer(order)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ListOrdersView(generics.ListAPIView):
    """Lister toutes les commandes de l’utilisateur connecté."""

    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)


class OrderDetailView(generics.RetrieveAPIView):
    """Récupérer le détail d’une commande avec son choix de livraison."""

    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    queryset = Order.objects.all()
