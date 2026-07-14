"""
Configuración de la conexión a la base de datos PostgreSQL con SQLAlchemy.
Provee el engine, la sesión y la base declarativa para los modelos ORM.
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

# Cargar variables de entorno desde .env
load_dotenv()

# URL de conexión a PostgreSQL (configurable vía .env)
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/dormify_db"
)

# Crear el engine de SQLAlchemy
engine = create_engine(DATABASE_URL, echo=False)

# Fábrica de sesiones para interactuar con la BD
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base declarativa para definir modelos ORM
Base = declarative_base()


def get_db():
    """
    Generador de dependencia para FastAPI.
    Crea una sesión de BD por request y la cierra al finalizar.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
