"""
Paquete de modelos. Importa todos los modelos para que SQLAlchemy
registre las tablas en Base.metadata al inicializar la aplicación.
"""

from app.models.user import User
from app.models.property import Property
from app.models.service import Service
from app.models.post import Post, Comment
from app.models.favorite import Favorite

__all__ = ["User", "Property", "Service", "Post", "Comment", "Favorite"]
