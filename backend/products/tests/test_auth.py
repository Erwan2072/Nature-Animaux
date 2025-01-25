from django.test import TestCase
from rest_framework.test import APIClient
from django.contrib.auth.models import User
from unittest.mock import patch


class UserAuthTestCase(TestCase):
    def setUp(self):
        """Prépare les données de test."""
        self.client = APIClient()
        self.user = User.objects.create_user(username="testuser", password="password123")

    def test_user_login_valid(self):
        """Test de la connexion avec des identifiants valides."""
        response = self.client.post(
            "/auth/login/",
            {"username": "testuser", "password": "password123"},
            format="json"
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("token", response.data)

    def test_user_login_invalid(self):
        """Test de la connexion avec des identifiants incorrects."""
        response = self.client.post(
            "/auth/login/",
            {"username": "wronguser", "password": "wrongpassword"},
            format="json"
        )
        self.assertEqual(response.status_code, 400)

    def test_protected_endpoint_no_auth(self):
        """Test de l'accès à un endpoint protégé sans authentification."""
        response = self.client.get("/products/product-list/")
        self.assertEqual(response.status_code, 401)  # Non authentifié retourne 401

    @patch("products.models.Product.find_all", return_value=[])  # Simule une réponse vide

    def test_protected_endpoint_with_auth(self, mock_find_all):
        """Test de l'accès à un endpoint protégé avec authentification."""
        # Connexion pour obtenir un token
        response = self.client.post(
            "/auth/login/",
            {"username": "testuser", "password": "password123"},
            format="json"
        )
        token = response.data.get("token")
        self.assertIsNotNone(token, "Le token est introuvable.")

        # Ajouter le token dans les headers
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {token}")
        response = self.client.get("/products/product-list/")
        self.assertEqual(response.status_code, 200)

