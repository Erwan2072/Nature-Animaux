from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from products.models import Product
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token


class ProductViewsTestCase(APITestCase):
    def setUp(self):
        """Préparation pour les tests."""
        self.client = APIClient()

        # Nettoie la base de données avant chaque test
        Product.delete_all()

        # Crée un utilisateur et génère un token
        self.user = User.objects.create_user(username="testuser", password="password123")
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.token.key}")

        # Crée plusieurs produits pour tester la pagination
        self.products = []
        for i in range(15):
            product = Product(
                title=f"Test Product {i}",
                category="Category1",
                sub_category="SubCategory1",
                brand="Brand1",
                price=100.0 + i,  # Prix unique pour chaque produit
                stock=10 + i  # Stock unique pour chaque produit
            )
            product.save()
            self.products.append(product)

        # Produit spécifique pour les tests de détail
        self.product = Product(
            title="Specific Test Product",
            category="Specific Category",
            sub_category="Specific SubCategory",
            brand="Specific Brand",
            price=200.0,
            stock=5
        )
        self.product.save()
        print(f"Produit créé avec ID : {self.product._id}")  # Ajout d'un log pour déboguer

    def test_get_product_list(self):
        """Test de la récupération de la liste des produits."""
        response = self.client.get("/products/product-list/")  # Vérifie que l'URL est correcte
        print(f"Réponse reçue : {response.data}")  # Log des données reçues pour débogage
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("results", response.data)  # Vérifie la présence de la clé 'results'
        self.assertGreater(len(response.data["results"]), 0)  # Vérifie qu'il y a des produits

        # Vérifie que le premier produit est "Test Product 0"
        expected_first_product_title = "Test Product 0"
        self.assertEqual(
            response.data["results"][0]["title"], expected_first_product_title
        )  # Vérifie que le produit avec le titre attendu est en premier

    def test_get_product_detail(self):
        """Test de la récupération des détails d'un produit."""
        print(f"Produit utilisé pour le test : {self.product._id}")  # Log de l'ID du produit
        response = self.client.get(f"/products/product-detail/{self.product._id}/")
        print(f"Réponse reçue : {response.data}")  # Log des données reçues pour débogage
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["title"], self.product.title)
        self.assertEqual(response.data["category"], self.product.category)
        self.assertEqual(response.data["sub_category"], self.product.sub_category)
        self.assertEqual(response.data["price"], self.product.price)
        self.assertEqual(response.data["stock"], self.product.stock)
