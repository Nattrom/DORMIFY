"""
Esquemas Pydantic para validación de datos de Usuario.
"""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


# ---------- Entrada ----------

class UserCreate(BaseModel):
    """Esquema para registro de nuevo usuario."""
    email: EmailStr
    password: str = Field(..., min_length=6, description="Mínimo 6 caracteres")
    full_name: str = Field(..., min_length=2, max_length=150)
    phone: Optional[str] = Field(None, max_length=20)
    role: str = Field(..., pattern="^(estudiante|propietario|proveedor)$",
                      description="Rol del usuario: estudiante, propietario o proveedor")


class UserLogin(BaseModel):
    """Esquema para inicio de sesión."""
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    """Esquema para actualizar perfil (campos opcionales)."""
    full_name: Optional[str] = Field(None, min_length=2, max_length=150)
    phone: Optional[str] = Field(None, max_length=20)
    avatar_url: Optional[str] = Field(None, max_length=500)


# ---------- Salida ----------

class UserResponse(BaseModel):
    """Esquema de respuesta con datos públicos del usuario."""
    id: int
    email: str
    full_name: str
    phone: Optional[str] = None
    role: str
    avatar_url: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    """Esquema de respuesta con token JWT."""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
