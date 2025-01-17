#!/usr/bin/env python3
import os
import sys

if __name__ == "__main__":
    # Définit les paramètres Django
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "nature_animaux.settings")

    # Ajoute le chemin absolu du dossier backend au PYTHONPATH
    current_path = os.path.dirname(os.path.abspath(__file__))
    sys.path.append(os.path.join(current_path, "backend"))

    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Impossible d'importer Django. Assurez-vous qu'il est installé et "
            "disponible sur votre environnement PYTHONPATH. Activez également "
            "votre environnement virtuel si nécessaire."
        ) from exc

    execute_from_command_line(sys.argv)
