"""
Validaciones reutilizables del lado del servidor.
"""

import re
from fastapi import HTTPException, status


def validate_email_format(email: str) -> bool:
    """Valida el formato de un correo electrónico."""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))


def validate_password_strength(password: str) -> bool:
    """Valida que la contraseña tenga al menos 6 caracteres."""
    return len(password) >= 6


def validate_phone(phone: str) -> bool:
    """Valida formato de teléfono (solo dígitos, 7-15 caracteres)."""
    pattern = r'^\+?[\d\s\-]{7,15}$'
    return bool(re.match(pattern, phone))


def validate_url(url: str) -> bool:
    """Valida formato básico de URL."""
    pattern = r'^https?://[^\s/$.?#].[^\s]*$'
    return bool(re.match(pattern, url))


def validate_image_urls(urls: list) -> list:
    """
    Valida y filtra una lista de URLs de imágenes.
    Retorna solo las URLs válidas.
    """
    valid_urls = []
    for url in urls:
        if isinstance(url, str) and validate_url(url.strip()):
            valid_urls.append(url.strip())
    return valid_urls


def check_ownership(resource, user_id: int, field: str = "owner_id"):
    """
    Verifica que el usuario sea el dueño del recurso.
    Lanza 403 si no coincide.
    """
    resource_owner_id = getattr(resource, field, None)
    if resource_owner_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para modificar este recurso"
        )
