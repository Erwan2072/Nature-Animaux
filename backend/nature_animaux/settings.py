import os
from pathlib import Path
from datetime import timedelta

# ✅ Base Directory (Garder uniquement cette définition)
BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", "django-insecure-3#&plqt0d!hvl+q98k8@^i+yy*762!t4ixe_===)(pkn#&4wua")

DEBUG = True

ALLOWED_HOSTS = ["127.0.0.1", "localhost", "ton-domaine.com"]

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.sites',
    'django_extensions',


    # Authentification & REST Framework
    'allauth',
    'allauth.account',
    'allauth.socialaccount',
    'allauth.socialaccount.providers.google',
    'dj_rest_auth',
    'rest_framework',
    'rest_framework.authtoken',
    'rest_framework_simplejwt',
    'django_filters',
    'corsheaders',

    # Applications internes
    'products',
    'users',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',  # 🔥 Doit être bien configuré
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'allauth.account.middleware.AccountMiddleware',
]

# ✅ REST Framework Configuration
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',  # ✅ Utilisation de JWT
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',  # ✅ Protège toutes les routes par défaut
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 10,
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
    ],
}

# ✅ Configuration JWT
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'SIGNING_KEY': SECRET_KEY,
    'AUTH_HEADER_TYPES': ('Bearer',),  # ✅ Définit le préfixe du token comme "Bearer"
}

# ✅ Sécurisation des cookies et CSRF
CSRF_TRUSTED_ORIGINS = [
    "http://localhost:4200",
    "https://ton-domaine.com",
]
SESSION_COOKIE_HTTPONLY = True
CSRF_COOKIE_HTTPONLY = True
REST_USE_JWT = True
JWT_AUTH_SECURE = True

# ✅ Configuration de CORS
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = [
    "http://localhost:4200",
    "https://ton-domaine.com",
]
CORS_ALLOW_HEADERS = [
    "authorization",
    "content-type",
    "accept",
    "origin",
    "x-csrf-token",
    "x-requested-with"
]

# ✅ Configuration de Allauth
SOCIALACCOUNT_PROVIDERS = {
    "google": {
        "SCOPE": ["email", "profile"],
        "AUTH_PARAMS": {"access_type": "online"},
    }
}

SITE_ID = 1
ACCOUNT_AUTHENTICATION_METHOD = "email"
ACCOUNT_EMAIL_REQUIRED = True
ACCOUNT_USERNAME_REQUIRED = False  # Désactiver `username`
ACCOUNT_USER_MODEL_USERNAME_FIELD = None  # Empêche allauth de chercher `username`
ACCOUNT_EMAIL_VERIFICATION = "optional"

# ✅ Configuration Django
ROOT_URLCONF = 'nature_animaux.urls'

# ✅ Configuration TEMPLATES
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / "nature_animaux" / "templates"],  # ✅ Correction ici
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'nature_animaux.wsgi.application'

# ✅ Configuration Base de données PostgreSQL
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv("POSTGRES_DB", "nature_animaux_db"),
        'USER': os.getenv("POSTGRES_USER", "nature_admin"),
        'PASSWORD': os.getenv("POSTGRES_PASSWORD", "NewN&Aweb25"),
        'HOST': os.getenv("POSTGRES_HOST", "localhost"),
        'PORT': os.getenv("POSTGRES_PORT", "5432"),
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'fr-fr'
TIME_ZONE = 'Europe/Paris'
USE_I18N = True
USE_TZ = True

# ✅ Correction de STATIC_ROOT
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / "staticfiles"

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

AUTH_USER_MODEL = 'users.User'

APPEND_SLASH = False

AUTHENTICATION_BACKENDS = [
    'allauth.account.auth_backends.AuthenticationBackend',
    'django.contrib.auth.backends.ModelBackend',
]

LOGIN_URL = '/accounts/login/'
LOGIN_REDIRECT_URL = '/'
LOGOUT_REDIRECT_URL = '/'

# Protection contre les attaques XSS
SECURE_BROWSER_XSS_FILTER = True  # Active le filtre XSS du navigateur
SECURE_CONTENT_TYPE_NOSNIFF = True  # Empêche le navigateur de deviner le type de contenu

# Protection contre le framing (Clickjacking)
X_FRAME_OPTIONS = 'DENY'  # Empêche l'intégration du site dans un iframe

# Redirection automatique vers HTTPS (En production uniquement)
SECURE_SSL_REDIRECT = not DEBUG  # Redirige tout le trafic HTTP vers HTTPS en production

# Cookies sécurisés
SESSION_COOKIE_SECURE = True  # Envoie les cookies de session uniquement via HTTPS
CSRF_COOKIE_SECURE = True  # Envoie les cookies CSRF uniquement via HTTPS

# Protection CSRF renforcée
CSRF_COOKIE_HTTPONLY = True  # Rend le cookie CSRF inaccessible via JavaScript
