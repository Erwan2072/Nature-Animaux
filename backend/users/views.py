from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from dj_rest_auth.registration.views import SocialLoginView
from .models import User
from .serializers import RegisterSerializer, LoginSerializer
from rest_framework.generics import UpdateAPIView
from rest_framework.parsers import JSONParser

class RegisterUserView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")

        if User.objects.filter(email=email).exists():
            return Response(
                {"error": "Cet email est déjà utilisé. Veuillez vous connecter ou utiliser un autre email."},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(
                {"message": "Utilisateur créé avec succès."},
                status=status.HTTP_201_CREATED
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data["user"]

            # ✅ Génération du token JWT
            refresh = RefreshToken.for_user(user)
            return Response({
                "message": "Connexion réussie",
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": {
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "is_admin": user.is_superuser
                }
            }, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LogoutView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh_token")
            if not refresh_token:
                return Response({"error": "Token manquant"}, status=status.HTTP_400_BAD_REQUEST)

            # ✅ Blacklist du token JWT
            token = RefreshToken(refresh_token)
            token.blacklist()

            return Response({"message": "Déconnexion réussie"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": "Problème lors de la déconnexion"}, status=status.HTTP_400_BAD_REQUEST)

class ProfileView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "is_admin": user.is_superuser
        }, status=status.HTTP_200_OK)

# ✅ Ajout de l'endpoint pour **modifier le profil utilisateur**
class UpdateProfileView(UpdateAPIView):
    """
    ✅ Permet aux utilisateurs authentifiés de modifier leur profil.
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    queryset = User.objects.all()
    serializer_class = RegisterSerializer  # Réutilisation du serializer d'inscription
    parser_classes = [JSONParser]

    def get_object(self):
        """Retourne l'utilisateur actuel."""
        return self.request.user

    def patch(self, request, *args, **kwargs):
        """
        ✅ Mise à jour partielle du profil (PATCH).
        Permet de modifier un ou plusieurs champs sans toucher aux autres.
        """
        user = self.get_object()
        serializer = self.get_serializer(user, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response({
                "message": "Profil mis à jour avec succès.",
                "user": serializer.data
            }, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class GoogleLogin(SocialLoginView):
    adapter_class = GoogleOAuth2Adapter
