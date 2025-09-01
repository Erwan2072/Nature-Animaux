from rest_framework import permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Cart, CartItem
from .serializers import CartSerializer, CartItemCreateSerializer

def _get_or_create_cart(request):
    user = request.user if request.user.is_authenticated else None
    sid = request.session.session_key or ""
    if not request.session.session_key:
        request.session.save()
        sid = request.session.session_key
    cart, _ = Cart.objects.get_or_create(user=user, session_id=sid)
    return cart

# Consultation du panier
class CartDetailView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        cart = _get_or_create_cart(request)
        return Response(CartSerializer(cart).data)


# Ajout d’un produit
class CartItemAddView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        cart = _get_or_create_cart(request)
        s = CartItemCreateSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        data = s.validated_data

        item, created = CartItem.objects.get_or_create(
            cart=cart,
            product_id=data["product_id"],
            variant_id=data["variant_id"],
            defaults={
                "product_title": data.get("product_title", ""),
                "unit_price": data["unit_price"],
                "quantity": data["quantity"],
                "image_url": data.get("image_url", ""),
                "weight": data.get("weight", 0),
            }
        )
        if not created:
            item.quantity += data["quantity"]
            item.save()

        return Response(
            {"id": item.id, "total_price": item.total_price, "weight": item.weight},
            status=status.HTTP_201_CREATED
        )


# Modification quantité / suppression
class CartItemUpdateDeleteView(APIView):
    permission_classes = [permissions.AllowAny]

    def patch(self, request, pk: int):
        cart = _get_or_create_cart(request)
        item = get_object_or_404(CartItem, pk=pk, cart=cart)
        q = int(request.data.get("quantity", item.quantity))
        item.quantity = max(1, q)
        item.save()
        return Response({"id": item.id, "total_price": item.total_price})

    def delete(self, request, pk: int):
        cart = _get_or_create_cart(request)
        item = get_object_or_404(CartItem, pk=pk, cart=cart)
        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# Choix du mode de livraison
class CartDeliveryView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        """
        Exemple : {
            "delivery_method": "Mondial Relay",
            "delivery_price": 4.90
        }
        """
        cart = _get_or_create_cart(request)

        method = request.data.get("delivery_method")
        price = request.data.get("delivery_price")

        if not method or price is None:
            return Response(
                {"error": "delivery_method et delivery_price sont requis"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # On stocke les infos dans le panier
        cart.delivery_method = method
        cart.delivery_price = price
        cart.save()

        return Response(CartSerializer(cart).data, status=status.HTTP_200_OK)
    