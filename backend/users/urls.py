from django.urls import path
from .views import RegisterUserView, ProfileView, LoginView, LogoutView, GoogleLogin

urlpatterns = [
    path('register/', RegisterUserView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),  # ✅ Uniformisation
    path('logout/', LogoutView.as_view(), name='logout'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('google/', GoogleLogin.as_view(), name='google_login'),  # ✅ Uniformisation
]
