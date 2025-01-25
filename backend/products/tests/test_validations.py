from rest_framework.test import APITestCase
from products.models import Product
from bson.errors import InvalidId

class ProductValidationTestCase(APITestCase):
    def setUp(self):
        """Préparation pour les tests."""
        self.valid_data = {
            "title": "Valid Product",
            "category": "Category1",
            "sub_category": "SubCategory1",
            "brand": "Brand1",
            "color": "Red",
            "sku": "12345",
            "price": 100.0,
            "weight": 1.5,
            "stock": 10,
            "description": "A valid product description",
        }

    def test_product_creation_without_required_fields(self):
        """Vérifie qu'un produit ne peut pas être créé sans les champs obligatoires."""
        # Tester l'absence du champ 'title'
        invalid_data = self.valid_data.copy()
        invalid_data.pop("title")  # Supprime le champ 'title'
        with self.assertRaises(ValueError) as context:
            Product(**invalid_data).save()
        self.assertEqual(str(context.exception), "Les champs 'title', 'category', 'sub_category', et 'brand' sont obligatoires.")

        # Tester l'absence du champ 'category'
        invalid_data = self.valid_data.copy()
        invalid_data.pop("category")  # Supprime le champ 'category'
        with self.assertRaises(ValueError) as context:
            Product(**invalid_data).save()
        self.assertEqual(str(context.exception), "Les champs 'title', 'category', 'sub_category', et 'brand' sont obligatoires.")

        # Tester l'absence du champ 'brand'
        invalid_data = self.valid_data.copy()
        invalid_data.pop("brand")  # Supprime le champ 'brand'
        with self.assertRaises(ValueError) as context:
            Product(**invalid_data).save()
        self.assertEqual(str(context.exception), "Les champs 'title', 'category', 'sub_category', et 'brand' sont obligatoires.")



    def test_product_with_negative_price(self):
        """Vérifie qu'un prix négatif est rejeté."""
        invalid_data = self.valid_data.copy()
        invalid_data["price"] = -10.0  # Prix négatif
        with self.assertRaises(ValueError):
            Product(**invalid_data).save()

    def test_product_with_negative_stock(self):
        """Vérifie qu'un stock négatif est rejeté."""
        invalid_data = self.valid_data.copy()
        invalid_data["stock"] = -5  # Stock négatif
        with self.assertRaises(ValueError):
            Product(**invalid_data).save()
