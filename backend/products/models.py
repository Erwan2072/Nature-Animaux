from nature_animaux.mongo_config import products_collection
from bson import ObjectId, errors
import logging

# Configurer le logger
logger = logging.getLogger(__name__)

class Product:
    def __init__(self, title=None, category=None, sub_category=None, brand=None, color=None, sku=None, price=None, weight=None, stock=None, description=None, variations=None, product_id=None):
        """Initialisation du produit avec validations."""
        # Validations des champs obligatoires
        if not title or not category or not sub_category or not brand:
            raise ValueError("Les champs 'title', 'category', 'sub_category', et 'brand' sont obligatoires.")

        # Validations des champs numériques
        if price is not None and (not isinstance(price, (int, float)) or price < 0):
            raise ValueError("Le prix doit être un nombre positif.")
        if stock is not None and (not isinstance(stock, int) or stock < 0):
            raise ValueError("Le stock doit être un entier positif.")
        if weight is not None and (not isinstance(weight, (int, float)) or weight < 0):
            raise ValueError("Le poids doit être un nombre positif.")

        # Initialisation des attributs
        self._id = product_id  # Stocke l'ID MongoDB
        self.title = title  # Titre du produit
        self.category = category  # Catégorie principale
        self.sub_category = sub_category  # Sous-catégorie
        self.brand = brand  # Marque
        self.color = color  # Couleur (optionnelle)
        self.sku = sku  # SKU (identifiant unique produit)
        self.price = price  # Prix
        self.weight = weight  # Poids
        self.stock = stock  # Quantité en stock
        self.description = description  # Description
        self.variations = variations if variations else []  # ✅ Liste des variations

    def save(self):
        """Crée ou met à jour un produit dans MongoDB."""
        try:
            # Construction des données à sauvegarder
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
                "variations": self.variations,  # ✅ Ajout des variations
            }

            if self._id:
                # Mise à jour si l'ID existe
                result = products_collection.update_one({"_id": ObjectId(self._id)}, {"$set": product_data})
                if result.matched_count == 0:
                    raise ValueError(f"Produit avec l'ID {self._id} introuvable.")
                logger.info(f"Produit mis à jour : {self.title}")
            else:
                # Création si aucun ID n'est fourni
                result = products_collection.insert_one(product_data)
                self._id = str(result.inserted_id)
                logger.info(f"Produit créé avec ID : {self._id}")
        except Exception as e:
            logger.error(f"Erreur lors de la sauvegarde du produit : {str(e)}")
            raise

    @staticmethod
    def find(product_id):
        """Récupère un produit par son ID."""
        try:
            if not ObjectId.is_valid(product_id):
                logger.error(f"ID invalide pour la recherche : {product_id}")
                raise ValueError(f"'{product_id}' is not a valid ObjectId.")

            product = products_collection.find_one({"_id": ObjectId(product_id)})
            if product:
                return Product(
                    title=product["title"],
                    category=product["category"],
                    sub_category=product["sub_category"],
                    brand=product["brand"],
                    color=product.get("color"),
                    sku=product.get("sku"),
                    price=product.get("price"),
                    weight=product.get("weight"),
                    stock=product.get("stock"),
                    description=product.get("description"),
                    variations=product.get("variations", []),  # ✅ Ajout des variations
                    product_id=str(product["_id"]),
                )
            logger.warning(f"Produit avec l'ID {product_id} introuvable.")
            return None
        except Exception as e:
            logger.error(f"Erreur lors de la recherche du produit {product_id} : {str(e)}")
            return None

    @staticmethod
    def find_all(limit=100):
        """Récupère tous les produits de MongoDB triés par ID."""
        try:
            products = products_collection.find().limit(limit)
            return [
                Product(
                    title=prod["title"],
                    category=prod["category"],
                    sub_category=prod["sub_category"],
                    brand=prod["brand"],
                    color=prod.get("color"),
                    sku=prod.get("sku"),
                    price=prod.get("price"),
                    weight=prod.get("weight"),
                    stock=prod.get("stock"),
                    description=prod.get("description"),
                    variations=prod.get("variations", []),  # ✅ Ajout des variations
                    product_id=str(prod["_id"]),
                )
                for prod in products
            ]
        except Exception as e:
            logger.error(f"Erreur lors de la récupération des produits : {str(e)}")
            return []

    @staticmethod
    def delete(product_id):
        """Supprime un produit par son ID."""
        try:
            if not ObjectId.is_valid(product_id):
                logger.error(f"ID invalide pour la suppression : {product_id}")
                raise ValueError(f"'{product_id}' is not a valid ObjectId.")

            result = products_collection.delete_one({"_id": ObjectId(product_id)})
            if result.deleted_count == 0:
                raise ValueError(f"Produit avec l'ID {product_id} introuvable.")
            logger.info(f"Produit avec l'ID {product_id} supprimé.")
        except ValueError as ve:
            logger.error(f"Erreur : {str(ve)}")
            raise ve
        except Exception as e:
            logger.error(f"Erreur lors de la suppression du produit {product_id} : {str(e)}")
            raise

    @staticmethod
    def delete_all():
        """Supprime tous les produits de MongoDB."""
        try:
            products_collection.delete_many({})
            logger.info("Tous les produits ont été supprimés de la collection.")
        except Exception as e:
            logger.error(f"Erreur lors de la suppression de tous les produits : {str(e)}")
            raise
