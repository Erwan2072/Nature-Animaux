from rest_framework.decorators import api_view
from rest_framework.response import Response
from nature_animaux.mongo_config import products_collection  # Import MongoDB collection

@api_view(['GET'])
def api_overview(request):
    api_urls = {
        'List': '/product-list/',
        'Detail': '/product-detail/<str:pk>/',
        'Create': '/product-create/',
        'Update': '/product-update/<str:pk>/',
        'Delete': '/product-delete/<str:pk>/',
    }
    return Response(api_urls)

@api_view(['GET'])
def product_list(request):
    products = list(products_collection.find({}))  # Récupère tous les produits de MongoDB
    for product in products:
        product['_id'] = str(product['_id'])  # Convertit ObjectId en chaîne de caractères
    return Response(products)

@api_view(['GET'])
def product_detail(request, pk):
    from bson import ObjectId
    product = products_collection.find_one({"_id": ObjectId(pk)})
    if product:
        product['_id'] = str(product['_id'])  # Convertit ObjectId en chaîne de caractères
        return Response(product)
    return Response({"error": "Product not found"}, status=404)

@api_view(['POST'])
def product_create(request):
    product_data = request.data
    result = products_collection.insert_one(product_data)  # Insère un produit dans MongoDB
    product_data['_id'] = str(result.inserted_id)
    return Response(product_data)

@api_view(['POST'])
def product_update(request, pk):
    from bson import ObjectId
    product_data = request.data
    result = products_collection.update_one(
        {"_id": ObjectId(pk)}, {"$set": product_data}
    )
    if result.matched_count == 0:
        return Response({"error": "Product not found"}, status=404)
    return Response({"message": "Product updated successfully"})

@api_view(['DELETE'])
def product_delete(request, pk):
    from bson import ObjectId
    result = products_collection.delete_one({"_id": ObjectId(pk)})
    if result.deleted_count == 0:
        return Response({"error": "Product not found"}, status=404)
    return Response({"message": "Product deleted successfully!"})
