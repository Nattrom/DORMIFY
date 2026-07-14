"""
Rutas CRUD para el módulo de Servicios.
Solo usuarios con rol 'proveedor' pueden crear, editar y eliminar.
Cualquier usuario puede listar y ver detalles.
"""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_
from typing import Optional

from app.db.database import get_db
from app.models.service import Service
from app.models.user import User
from app.schemas.service import (
    ServiceCreate, ServiceUpdate, ServiceResponse, ServiceListResponse
)
from app.middlewares.auth import get_current_user, require_role
from app.services.validators import check_ownership

router = APIRouter(prefix="/api/services", tags=["Servicios"])


@router.get("/", response_model=ServiceListResponse)
def list_services(
    search: Optional[str] = Query(None, description="Búsqueda por nombre o descripción"),
    category: Optional[str] = Query(None, description="Filtrar por categoría"),
    sort_by: Optional[str] = Query("recent", description="Ordenar: recent, name_asc"),
    page: int = Query(1, ge=1),
    per_page: int = Query(12, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """
    Lista servicios con filtros, búsqueda y paginación.
    Endpoint público.
    """
    query = db.query(Service).options(joinedload(Service.provider))

    # Filtros
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                Service.name.ilike(search_term),
                Service.description.ilike(search_term)
            )
        )
    if category:
        query = query.filter(Service.category == category)

    # Total
    total = query.count()

    # Ordenamiento
    if sort_by == "name_asc":
        query = query.order_by(Service.name.asc())
    else:
        query = query.order_by(Service.created_at.desc())

    # Paginación
    offset = (page - 1) * per_page
    items = query.offset(offset).limit(per_page).all()

    return ServiceListResponse(
        items=[ServiceResponse.model_validate(s) for s in items],
        total=total,
        page=page,
        per_page=per_page
    )


@router.get("/{service_id}", response_model=ServiceResponse)
def get_service(service_id: int, db: Session = Depends(get_db)):
    """Obtiene el detalle de un servicio por ID."""
    service = (
        db.query(Service)
        .options(joinedload(Service.provider))
        .filter(Service.id == service_id)
        .first()
    )
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Servicio no encontrado"
        )
    return ServiceResponse.model_validate(service)


@router.post("/", response_model=ServiceResponse, status_code=status.HTTP_201_CREATED)
def create_service(
    service_data: ServiceCreate,
    current_user: User = Depends(require_role("proveedor")),
    db: Session = Depends(get_db)
):
    """
    Crea un nuevo servicio.
    Solo usuarios con rol 'proveedor' pueden crear.
    """
    new_service = Service(
        name=service_data.name,
        description=service_data.description,
        category=service_data.category,
        location=service_data.location,
        images=service_data.images,
        schedule=service_data.schedule,
        contact_info=service_data.contact_info,
        provider_id=current_user.id
    )
    db.add(new_service)
    db.commit()
    db.refresh(new_service)
    db.refresh(new_service, ["provider"])

    return ServiceResponse.model_validate(new_service)


@router.put("/{service_id}", response_model=ServiceResponse)
def update_service(
    service_id: int,
    service_data: ServiceUpdate,
    current_user: User = Depends(require_role("proveedor")),
    db: Session = Depends(get_db)
):
    """
    Actualiza un servicio existente.
    Solo el proveedor dueño puede editar.
    """
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Servicio no encontrado"
        )

    check_ownership(service, current_user.id, "provider_id")

    update_data = service_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(service, field, value)

    db.commit()
    db.refresh(service)

    return ServiceResponse.model_validate(service)


@router.delete("/{service_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_service(
    service_id: int,
    current_user: User = Depends(require_role("proveedor")),
    db: Session = Depends(get_db)
):
    """
    Elimina un servicio.
    Solo el proveedor dueño puede eliminar.
    """
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Servicio no encontrado"
        )

    check_ownership(service, current_user.id, "provider_id")

    db.delete(service)
    db.commit()
