from nature_animaux.mongo_config import products_collection
from bson import ObjectId

class Product:
    def __init__(self, title, category, sub_category, brand, color=None, sku=None, price=None, weight=None, stock=None, description=None, product_id=None):
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

    def save(self):
        """Crée ou met à jour un produit dans MongoDB."""
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
        }
        if self._id:
            # Met à jour si l'ID existe
            products_collection.update_one({"_id": ObjectId(self._id)}, {"$set": product_data})
        else:
            # Crée si pas d'ID
            result = products_collection.insert_one(product_data)
            self._id = str(result.inserted_id)

    @staticmethod
    def find(product_id):
        """Récupère un produit par son ID."""
        product = products_collection.find_one({"_id": ObjectId(product_id)})
        if product:
            return Product(
                title=product["title"],
                category=product["category"],
                sub_category=product["sub_category"],
                brand=product["brand"],
                color=product.get("color"),  # Récupère la couleur
                sku=product.get("sku"),
                price=product.get("price"),
                weight=product.get("weight"),
                stock=product.get("stock"),
                description=product.get("description"),
                product_id=str(product["_id"]),
            )
        return None
