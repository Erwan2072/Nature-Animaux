from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from products.models import Product


class RoutesTestCase(APITestCase):
    def setUp(self):
        """Préparation des données nécessaires pour les tests."""
        self.client = APIClient()

        # Crée un utilisateur pour les tests
        self.user = User.objects.create_user(username="testuser", password="password123")
        self.admin = User.objects.create_superuser(username="admin", password="password123")
        self.token = Token.objects.create(user=self.user)
        self.admin_token = Token.objects.create(user=self.admin)

        # Endpoints à tester
        self.endpoints = {
            "list": "/products/",
            "create": "/products/product-create/",
            "detail": "/products/product-detail/1/",
            "update": "/products/product-update/1/",
            "delete": "/products/product-delete/1/",
        }

        # Ajouter un produit de test dans MongoDB
        self.test_product = Product(
            title="Test Product",
            category="Category1",
            sub_category="SubCategory1",
            brand="Brand1",
            color="Red",
            sku="12345",
            price=100.0,
            weight=1.5,
            stock=10,
            description="Test description",
        )
        self.test_product.save()  # Sauvegarde le produit dans MongoDB

    def test_routes_unauthorized_access(self):
        """Test des accès non autorisés aux routes protégées."""
        for name, endpoint in self.endpoints.items():
            response = self.client.get(endpoint)  # Requête sans token
            self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED, f"Échec pour {name}")

    def test_routes_authorized_access(self):
        """Test des accès autorisés avec un token valide."""
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.token.key}")

        # Teste uniquement les routes accessibles avec un utilisateur normal
        response = self.client.get(self.endpoints["list"])
        self.assertEqual(response.status_code, status.HTTP_200_OK, "Échec pour /products/")

    def test_admin_routes_access(self):
        """Test des routes réservées à l'administrateur."""
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.admin_token.key}")

        # Données complètes pour la création d'un produit
        product_data = {
            "title": "Test Product",
            "category": "Category1",
            "sub_category": "SubCategory1",
            "brand": "Brand1",
            "color": "Red",
            "sku": "12345",
            "price": 100.0,
            "weight": 1.5,
            "stock": 10,
            "description": "Test description",
        }

        # Test de création
        response = self.client.post(self.endpoints["create"], product_data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, "Échec pour /products/product-create/")

        # Test de mise à jour
        updated_data = {"title": "Updated Product"}
        response = self.client.post(self.endpoints["update"], updated_data, format="json")
        self.assertIn(response.status_code, [status.HTTP_200_OK, status.HTTP_404_NOT_FOUND], "Échec pour /products/product-update/")

        # Test de suppression
        response = self.client.delete(self.endpoints["delete"])
        self.assertIn(response.status_code, [status.HTTP_200_OK, status.HTTP_404_NOT_FOUND], "Échec pour /products/product-delete/")


    def test_nonexistent_routes(self):
        """Test des routes inexistantes."""
        response = self.client.get("/products/nonexistent-route/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
