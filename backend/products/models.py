from nature_animaux.mongo_config import products_collection
from bson import ObjectId, errors
import logging

# Configurer le logger
logger = logging.getLogger(__name__)

class Product:
    def __init__(self, title=None, category=None, sub_category=None, brand=None, color=None, sku=None, price=None, weight=None, stock=None, description=None, variations=None, product_id=None):
        """Initialisation du produit avec validations."""
        if not title or not category or not sub_category or not brand:
            raise ValueError("Les champs 'title', 'category', 'sub_category', et 'brand' sont obligatoires.")
        if price is not None and (not isinstance(price, (int, float)) or price < 0):
            raise ValueError("Le prix doit être un nombre positif.")
        if stock is not None and (not isinstance(stock, int) or stock < 0):
            raise ValueError("Le stock doit être un entier positif.")
        if weight is not None and (not isinstance(weight, (int, float)) or weight < 0):
            raise ValueError("Le poids doit être un nombre positif.")

        self._id = product_id
        self.title = title
        self.category = category
        self.sub_category = sub_category
        self.brand = brand
        self.color = color
        self.sku = sku
        self.price = price
        self.weight = weight
        self.stock = stock
        self.description = description
        self.variations = variations if variations else []

    def save(self):
        try:
            product_data = {
                "title": self.title,
                "category": self.category,
                "sub_category": self.sub_category,
                "brand": self.brand,
                "color": self.color,
                "sku": self.sku,
                "price": self.price,
                "weight": self.weight,
                "stock": self.stock,
                "description": self.description,
                "variations": self.variations,
            }

            if self._id:
                result = products_collection.update_one({"_id": ObjectId(self._id)}, {"$set": product_data})
                if result.matched_count == 0:
                    raise ValueError(f"Produit avec l'ID {self._id} introuvable.")
                logger.info(f"Produit mis à jour : {self.title}")
            else:
                result = products_collection.insert_one(product_data)
                self._id = str(result.inserted_id)
                logger.info(f"Produit créé avec ID : {self._id}")
        except Exception as e:
            logger.error(f"Erreur lors de la sauvegarde du produit : {str(e)}")
            raise

    @staticmethod
    def find(product_id):
        try:
            if not ObjectId.is_valid(product_id):
                logger.error(f"ID invalide pour la recherche : {product_id}")
                raise ValueError(f"'{product_id}' is not a valid ObjectId.")

            product = products_collection.find_one({"_id": ObjectId(product_id)})
            if product:
                return Product(**product, product_id=str(product["_id"]))
            logger.warning(f"Produit avec l'ID {product_id} introuvable.")
            return None
        except Exception as e:
            logger.error(f"Erreur lors de la recherche du produit {product_id} : {str(e)}")
            return None

    @staticmethod
    def find_all(limit=100):
        try:
            products = products_collection.find().limit(limit)
            return [Product(**prod, product_id=str(prod["_id"])) for prod in products]
        except Exception as e:
            logger.error(f"Erreur lors de la récupération des produits : {str(e)}")
            return []

    @staticmethod
    def delete(product_id):
        try:
            if not ObjectId.is_valid(product_id):
                logger.error(f"ID invalide pour la suppression : {product_id}")
                raise ValueError(f"'{product_id}' is not a valid ObjectId.")

            result = products_collection.delete_one({"_id": ObjectId(product_id)})
            if result.deleted_count == 0:
                raise ValueError(f"Produit avec l'ID {product_id} introuvable.")
            logger.info(f"Produit avec l'ID {product_id} supprimé.")
        except Exception as e:
            logger.error(f"Erreur lors de la suppression du produit {product_id} : {str(e)}")
            raise

    @staticmethod
    def delete_all():
        try:
            products_collection.delete_many({})
            logger.info("Tous les produits ont été supprimés de la collection.")
        except Exception as e:
            logger.error(f"Erreur lors de la suppression de tous les produits : {str(e)}")
            raise
