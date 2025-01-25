from django.test import TestCase
from products.models import Product
from bson import ObjectId


class ProductErrorTests(TestCase):
    def test_delete_invalid_id(self):
        """Test de la suppression avec un ID invalide."""
        invalid_id = "123"
        with self.assertRaises(ValueError):
            Product.delete(invalid_id)

    def test_find_invalid_id(self):
        """Test de la lecture avec un ID mal formaté."""
        invalid_id = "123"
        product = Product.find(invalid_id)
        self.assertIsNone(product)

    def test_create_missing_data(self):
        """Test de la création avec des données manquantes."""
        with self.assertRaises(ValueError) as context:
            Product(
                category="Category1",
                sub_category="SubCategory1",
                brand="Brand1"
            ).save()
        self.assertIn("Les champs 'title'", str(context.exception))
