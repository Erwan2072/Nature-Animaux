from pymongo import MongoClient

def test_connection():
    try:
        # Remplacez par votre URI si différent
        client = MongoClient("mongodb://localhost:27017/")
        db = client["nature_animaux"]
        print("Connexion à MongoDB réussie.")
        print("Bases de données disponibles :", client.list_database_names())
    except Exception as e:
        print("Erreur de connexion :", e)

if __name__ == "__main__":
    test_connection()
