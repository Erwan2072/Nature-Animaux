from nature_animaux.mongo_config import products_collection


class Product:
    def __init__(self, name, description, price):
        self.name = name
        self.description = description
        self.price = price

    def save(self):
        product_data = {
            "name": self.name,
            "description": self.description,
            "price": self.price,
        }
        products_collection.insert_one(product_data)

    @staticmethod
    def all():
        return list(products_collection.find())

    @staticmethod
    def delete(product_id):
        products_collection.delete_one({"_id": product_id})
