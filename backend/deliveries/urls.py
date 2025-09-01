from django.urls import path
from .views import DeliveryChoiceView, ListDeliveryChoicesView, DeliveryChoiceDetailView, DeleteDeliveryChoiceView, MockDeliveryOptionsView


urlpatterns = [
    # Créer ou mettre à jour un choix de livraison
    path("delivery/", DeliveryChoiceView.as_view(), name="delivery-choice"),

    # Lister toutes les livraisons de l’utilisateur
    path("deliveries/", ListDeliveryChoicesView.as_view(), name="list-deliveries"),

    # Détail d’une livraison (UUID car ton modèle utilise UUIDField)
    path("delivery/<int:pk>/", DeliveryChoiceDetailView.as_view(), name="delivery-detail"),

    # Supprimer une livraison
    path("delivery/<int:pk>/delete/", DeleteDeliveryChoiceView.as_view(), name="delete-delivery"),

    # route mockée pour récupérer les offres selon le poids
    path("delivery/options/", MockDeliveryOptionsView.as_view(), name="delivery-options"),
]
