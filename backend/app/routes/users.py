"""
Rutas para gestión de usuarios (perfil público y listados internos).
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
from app.schemas.user import UserResponse
from app.middlewares.auth import get_current_user

router = APIRouter(prefix="/api/users", tags=["Usuarios"])


@router.get("/{user_id}", response_model=UserResponse)
def get_user_profile(user_id: int, db: Session = Depends(get_db)):
    """
    Obtiene el perfil público de un usuario por ID.
    No requiere autenticación.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    return UserResponse.model_validate(user)
