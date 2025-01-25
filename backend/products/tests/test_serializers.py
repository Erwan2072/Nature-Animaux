from rest_framework.exceptions import ValidationError
from rest_framework.test import APITestCase
from products.serializers import ProductSerializer

class ProductSerializerTestCase(APITestCase):
    def setUp(self):
        self.valid_data = {
            "title": "Test Product",
            "category": "Category1",
            "sub_category": "SubCategory1",
            "brand": "Brand1",
            "price": 100.0,
            "stock": 10,
        }

    def test_valid_data(self):
        """Test de sérialisation avec des données valides."""
        serializer = ProductSerializer(data=self.valid_data)
        self.assertTrue(serializer.is_valid())

    def test_missing_fields(self):
        """Test de validation avec des champs manquants."""
        invalid_data = self.valid_data.copy()
        invalid_data.pop("title")  # Supprime le champ 'title'
        serializer = ProductSerializer(data=invalid_data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("title", serializer.errors)
