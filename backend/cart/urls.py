from django.urls import path
from .views import CartDetailView, CartItemAddView, CartItemUpdateDeleteView, CartDeliveryView

app_name = "cart"

urlpatterns = [
    path("cart/", CartDetailView.as_view()),
    path("cart/items/", CartItemAddView.as_view()),
    path("cart/items/<int:pk>/", CartItemUpdateDeleteView.as_view()),
    path("cart/delivery/", CartDeliveryView.as_view()),
]
