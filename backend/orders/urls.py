from django.urls import path
from .views import CreateOrderView, ListOrdersView, OrderDetailView

urlpatterns = [
    path("create/", CreateOrderView.as_view(), name="create-order"),
    path("", ListOrdersView.as_view(), name="list-orders"),
    path("<int:pk>/", OrderDetailView.as_view(), name="order-detail"),
]
