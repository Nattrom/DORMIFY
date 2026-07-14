"""
Rutas CRUD para el módulo de Foro (Posts y Comments).
Cualquier usuario autenticado puede crear posts y comentarios.
Un usuario solo puede editar/eliminar sus propios posts.
"""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_
from typing import Optional

from app.db.database import get_db
from app.models.post import Post, Comment
from app.models.user import User
from app.schemas.post import (
    PostCreate, PostUpdate, CommentCreate,
    PostResponse, CommentResponse, PostListResponse
)
from app.middlewares.auth import get_current_user
from app.services.validators import check_ownership

router = APIRouter(prefix="/api/posts", tags=["Foro"])


@router.get("/", response_model=PostListResponse)
def list_posts(
    search: Optional[str] = Query(None, description="Búsqueda por título o contenido"),
    category: Optional[str] = Query(None, description="Filtrar por categoría"),
    sort_by: Optional[str] = Query("recent", description="Ordenar: recent, oldest"),
    page: int = Query(1, ge=1),
    per_page: int = Query(12, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """
    Lista posts del foro con búsqueda, filtros y paginación.
    Endpoint público.
    """
    query = db.query(Post).options(
        joinedload(Post.author),
        joinedload(Post.comments).joinedload(Comment.author)
    )

    # Filtros
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                Post.title.ilike(search_term),
                Post.content.ilike(search_term)
            )
        )
    if category:
        query = query.filter(Post.category == category)

    # Total (usando subquery para evitar problemas con joinedload)
    count_query = db.query(Post)
    if search:
        search_term = f"%{search}%"
        count_query = count_query.filter(
            or_(Post.title.ilike(search_term), Post.content.ilike(search_term))
        )
    if category:
        count_query = count_query.filter(Post.category == category)
    total = count_query.count()

    # Ordenamiento
    if sort_by == "oldest":
        query = query.order_by(Post.created_at.asc())
    else:
        query = query.order_by(Post.created_at.desc())

    # Paginación
    offset = (page - 1) * per_page
    items = query.offset(offset).limit(per_page).all()

    # Deduplicar resultados por joinedload
    seen_ids = set()
    unique_items = []
    for item in items:
        if item.id not in seen_ids:
            seen_ids.add(item.id)
            unique_items.append(item)

    return PostListResponse(
        items=[PostResponse.model_validate(p) for p in unique_items],
        total=total,
        page=page,
        per_page=per_page
    )


@router.get("/{post_id}", response_model=PostResponse)
def get_post(post_id: int, db: Session = Depends(get_db)):
    """Obtiene un post con todos sus comentarios."""
    post = (
        db.query(Post)
        .options(
            joinedload(Post.author),
            joinedload(Post.comments).joinedload(Comment.author)
        )
        .filter(Post.id == post_id)
        .first()
    )
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Publicación no encontrada"
        )
    return PostResponse.model_validate(post)


@router.post("/", response_model=PostResponse, status_code=status.HTTP_201_CREATED)
def create_post(
    post_data: PostCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Crea un nuevo post en el foro.
    Cualquier usuario autenticado puede crear posts.
    """
    new_post = Post(
        title=post_data.title,
        content=post_data.content,
        category=post_data.category,
        author_id=current_user.id
    )
    db.add(new_post)
    db.commit()
    db.refresh(new_post)
    db.refresh(new_post, ["author"])

    return PostResponse.model_validate(new_post)


@router.put("/{post_id}", response_model=PostResponse)
def update_post(
    post_id: int,
    post_data: PostUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Actualiza un post existente.
    Solo el autor puede editar su propio post.
    """
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Publicación no encontrada"
        )

    check_ownership(post, current_user.id, "author_id")

    update_data = post_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(post, field, value)

    db.commit()
    db.refresh(post)

    return PostResponse.model_validate(post)


@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_post(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Elimina un post y todos sus comentarios.
    Solo el autor puede eliminar su propio post.
    """
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Publicación no encontrada"
        )

    check_ownership(post, current_user.id, "author_id")

    db.delete(post)
    db.commit()


# ---------- Comentarios ----------

@router.get("/{post_id}/comments", response_model=list[CommentResponse])
def list_comments(post_id: int, db: Session = Depends(get_db)):
    """Lista todos los comentarios de un post."""
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Publicación no encontrada"
        )

    comments = (
        db.query(Comment)
        .options(joinedload(Comment.author))
        .filter(Comment.post_id == post_id)
        .order_by(Comment.created_at.asc())
        .all()
    )
    return [CommentResponse.model_validate(c) for c in comments]


@router.post("/{post_id}/comments", response_model=CommentResponse,
             status_code=status.HTTP_201_CREATED)
def create_comment(
    post_id: int,
    comment_data: CommentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Agrega un comentario a un post.
    Cualquier usuario autenticado puede comentar.
    """
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Publicación no encontrada"
        )

    new_comment = Comment(
        content=comment_data.content,
        post_id=post_id,
        author_id=current_user.id
    )
    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)
    db.refresh(new_comment, ["author"])

    return CommentResponse.model_validate(new_comment)


@router.delete("/{post_id}/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_comment(
    post_id: int,
    comment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Elimina un comentario.
    Solo el autor del comentario puede eliminarlo.
    """
    comment = (
        db.query(Comment)
        .filter(Comment.id == comment_id, Comment.post_id == post_id)
        .first()
    )
    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comentario no encontrado"
        )

    check_ownership(comment, current_user.id, "author_id")

    db.delete(comment)
    db.commit()
