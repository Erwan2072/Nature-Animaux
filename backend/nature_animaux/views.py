from django.shortcuts import render

def home(request):
    """Page d'accueil avec des boutons pour accéder aux différentes routes"""
    return render(request, "home.html")
