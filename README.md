# 🏠 Dormify — Plataforma de Alojamiento Estudiantil

Dormify es una plataforma web dirigida a estudiantes universitarios que buscan habitaciones, apartamentos o residencias cerca de sus universidades. Incluye módulos de **Arriendos**, **Servicios** y un **Foro** comunitario.

## 📋 Módulos del MVP

| Módulo | Descripción |
|--------|-------------|
| **Arriendos** | Publicación y búsqueda de inmuebles (habitaciones, apartaestudios, apartamentos, residencias) |
| **Servicios** | Directorio de servicios útiles (lavandería, plomería, papelería, mudanzas, etc.) |
| **Foro** | Espacio para publicaciones y comentarios de la comunidad estudiantil |

## 🛠️ Stack Tecnológico

- **Backend:** Python 3.10+ con FastAPI
- **Frontend:** HTML5 + CSS3 + JavaScript Vanilla (SPA)
- **Base de Datos:** PostgreSQL
- **ORM:** SQLAlchemy
- **Autenticación:** JWT (JSON Web Tokens)
- **Estilos:** Bootstrap 5 + CSS Custom

## 📂 Estructura del Proyecto

```
dormify/
├── backend/
│   ├── app/
│   │   ├── main.py              # App FastAPI, CORS, routers
│   │   ├── routes/              # Endpoints por módulo
│   │   │   ├── auth.py          # /api/auth (registro, login)
│   │   │   ├── properties.py    # /api/properties (CRUD arriendos)
│   │   │   ├── services.py      # /api/services (CRUD servicios)
│   │   │   ├── posts.py         # /api/posts (CRUD foro + comentarios)
│   │   │   ├── favorites.py     # /api/favorites
│   │   │   └── users.py         # /api/users
│   │   ├── models/              # Modelos SQLAlchemy
│   │   ├── schemas/             # Esquemas Pydantic (validación)
│   │   ├── middlewares/         # Autenticación JWT
│   │   ├── services/            # Validadores y utilidades
│   │   └── db/                  # Conexión BD e inicialización
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── index.html               # Página única SPA
│   ├── css/styles.css            # Sistema de diseño (dark theme)
│   └── js/
│       ├── app.js               # Entry point
│       ├── router.js            # Router SPA hash-based
│       ├── services/            # API client y auth
│       ├── views/               # Vistas por módulo
│       └── utils/               # Validadores y helpers
├── docs/
│   └── decisiones-tecnicas.md
└── README.md
```

## 🚀 Instalación y Ejecución

### Requisitos Previos

- Python 3.10+
- PostgreSQL instalado y ejecutándose
- Git

### 1. Clonar el Repositorio

```bash
git clone <URL-del-repositorio>
cd dormify
```

### 2. Configurar la Base de Datos

Crear la base de datos en PostgreSQL:

```sql
CREATE DATABASE dormify_db;
```

### 3. Configurar Variables de Entorno

Copiar el archivo de ejemplo y ajustar las credenciales:

```bash
cd backend
cp .env.example .env
# Editar .env con tus credenciales de PostgreSQL
```

### 4. Instalar Dependencias del Backend

```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

pip install -r requirements.txt
```

### 5. Inicializar la Base de Datos

```bash
cd backend
python -m app.db.init_db
```

Esto crea las tablas y los datos semilla de prueba.

### 6. Ejecutar el Backend

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

La API estará disponible en: `http://localhost:8000`  
Documentación interactiva (Swagger): `http://localhost:8000/docs`

### 7. Ejecutar el Frontend

Abrir `frontend/index.html` en un navegador, o usar un servidor estático:

```bash
cd frontend
python -m http.server 5500
```

El frontend estará disponible en: `http://localhost:5500`

## 👤 Usuarios de Prueba

| Email | Contraseña | Rol |
|-------|-----------|-----|
| estudiante@dormify.com | 123456 | Estudiante |
| propietario@dormify.com | 123456 | Propietario |
| proveedor@dormify.com | 123456 | Proveedor de Servicios |

## 📌 Roles de Usuario

| Rol | Permisos |
|-----|----------|
| **Estudiante** | Crear posts en el foro, comentar, guardar favoritos |
| **Propietario** | Todo lo anterior + publicar/editar/eliminar arriendos |
| **Proveedor** | Todo lo anterior + publicar/editar/eliminar servicios |

## 📚 API Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/register` | Registro de usuario |
| POST | `/api/auth/login` | Inicio de sesión |
| GET | `/api/auth/me` | Perfil del usuario autenticado |
| GET | `/api/properties/` | Listar arriendos (con filtros) |
| POST | `/api/properties/` | Crear arriendo (propietarios) |
| GET | `/api/properties/{id}` | Detalle de arriendo |
| PUT | `/api/properties/{id}` | Editar arriendo (dueño) |
| DELETE | `/api/properties/{id}` | Eliminar arriendo (dueño) |
| GET | `/api/services/` | Listar servicios (con filtros) |
| POST | `/api/services/` | Crear servicio (proveedores) |
| GET | `/api/posts/` | Listar posts del foro |
| POST | `/api/posts/` | Crear post (autenticados) |
| POST | `/api/posts/{id}/comments` | Agregar comentario |
| GET | `/api/favorites/` | Mis favoritos |
| POST | `/api/favorites/` | Agregar favorito |
| DELETE | `/api/favorites/{id}` | Eliminar favorito |

## 📄 Licencia

Proyecto académico — Universidad. Todos los derechos reservados.
