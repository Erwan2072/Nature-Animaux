from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
import logging

# Configuration du logger
logger = logging.getLogger(__name__)

class UserManager(BaseUserManager):
    """Manager personnalisé pour le modèle User avec des méthodes optimisées."""

    def create_user(self, email, password=None, **extra_fields):
        """Crée un utilisateur standard avec validations optimisées."""
        if not email:
            raise ValueError(_("L'email est obligatoire"))
        email = self.normalize_email(email)

        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)

        logger.info(f"✅ Utilisateur créé : {user.email}")
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        """Crée un super-utilisateur avec les permissions nécessaires."""
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError(_("Le super-utilisateur doit avoir is_staff=True."))
        if extra_fields.get("is_superuser") is not True:
            raise ValueError(_("Le super-utilisateur doit avoir is_superuser=True."))

        return self.create_user(email, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    """Modèle utilisateur personnalisé avec email comme identifiant unique."""
    email = models.EmailField(_("email address"), unique=True)
    first_name = models.CharField(_("first name"), max_length=30, blank=True, null=True)
    last_name = models.CharField(_("last name"), max_length=30, blank=True, null=True)
    is_active = models.BooleanField(_("active"), default=True)
    is_staff = models.BooleanField(_("staff status"), default=False)
    date_joined = models.DateTimeField(_("date joined"), default=timezone.now)  # ✅ Ajout de la date d'inscription

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    class Meta:
        verbose_name = _("user")
        verbose_name_plural = _("users")
        ordering = ['-date_joined']  # ✅ Trie par date d'inscription pour plus de performances

    def __str__(self):
        return self.email
