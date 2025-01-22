from mongo_config import products_collection

def test_mongo_connection():
    try:
        # Ajouter un produit test avec plusieurs variations
        product = {
            "title": "Produit Test",
            "Animals": "Animal Test",
            "category": "Test",
            "Sous-category": "Test",
            "brand": "marque test",
            "variations": [
                {"sku": "12345", "price": 9.99, "weight": 1.5, "stock": 10},
                {"sku": "67890", "price": 19.99, "weight": 3.0, "stock": 5}
            ],
            "photo": "test.jpg",
            "description": "Ceci est un produit test avec deux variations"
        }
        products_collection.insert_one(product)

        # Vérifier si le produit a été inséré
        print("Produits dans la collection :")
        products = products_collection.find()
        for p in products:
            print(p)

        print("Connexion à MongoDB réussie !")

    except Exception as e:
        print(f"Erreur de connexion : {e}")

test_mongo_connection()
