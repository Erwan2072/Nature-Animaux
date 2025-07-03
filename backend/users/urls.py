from django.urls import path
from . import views

app_name = 'users'

urlpatterns = [
    path('register/', views.RegisterUserView.as_view(), name='register'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('logout/', views.LogoutView.as_view(), name='logout'),

    #  Endpoint pour récupérer le profil de l'utilisateur
    path('profile/', views.ProfileView.as_view(), name='profile'),
    #  Endpoint pour modifier le profil utilisateur
    path('profile/update/', views.UpdateProfileView.as_view(), name='update-profile'),

    #  Endpoint pour la connexion avec Google
    path('google/', views.GoogleLogin.as_view(), name='google_login'),
]
