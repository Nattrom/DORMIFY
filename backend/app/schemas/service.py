"""
Esquemas Pydantic para validación de datos de Servicio.
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from app.schemas.user import UserResponse


# ---------- Entrada ----------

class ServiceCreate(BaseModel):
    """Esquema para crear un nuevo servicio."""
    name: str = Field(..., min_length=3, max_length=200)
    description: str = Field(..., min_length=10)
    category: str = Field(
        ...,
        pattern="^(lavanderia|plomeria|electricista|carpinteria|papeleria|mudanzas|varios)$",
        description="Categoría del servicio"
    )
    location: Optional[str] = Field(None, max_length=300)
    images: List[str] = Field(default=[], description="Lista de URLs de imágenes")
    schedule: Optional[str] = Field(None, max_length=300, description="Horarios de disponibilidad")
    contact_info: str = Field(..., min_length=5, max_length=300)


class ServiceUpdate(BaseModel):
    """Esquema para actualizar un servicio (campos opcionales)."""
    name: Optional[str] = Field(None, min_length=3, max_length=200)
    description: Optional[str] = Field(None, min_length=10)
    category: Optional[str] = Field(
        None,
        pattern="^(lavanderia|plomeria|electricista|carpinteria|papeleria|mudanzas|varios)$"
    )
    location: Optional[str] = Field(None, max_length=300)
    images: Optional[List[str]] = None
    schedule: Optional[str] = Field(None, max_length=300)
    contact_info: Optional[str] = Field(None, min_length=5, max_length=300)


# ---------- Salida ----------

class ServiceResponse(BaseModel):
    """Esquema de respuesta para un servicio con datos del proveedor."""
    id: int
    name: str
    description: str
    category: str
    location: Optional[str] = None
    images: list
    schedule: Optional[str] = None
    contact_info: str
    provider_id: int
    provider: UserResponse
    created_at: datetime

    model_config = {"from_attributes": True}


class ServiceListResponse(BaseModel):
    """Esquema para listado paginado de servicios."""
    items: List[ServiceResponse]
    total: int
    page: int
    per_page: int
