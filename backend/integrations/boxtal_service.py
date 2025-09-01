import os
import requests
from dotenv import load_dotenv

# Charger les variables d'environnement depuis .env
load_dotenv()

BOXTAL_CLIENT_ID = os.getenv("BOXTAL_CLIENT_ID")
BOXTAL_CLIENT_SECRET = os.getenv("BOXTAL_CLIENT_SECRET")
BOXTAL_BASE_URL = os.getenv("BOXTAL_BASE_URL", "https://api.boxtal.build")


class BoxtalService:
    """Service pour gérer l’authentification et les appels API Boxtal."""

    def __init__(self):
        self.client_id = BOXTAL_CLIENT_ID
        self.client_secret = BOXTAL_CLIENT_SECRET
        self.base_url = BOXTAL_BASE_URL
        self.token = None

    def authenticate(self):
        """Obtenir un access_token Boxtal avec client_id et client_secret."""
        url = f"{self.base_url}/iam/account-app/token"

        # Authentification en Basic Auth (clé accès + clé secrète)
        response = requests.post(
            url,
            headers={"accept": "application/json"},
            auth=(self.client_id, self.client_secret),
        )

        if response.status_code == 200:
            data = response.json()
            self.token = data.get("access_token")
            return self.token
        else:
            raise Exception(
                f"Erreur Auth Boxtal: {response.status_code} - {response.text}"
            )

    def get_headers(self):
        """Retourne les headers avec le token pour appeler d’autres endpoints."""
        if not self.token:
            self.authenticate()
        return {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json",
        }

    # ---------------------------
    # 🚚 Endpoints utiles
    # ---------------------------

    def get_delivery_offers(self, from_postal, to_postal, weight):
        """
        Récupère les offres de transporteurs (tarifs).
        :param from_postal: Code postal d’expédition
        :param to_postal: Code postal de destination
        :param weight: Poids du colis en kg
        """
        url = f"{self.base_url}/shipping/v3.1/shipping-order"

        payload = {
            "from": {"postalCode": from_postal, "country": "FR"},
            "to": {"postalCode": to_postal, "country": "FR"},
            "parcels": [{"weight": weight}],
        }

        response = requests.post(url, json=payload, headers=self.get_headers())

        if response.status_code == 200:
            return response.json()
        else:
            raise Exception(
                f"Erreur récupération offres: {response.status_code} - {response.text}"
            )

    def get_nearby_points(self, postal_code):
        """
        Récupère les points relais à proximité d’un code postal.
        :param postal_code: Code postal (ex: '75001')
        """
        url = f"{self.base_url}/shipping/v3.1/parcel-point?postalCode={postal_code}&country=FR"

        response = requests.get(url, headers=self.get_headers())

        if response.status_code == 200:
            return response.json()
        else:
            raise Exception(
                f"Erreur récupération points relais: {response.status_code} - {response.text}"
            )
