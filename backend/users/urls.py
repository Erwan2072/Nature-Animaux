from django.urls import path
from . import views

app_name = 'users'

urlpatterns = [
    path('register/', views.RegisterUserView.as_view(), name='register'),
    path('login/', views.LoginView.as_view(), name='login'),  # ✅ Uniformisation
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('profile/', views.ProfileView.as_view(), name='profile'),
    path('google/', views.GoogleLogin.as_view(), name='google_login'),  # ✅ Uniformisation
]
