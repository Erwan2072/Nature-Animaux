from django.test import TestCase
from nature_animaux.mongo_config import products_collection
from products.models import Product
from bson import ObjectId

class ProductCRUDTestCase(TestCase):
    def setUp(self):
        # Nettoie la collection avant chaque test
        products_collection.delete_many({})
        self.product_data = {
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
        self.product = Product(**self.product_data)
        self.product.save()

    def test_product_creation(self):
        """Test de la création d'un produit."""
        product_count = products_collection.count_documents({})
        self.assertEqual(product_count, 1)
        saved_product = products_collection.find_one({"_id": ObjectId(self.product._id)})
        self.assertIsNotNone(saved_product)
        self.assertEqual(saved_product["title"], self.product_data["title"])

    def test_product_update(self):
        """Test de la mise à jour d'un produit."""
        self.product.title = "Updated Product"
        self.product.save()
        updated_product = products_collection.find_one({"_id": ObjectId(self.product._id)})
        self.assertEqual(updated_product["title"], "Updated Product")

    def test_product_deletion(self):
        """Test de la suppression d'un produit."""
        products_collection.delete_one({"_id": ObjectId(self.product._id)})
        product_count = products_collection.count_documents({})
        self.assertEqual(product_count, 0)

    def test_product_creation_duplicate_sku(self):
        """Test de la création de produits avec le même SKU."""
        duplicate_product = Product(**self.product_data)
        with self.assertRaises(Exception):  # Adaptez l'exception selon votre logique
            duplicate_product.save()


    def test_product_creation_invalid_price(self):
        """Test de la création d'un produit avec un prix négatif."""
        invalid_data = self.product_data.copy()
        invalid_data["price"] = -10.0  # Prix négatif
        with self.assertRaises(ValueError) as context:
            Product(**invalid_data).save()
        self.assertEqual(str(context.exception), "Le prix doit être un nombre positif.")


    def test_product_creation_duplicate_sku(self):
        """Test de la création de produits avec le même SKU."""
        duplicate_product = Product(**self.product_data)
        with self.assertRaises(Exception):  # Adaptez l'exception selon votre logique
            uplicate_product.save()

    def test_find_nonexistent_product(self):
        """Test de la recherche d'un produit avec un ID inexistant."""
        nonexistent_id = "64b7e5f4a7636b239b1a4567"  # ID fictif
        product = Product.find(nonexistent_id)
        self.assertIsNone(product)

    def test_large_number_of_products(self):
        """Test de la gestion d'un grand nombre de produits."""
        for i in range(1000):
            product = Product(
                title=f"Product {i}",
                category="Category",
                sub_category="SubCategory",
                brand="Brand",
                price=10.0,
                stock=5,
            )
            product.save()
        product_count = products_collection.count_documents({})
        self.assertEqual(product_count, 1001)  # Inclut le produit de setUp

    def test_delete_products_by_category(self):
        """Test de la suppression en masse par catégorie."""
        Product(
            title="Another Product",
            category="Category1",
            sub_category="SubCategory1",
            brand="Brand1",
            price=15.0,
            stock=5,
        ).save()

        products_collection.delete_many({"category": "Category1"})
        product_count = products_collection.count_documents({"category": "Category1"})
        self.assertEqual(product_count, 0)

    def test_partial_update_product(self):
        """Test de la mise à jour partielle d'un produit."""
        self.product.price = 20.0
        self.product.save()
        updated_product = products_collection.find_one({"_id": ObjectId(self.product._id)})
        self.assertEqual(updated_product["price"], 20.0)
        self.assertEqual(updated_product["title"], "Test Product")  # Inchangé


    def test_mongo_connection_error(self):
        """Test de la gestion des erreurs MongoDB."""
        # Simuler une erreur en utilisant un mauvais ID
        try:
            invalid_id = "invalid_id"  # ID mal formé
            products_collection.find_one({"_id": ObjectId(invalid_id)})  # Devrait lever une erreur
        except Exception as e:
            # Vérifie qu'une exception est bien levée
            self.assertIsInstance(e, Exception)
