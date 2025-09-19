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
from .serializers import (
    RegisterSerializer, 
    LoginSerializer, 
    UpdateEmailSerializer, 
    ConfirmEmailSerializer
)
from rest_framework.generics import UpdateAPIView
from rest_framework.parsers import JSONParser
from django.core.mail import send_mail
from django.conf import settings
import jwt
from datetime import datetime, timedelta


# ==============================
# Inscription avec email de confirmation
# ==============================

class RegisterUserView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")

        if User.objects.filter(email=email).exists():
            return Response(
                {"status": "error", "message": "Cet email est déjà utilisé. Veuillez vous connecter ou utiliser un autre email."},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save(is_active=True, is_email_verified=False)

            # Génération du token de confirmation
            token = jwt.encode(
                {
                    "user_id": user.id,
                    "exp": datetime.utcnow() + timedelta(hours=24)  # lien valable 24h
                },
                settings.SECRET_KEY,
                algorithm="HS256"
            )

            # URL du frontend
            frontend_url = getattr(settings, "FRONTEND_URL", "http://localhost:4200")
            confirm_url = f"{frontend_url}/confirm-registration/{token}"

            # Envoi de l'email
            from_email = getattr(settings, "DEFAULT_FROM_EMAIL", "no-reply@nature-animaux.fr")
            send_mail(
                "Activez votre compte Nature & Animaux",
                f"Bonjour {user.first_name or 'utilisateur'},\n\nMerci pour votre inscription sur Nature & Animaux.\n"
                f"Veuillez cliquer sur ce lien pour activer votre compte :\n\n{confirm_url}\n\n"
                "Ce lien expire dans 24 heures.",
                from_email,
                [user.email],
                fail_silently=False,
            )

            return Response(
                {"status": "success", "message": "Utilisateur créé. Un email de confirmation vous a été envoyé."},
                status=status.HTTP_201_CREATED
            )

        return Response({"status": "error", "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


class ConfirmRegistrationView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, token):
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
            user = User.objects.get(id=payload["user_id"])

            if user.is_email_verified:
                return Response({"status": "success", "message": "Votre email est déjà confirmé."}, status=status.HTTP_200_OK)

            user.is_email_verified = True
            user.save()

            return Response({"status": "success", "message": "Votre compte a été activé avec succès."}, status=status.HTTP_200_OK)

        except jwt.ExpiredSignatureError:
            return Response({"status": "error", "message": "Le lien de confirmation a expiré."}, status=status.HTTP_400_BAD_REQUEST)
        except Exception:
            return Response({"status": "error", "message": "Lien invalide."}, status=status.HTTP_400_BAD_REQUEST)


# ==============================
# Connexion / Déconnexion / Profil
# ==============================

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data["user"]

            if not user.is_email_verified:
                return Response(
                    {"status": "error", "message": "Veuillez confirmer votre adresse email avant de vous connecter."},
                    status=status.HTTP_403_FORBIDDEN
                )

            refresh = RefreshToken.for_user(user)
            return Response({
                "status": "success",
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

        return Response({"status": "error", "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh_token")
            if not refresh_token:
                return Response({"status": "error", "message": "Token manquant"}, status=status.HTTP_400_BAD_REQUEST)

            token = RefreshToken(refresh_token)
            token.blacklist()

            return Response({"status": "success", "message": "Déconnexion réussie"}, status=status.HTTP_200_OK)
        except Exception:
            return Response({"status": "error", "message": "Problème lors de la déconnexion"}, status=status.HTTP_400_BAD_REQUEST)


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


class UpdateProfileView(UpdateAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    parser_classes = [JSONParser]

    def get_object(self):
        return self.request.user

    def patch(self, request, *args, **kwargs):
        user = self.get_object()
        serializer = self.get_serializer(user, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response({
                "status": "success",
                "message": "Profil mis à jour avec succès.",
                "user": serializer.data
            }, status=status.HTTP_200_OK)

        return Response({"status": "error", "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


# ==============================
# Changement d'email avec confirmation
# ==============================

class RequestEmailChangeView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        serializer = UpdateEmailSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save(user)

            token = jwt.encode(
                {
                    "user_id": user.id,
                    "new_email": user.pending_email,
                    "exp": datetime.utcnow() + timedelta(hours=1)
                },
                settings.SECRET_KEY,
                algorithm="HS256"
            )

            frontend_url = getattr(settings, "FRONTEND_URL", "http://localhost:4200")
            confirm_url = f"{frontend_url}/confirm-email/{token}"

            from_email = getattr(settings, "DEFAULT_FROM_EMAIL", "no-reply@nature-animaux.fr")
            send_mail(
                "Confirmez votre nouvelle adresse email",
                f"Bonjour {user.first_name or 'utilisateur'},\n\nCliquez sur ce lien pour confirmer votre nouvelle adresse email : {confirm_url}\n\nCe lien expire dans 1 heure.",
                from_email,
                [user.pending_email],
                fail_silently=False,
            )

            return Response(
                {"status": "success", "message": "Un email de confirmation a été envoyé à votre nouvelle adresse."},
                status=status.HTTP_200_OK
            )

        return Response({"status": "error", "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


class ConfirmEmailChangeView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, token):
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
            user = User.objects.get(id=payload["user_id"])

            if user.pending_email != payload["new_email"]:
                return Response({"status": "error", "message": "Le lien n'est pas valide."}, status=status.HTTP_400_BAD_REQUEST)

            serializer = ConfirmEmailSerializer(data={"token": token})
            if serializer.is_valid():
                serializer.save(user)
                return Response({"status": "success", "message": "Votre email a été confirmé avec succès."}, status=status.HTTP_200_OK)

            return Response({"status": "error", "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        except jwt.ExpiredSignatureError:
            return Response({"status": "error", "message": "Le lien de confirmation a expiré."}, status=status.HTTP_400_BAD_REQUEST)
        except Exception:
            return Response({"status": "error", "message": "Lien invalide."}, status=status.HTTP_400_BAD_REQUEST)


# ==============================
# Login via Google
# ==============================

class GoogleLogin(SocialLoginView):
    adapter_class = GoogleOAuth2Adapter
