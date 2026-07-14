"""
Esquemas Pydantic para validación de datos del Foro (Post y Comment).
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from app.schemas.user import UserResponse


# ---------- Entrada ----------

class PostCreate(BaseModel):
    """Esquema para crear un nuevo post en el foro."""
    title: str = Field(..., min_length=3, max_length=200)
    content: str = Field(..., min_length=10)
    category: Optional[str] = Field(None, max_length=50)


class PostUpdate(BaseModel):
    """Esquema para actualizar un post (campos opcionales)."""
    title: Optional[str] = Field(None, min_length=3, max_length=200)
    content: Optional[str] = Field(None, min_length=10)
    category: Optional[str] = Field(None, max_length=50)


class CommentCreate(BaseModel):
    """Esquema para crear un nuevo comentario."""
    content: str = Field(..., min_length=1)


# ---------- Salida ----------

class CommentResponse(BaseModel):
    """Esquema de respuesta para un comentario."""
    id: int
    content: str
    post_id: int
    author_id: int
    author: UserResponse
    created_at: datetime

    model_config = {"from_attributes": True}


class PostResponse(BaseModel):
    """Esquema de respuesta para un post con sus comentarios."""
    id: int
    title: str
    content: str
    category: Optional[str] = None
    author_id: int
    author: UserResponse
    comments: List[CommentResponse] = []
    created_at: datetime

    model_config = {"from_attributes": True}


class PostListResponse(BaseModel):
    """Esquema para listado paginado de posts (sin comentarios anidados)."""
    items: List[PostResponse]
    total: int
    page: int
    per_page: int
