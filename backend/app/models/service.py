"""
Modelo de Servicio.
Categorías: lavandería, plomería, electricista, carpintería, papelería, mudanzas, varios.
Cada servicio pertenece a un usuario con rol 'proveedor'.
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON, func
from sqlalchemy.orm import relationship
from app.db.database import Base


class Service(Base):
    __tablename__ = "services"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(50), nullable=False, index=True)
    location = Column(String(300), nullable=True)
    images = Column(JSON, default=list)
    schedule = Column(String(300), nullable=True)  # Horarios de disponibilidad
    contact_info = Column(String(300), nullable=False)
    provider_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relaciones
    provider = relationship("User", back_populates="services")
    favorites = relationship("Favorite", back_populates="service", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Service(id={self.id}, name='{self.name}', category='{self.category}')>"
