from pymongo import MongoClient

# Connect to MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client["nature_animaux"]
products_collection = db["products"]

# Test de connexion
try:
    client.admin.command("ping")
    print("✅ Connecté à MongoDB")
except Exception as e:
    print("❌ Erreur de connexion MongoDB :", e)

# --- SEED (une seule fois pour faire apparaître la base dans Compass) ---
#products_collection.insert_one({"_seed": True, "title": "Produit test", "price": 1})
#print("✅ Document test inséré")
