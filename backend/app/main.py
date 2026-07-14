"""
Punto de entrada principal de la API de Dormify.
Configura FastAPI, CORS, routers y crea las tablas de la BD al iniciar.
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.db.database import engine, Base
from app.models import User, Property, Service, Post, Comment, Favorite  # noqa: F401 (registra modelos)
from app.routes import auth, properties, services, posts, favorites, users

# Crear tablas en la BD (si no existen)
Base.metadata.create_all(bind=engine)

# Instancia de FastAPI
app = FastAPI(
    title="Dormify API",
    description="API REST para la plataforma Dormify — alojamiento estudiantil, servicios y comunidad.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configuración de CORS para permitir peticiones desde el frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, restringir al dominio del frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------- Manejo global de errores ----------

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Manejo centralizado de errores no capturados."""
    return JSONResponse(
        status_code=500,
        content={"detail": "Error interno del servidor. Intente nuevamente más tarde."}
    )


# ---------- Registrar routers ----------

app.include_router(auth.router)
app.include_router(properties.router)
app.include_router(services.router)
app.include_router(posts.router)
app.include_router(favorites.router)
app.include_router(users.router)


# ---------- Ruta raíz ----------

@app.get("/", tags=["General"])
def root():
    """Endpoint de verificación de salud de la API."""
    return {
        "message": "Bienvenido a la API de Dormify 🏠",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/api/health", tags=["General"])
def health_check():
    """Verificación de salud del servicio."""
    return {"status": "ok", "service": "dormify-api"}
