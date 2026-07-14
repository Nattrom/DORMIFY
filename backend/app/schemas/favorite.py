"""
Esquemas Pydantic para validación de datos de Favoritos.
"""

from pydantic import BaseModel, Field, model_validator
from typing import Optional
from datetime import datetime


# ---------- Entrada ----------

class FavoriteCreate(BaseModel):
    """
    Esquema para agregar un favorito.
    Se debe enviar property_id O service_id, no ambos.
    """
    property_id: Optional[int] = None
    service_id: Optional[int] = None

    @model_validator(mode="after")
    def validate_target(self):
        if self.property_id is None and self.service_id is None:
            raise ValueError("Debe indicar property_id o service_id")
        if self.property_id is not None and self.service_id is not None:
            raise ValueError("Solo puede indicar property_id o service_id, no ambos")
        return self


# ---------- Salida ----------

class FavoriteResponse(BaseModel):
    """Esquema de respuesta para un favorito."""
    id: int
    user_id: int
    property_id: Optional[int] = None
    service_id: Optional[int] = None
    created_at: datetime

    model_config = {"from_attributes": True}
