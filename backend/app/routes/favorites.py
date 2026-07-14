"""
Rutas para gestión de Favoritos.
Cada usuario solo puede ver y gestionar sus propios favoritos.
"""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload
from typing import Optional

from app.db.database import get_db
from app.models.favorite import Favorite
from app.models.property import Property
from app.models.service import Service
from app.models.user import User
from app.schemas.favorite import FavoriteCreate, FavoriteResponse
from app.middlewares.auth import get_current_user

router = APIRouter(prefix="/api/favorites", tags=["Favoritos"])


@router.get("/", response_model=list[FavoriteResponse])
def list_favorites(
    type: Optional[str] = Query(None, description="Filtrar: property o service"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Lista los favoritos del usuario autenticado.
    Puede filtrar por tipo (property o service).
    """
    query = db.query(Favorite).filter(Favorite.user_id == current_user.id)

    if type == "property":
        query = query.filter(Favorite.property_id.isnot(None))
    elif type == "service":
        query = query.filter(Favorite.service_id.isnot(None))

    favorites = query.order_by(Favorite.created_at.desc()).all()
    return [FavoriteResponse.model_validate(f) for f in favorites]


@router.post("/", response_model=FavoriteResponse, status_code=status.HTTP_201_CREATED)
def add_favorite(
    fav_data: FavoriteCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Agrega un favorito.
    Verifica que el recurso exista y que no sea un duplicado.
    """
    # Verificar que el recurso referenciado exista
    if fav_data.property_id:
        prop = db.query(Property).filter(Property.id == fav_data.property_id).first()
        if not prop:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Propiedad no encontrada"
            )
        # Verificar duplicado
        existing = db.query(Favorite).filter(
            Favorite.user_id == current_user.id,
            Favorite.property_id == fav_data.property_id
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Esta propiedad ya está en tus favoritos"
            )

    if fav_data.service_id:
        svc = db.query(Service).filter(Service.id == fav_data.service_id).first()
        if not svc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Servicio no encontrado"
            )
        existing = db.query(Favorite).filter(
            Favorite.user_id == current_user.id,
            Favorite.service_id == fav_data.service_id
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Este servicio ya está en tus favoritos"
            )

    new_favorite = Favorite(
        user_id=current_user.id,
        property_id=fav_data.property_id,
        service_id=fav_data.service_id
    )
    db.add(new_favorite)
    db.commit()
    db.refresh(new_favorite)

    return FavoriteResponse.model_validate(new_favorite)


@router.delete("/{favorite_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_favorite(
    favorite_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Elimina un favorito.
    Solo el dueño del favorito puede eliminarlo.
    """
    favorite = db.query(Favorite).filter(
        Favorite.id == favorite_id,
        Favorite.user_id == current_user.id
    ).first()
    if not favorite:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Favorito no encontrado"
        )

    db.delete(favorite)
    db.commit()


@router.delete("/property/{property_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_property_favorite(
    property_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Elimina un favorito de propiedad por property_id."""
    favorite = db.query(Favorite).filter(
        Favorite.user_id == current_user.id,
        Favorite.property_id == property_id
    ).first()
    if not favorite:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Favorito no encontrado"
        )
    db.delete(favorite)
    db.commit()


@router.delete("/service/{service_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_service_favorite(
    service_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Elimina un favorito de servicio por service_id."""
    favorite = db.query(Favorite).filter(
        Favorite.user_id == current_user.id,
        Favorite.service_id == service_id
    ).first()
    if not favorite:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Favorito no encontrado"
        )
    db.delete(favorite)
    db.commit()
