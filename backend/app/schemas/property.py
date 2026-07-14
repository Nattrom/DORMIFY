"""
Esquemas Pydantic para validación de datos de Propiedad (Arriendo).
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from app.schemas.user import UserResponse


# ---------- Entrada ----------

class PropertyCreate(BaseModel):
    """Esquema para crear una nueva propiedad."""
    title: str = Field(..., min_length=3, max_length=200)
    description: str = Field(..., min_length=10)
    price: float = Field(..., gt=0, description="Precio del arriendo (debe ser positivo)")
    address: str = Field(..., min_length=5, max_length=300)
    property_type: str = Field(
        ...,
        pattern="^(habitacion|apartaestudio|apartamento|residencia)$",
        description="Tipo de inmueble"
    )
    university: str = Field(..., min_length=3, max_length=200)
    images: List[str] = Field(default=[], description="Lista de URLs de imágenes")
    lat: Optional[float] = None
    lng: Optional[float] = None


class PropertyUpdate(BaseModel):
    """Esquema para actualizar una propiedad (campos opcionales)."""
    title: Optional[str] = Field(None, min_length=3, max_length=200)
    description: Optional[str] = Field(None, min_length=10)
    price: Optional[float] = Field(None, gt=0)
    address: Optional[str] = Field(None, min_length=5, max_length=300)
    property_type: Optional[str] = Field(
        None,
        pattern="^(habitacion|apartaestudio|apartamento|residencia)$"
    )
    university: Optional[str] = Field(None, min_length=3, max_length=200)
    images: Optional[List[str]] = None
    lat: Optional[float] = None
    lng: Optional[float] = None


# ---------- Salida ----------

class PropertyResponse(BaseModel):
    """Esquema de respuesta para una propiedad con datos del propietario."""
    id: int
    title: str
    description: str
    price: float
    address: str
    property_type: str
    university: str
    images: list
    owner_id: int
    owner: UserResponse
    lat: Optional[float] = None
    lng: Optional[float] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class PropertyListResponse(BaseModel):
    """Esquema para listado paginado de propiedades."""
    items: List[PropertyResponse]
    total: int
    page: int
    per_page: int
