# Documentation des Endpoints API

## Table des matières
- [Introduction](#introduction)
- [Authentification](#authentification)
- [Endpoints](#endpoints)
  - [Liste des produits](#liste-des-produits)
  - [Détails d'un produit](#details-dun-produit)
  - [Création d'un produit](#creation-dun-produit)
  - [Mise à jour d'un produit](#mise-a-jour-dun-produit)
  - [Suppression d'un produit](#suppression-dun-produit)

## Introduction
Cette documentation décrit les endpoints disponibles dans l'API du projet. L'API permet de gérer des produits, incluant leur création, mise à jour, suppression, ainsi que la possibilité de récupérer des informations détaillées et filtrées.

## Authentification
L'API utilise un système d'authentification basé sur les tokens. Pour accéder à certains endpoints (par exemple, la création, la mise à jour ou la suppression de produits), l'utilisateur doit être administrateur et inclure le token d'authentification dans les en-têtes HTTP.

### Format des en-têtes d'authentification :
```
Authorization: Token <votre_token>
```

## Endpoints

### Liste des produits
- **URL** : `/products/product-list/`
- **Méthode HTTP** : `GET`
- **Description** : Retourne la liste des produits avec pagination, filtrage et recherche.
- **Paramètres optionnels** :
  - `title` : Filtrer par titre.
  - `category` : Filtrer par catégorie.
  - `brand` : Filtrer par marque.
  - `search` : Recherche par mots-clés (titre ou description).
  - `page` : Numéro de page pour la pagination.

#### Exemple de requête :
```
GET /products/product-list/?category=Hygiène&page=1
Authorization: Token <votre_token>
```

#### Exemple de réponse :
```json
{
  "count": 20,
  "next": "http://127.0.0.1:8000/products/product-list/?page=2",
  "previous": null,
  "results": [
    {
      "title": "Litière pour chat",
      "category": "Hygiène",
      "brand": "PetClean",
      "color": "Bleu",
      "sku": "LC123",
      "price": 12.99,
      "weight": 1.5,
      "stock": 50,
      "description": "Litière absorbante pour chats.",
      "_id": "60c72b2f9f1b8b001c8e4c00"
    }
  ]
}
```

---

### Détails d'un produit
- **URL** : `/products/product-detail/<id>/`
- **Méthode HTTP** : `GET`
- **Description** : Retourne les détails d'un produit spécifique.

#### Exemple de requête :
```
GET /products/product-detail/60c72b2f9f1b8b001c8e4c00/
Authorization: Token <votre_token>
```

#### Exemple de réponse :
```json
{
  "title": "Litière pour chat",
  "category": "Hygiène",
  "brand": "PetClean",
  "color": "Bleu",
  "sku": "LC123",
  "price": 12.99,
  "weight": 1.5,
  "stock": 50,
  "description": "Litière absorbante pour chats.",
  "_id": "60c72b2f9f1b8b001c8e4c00"
}
```

---

### Création d'un produit
- **URL** : `/products/product-create/`
- **Méthode HTTP** : `POST`
- **Description** : Crée un nouveau produit. Nécessite une authentification admin.
- **Corps de la requête** :
```json
{
  "title": "Litière pour chat",
  "category": "Hygiène",
  "sub_category": "Accessoires",
  "brand": "PetClean",
  "color": "Bleu",
  "sku": "LC123",
  "price": 12.99,
  "weight": 1.5,
  "stock": 50,
  "description": "Litière absorbante pour chats."
}
```

#### Exemple de réponse :
```json
{
  "_id": "60c72b2f9f1b8b001c8e4c00",
  "title": "Litière pour chat",
  "category": "Hygiène",
  "sub_category": "Accessoires",
  "brand": "PetClean",
  "color": "Bleu",
  "sku": "LC123",
  "price": 12.99,
  "weight": 1.5,
  "stock": 50,
  "description": "Litière absorbante pour chats."
}
```

---

### Mise à jour d'un produit
- **URL** : `/products/product-update/<id>/`
- **Méthode HTTP** : `POST`
- **Description** : Met à jour un produit existant. Nécessite une authentification admin.
- **Corps de la requête** :
```json
{
  "title": "Nouvelle litière pour chat",
  "price": 14.99,
  "stock": 100
}
```

#### Exemple de réponse :
```json
{
  "message": "Product updated successfully"
}
```

---

### Suppression d'un produit
- **URL** : `/products/product-delete/<id>/`
- **Méthode HTTP** : `DELETE`
- **Description** : Supprime un produit existant. Nécessite une authentification admin.

#### Exemple de requête :
```
DELETE /products/product-delete/60c72b2f9f1b8b001c8e4c00/
Authorization: Token <votre_token>
```

#### Exemple de réponse :
```json
{
  "message": "Product deleted successfully!"
}
```

---

## Conclusion
Cette documentation présente tous les endpoints disponibles dans l'API ainsi que leur fonctionnement. En cas de questions ou d'améliorations, merci de contacter l'équipe technique.
