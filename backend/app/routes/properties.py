"""
Rutas CRUD para el módulo de Arriendos (Properties).
Solo usuarios con rol 'propietario' pueden crear, editar y eliminar.
Cualquier usuario (autenticado o no) puede listar y ver detalles.
"""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_
from typing import Optional

from app.db.database import get_db
from app.models.property import Property
from app.models.user import User
from app.schemas.property import (
    PropertyCreate, PropertyUpdate, PropertyResponse, PropertyListResponse
)
from app.middlewares.auth import get_current_user, require_role
from app.services.validators import check_ownership

router = APIRouter(prefix="/api/properties", tags=["Arriendos"])


@router.get("/", response_model=PropertyListResponse)
def list_properties(
    search: Optional[str] = Query(None, description="Búsqueda por título o descripción"),
    university: Optional[str] = Query(None, description="Filtrar por universidad"),
    property_type: Optional[str] = Query(None, description="Filtrar por tipo de inmueble"),
    min_price: Optional[float] = Query(None, ge=0, description="Precio mínimo"),
    max_price: Optional[float] = Query(None, ge=0, description="Precio máximo"),
    sort_by: Optional[str] = Query("recent", description="Ordenar: recent, price_asc, price_desc"),
    page: int = Query(1, ge=1),
    per_page: int = Query(12, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """
    Lista propiedades con filtros, búsqueda, ordenamiento y paginación.
    Endpoint público (no requiere autenticación).
    """
    query = db.query(Property).options(joinedload(Property.owner))

    # Filtros
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                Property.title.ilike(search_term),
                Property.description.ilike(search_term),
                Property.address.ilike(search_term)
            )
        )
    if university:
        query = query.filter(Property.university.ilike(f"%{university}%"))
    if property_type:
        query = query.filter(Property.property_type == property_type)
    if min_price is not None:
        query = query.filter(Property.price >= min_price)
    if max_price is not None:
        query = query.filter(Property.price <= max_price)

    # Total antes de paginación
    total = query.count()

    # Ordenamiento
    if sort_by == "price_asc":
        query = query.order_by(Property.price.asc())
    elif sort_by == "price_desc":
        query = query.order_by(Property.price.desc())
    else:
        query = query.order_by(Property.created_at.desc())

    # Paginación
    offset = (page - 1) * per_page
    items = query.offset(offset).limit(per_page).all()

    return PropertyListResponse(
        items=[PropertyResponse.model_validate(p) for p in items],
        total=total,
        page=page,
        per_page=per_page
    )


@router.get("/{property_id}", response_model=PropertyResponse)
def get_property(property_id: int, db: Session = Depends(get_db)):
    """
    Obtiene el detalle de una propiedad por ID.
    Endpoint público.
    """
    prop = (
        db.query(Property)
        .options(joinedload(Property.owner))
        .filter(Property.id == property_id)
        .first()
    )
    if not prop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Propiedad no encontrada"
        )
    return PropertyResponse.model_validate(prop)


@router.post("/", response_model=PropertyResponse, status_code=status.HTTP_201_CREATED)
def create_property(
    property_data: PropertyCreate,
    current_user: User = Depends(require_role("propietario")),
    db: Session = Depends(get_db)
):
    """
    Crea una nueva propiedad.
    Solo usuarios con rol 'propietario' pueden crear.
    """
    new_property = Property(
        title=property_data.title,
        description=property_data.description,
        price=property_data.price,
        address=property_data.address,
        property_type=property_data.property_type,
        university=property_data.university,
        images=property_data.images,
        lat=property_data.lat,
        lng=property_data.lng,
        owner_id=current_user.id
    )
    db.add(new_property)
    db.commit()
    db.refresh(new_property)

    # Cargar relación del owner para la respuesta
    db.refresh(new_property, ["owner"])

    return PropertyResponse.model_validate(new_property)


@router.put("/{property_id}", response_model=PropertyResponse)
def update_property(
    property_id: int,
    property_data: PropertyUpdate,
    current_user: User = Depends(require_role("propietario")),
    db: Session = Depends(get_db)
):
    """
    Actualiza una propiedad existente.
    Solo el propietario dueño puede editar (validación de propiedad).
    """
    prop = db.query(Property).filter(Property.id == property_id).first()
    if not prop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Propiedad no encontrada"
        )

    # Validar que el usuario sea el dueño
    check_ownership(prop, current_user.id, "owner_id")

    # Actualizar solo campos proporcionados
    update_data = property_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(prop, field, value)

    db.commit()
    db.refresh(prop)

    return PropertyResponse.model_validate(prop)


@router.delete("/{property_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_property(
    property_id: int,
    current_user: User = Depends(require_role("propietario")),
    db: Session = Depends(get_db)
):
    """
    Elimina una propiedad.
    Solo el propietario dueño puede eliminar.
    """
    prop = db.query(Property).filter(Property.id == property_id).first()
    if not prop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Propiedad no encontrada"
        )

    check_ownership(prop, current_user.id, "owner_id")

    db.delete(prop)
    db.commit()
