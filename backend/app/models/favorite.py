"""
Modelo de Favorito.
Un favorito puede referenciar una propiedad O un servicio (polimórfico por nullable FK).
Cada favorito pertenece a un usuario y es privado.
"""

from sqlalchemy import Column, Integer, DateTime, ForeignKey, UniqueConstraint, func
from sqlalchemy.orm import relationship
from app.db.database import Base


class Favorite(Base):
    __tablename__ = "favorites"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    property_id = Column(Integer, ForeignKey("properties.id"), nullable=True)
    service_id = Column(Integer, ForeignKey("services.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Restricción: no duplicar favoritos del mismo recurso para el mismo usuario
    __table_args__ = (
        UniqueConstraint("user_id", "property_id", name="uq_user_property_fav"),
        UniqueConstraint("user_id", "service_id", name="uq_user_service_fav"),
    )

    # Relaciones
    user = relationship("User", back_populates="favorites")
    property = relationship("Property", back_populates="favorites")
    service = relationship("Service", back_populates="favorites")

    def __repr__(self):
        target = f"property={self.property_id}" if self.property_id else f"service={self.service_id}"
        return f"<Favorite(id={self.id}, user={self.user_id}, {target})>"
