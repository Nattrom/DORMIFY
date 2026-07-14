"""
Modelo de Propiedad (Arriendo).
Tipos: habitación, apartaestudio, apartamento, residencia estudiantil.
Cada propiedad pertenece a un usuario con rol 'propietario'.
"""

from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey, JSON, func
from sqlalchemy.orm import relationship
from app.db.database import Base


class Property(Base):
    __tablename__ = "properties"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    price = Column(Float, nullable=False)
    address = Column(String(300), nullable=False)
    property_type = Column(String(30), nullable=False)  # 'habitacion', 'apartaestudio', 'apartamento', 'residencia'
    university = Column(String(200), nullable=False, index=True)
    images = Column(JSON, default=list)  # Array de URLs de imágenes
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relaciones
    owner = relationship("User", back_populates="properties")
    favorites = relationship("Favorite", back_populates="property", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Property(id={self.id}, title='{self.title}', type='{self.property_type}')>"
