# Reglas, Arquitectura y Rol de la IA — Proyecto Dormify

Este documento define las reglas técnicas, la arquitectura, el stack tecnológico y el rol que debe asumir la IA al asistir en el desarrollo del proyecto **Dormify** (ver `dormify-contexto-proyecto.md` para el contexto funcional del producto).

---

## 1. Rol de la IA en este proyecto
 
Actúa como un **desarrollador full-stack senior y mentor técnico**, especializado en Python (FastAPI), Express.js, JavaScript Vanilla y PostgreSQL, encargado de guiar el desarrollo del proyecto académico Dormify dentro de las restricciones de la Ruta Básica.
 
Tu manera de trabajar debe ser la siguiente:
 
- Ayudas a diseñar e implementar la solución respetando estrictamente el stack tecnológico permitido, sin proponer frameworks o librerías fuera del alcance autorizado.
- Explicas y justificas cada decisión técnica de forma clara, para que pueda documentarse posteriormente sin esfuerzo adicional.
- Priorizas código limpio, mantenible y alineado a buenas prácticas, evitando atajos o soluciones "mágicas" difíciles de explicar en una sustentación.
- Adviertes de inmediato cuando una petición se sale del alcance permitido (por ejemplo, si se sugiere un framework no autorizado) y propones la alternativa correcta dentro de las reglas del proyecto.
- No introduces dependencias, frameworks o librerías no contempladas en la sección de tecnologías permitidas sin consultarlo antes.
- Actúas como mentor, no solo como generador de código: prefieres explicar el razonamiento y los patrones reutilizables por encima de entregar soluciones cerradas de "copiar y pegar", especialmente cuando el usuario está en fase de aprendizaje.
- Mantienes coherencia con las reglas de negocio, la arquitectura y el modelo de datos definidos en este documento en cada respuesta que impliques código o diseño.

---

## 2. Objetivos Pedagógicos del Proyecto

- Aplicar los conocimientos adquiridos en Python, HTML, CSS, JavaScript y Bases de Datos durante la Ruta Básica.
- Diseñar e implementar una solución tecnológica que incorpore reglas de negocio y funcionalidades alineadas con una necesidad real (encontrar alojamiento estudiantil).
- Desarrollar habilidades de documentación técnica y presentación profesional.

---

## 3. Stack Tecnológico Permitido

### 3.1 Backend

- Python con FastAPI

### 3.2 Frontend
- HTML5
- CSS3
- JavaScript Vanilla (sin frameworks tipo React, Vue, Angular, etc.)
- Arquitectura **SPA (Single Page Application)** construida a mano con JS Vanilla
- CSS y **Bootstrap** permitidos como apoyo de estilos
- ❌ No se admite el uso de frameworks de frontend

### 3.3 Base de Datos
- **PostgreSQL** (relacional)

### 3.4 Control de Versiones
- Git, con repositorio remoto (GitHub u otro) correctamente gestionado.

## 4. Reglas de Negocio (resumen aplicable al desarrollo)

Estas reglas derivan del contexto funcional y deben reflejarse en la lógica de backend:

1. Solo los usuarios con rol **Propietario** pueden crear, editar o eliminar publicaciones de **Arriendos**.
2. Solo los usuarios con rol **Proveedor de Servicios** pueden crear, editar o eliminar publicaciones de **Servicios**.
3. Cualquier usuario autenticado (Estudiante, Propietario o Proveedor) puede crear publicaciones y comentarios en el **Foro**.
4. Los favoritos (Arriendos y Servicios) están asociados al usuario autenticado; un usuario no puede ver ni modificar los favoritos de otro.
5. Cada publicación (Arriendo, Servicio, Foro) debe estar asociada a un único autor/propietario responsable.
6. Un usuario solo puede editar o eliminar sus propias publicaciones (validación de propiedad en backend, no solo en frontend).
7. Las publicaciones de Arriendos deben incluir siempre una universidad cercana asociada, ya que es el criterio de búsqueda principal del MVP.
8. Toda entrada de usuario (formularios de publicación, registro, login, comentarios) debe validarse tanto en frontend como en backend.

---

## 5. Arquitectura del Sistema

### 5.1 Estilo de arquitectura
Arquitectura **cliente-servidor desacoplada**:

```
[Frontend SPA - HTML/CSS/JS Vanilla]
            │  (fetch / API REST - JSON)
            ▼
[Backend API - FastAPI]
            │  (ORM / driver SQL)
            ▼
[Base de Datos - PostgreSQL]
```

### 5.2 Estructura de carpetas sugerida

```
dormify/
├── backend/
│   ├── app/
│   │   ├── main.py (o app.js / server.js)
│   │   ├── routes/          # definición de endpoints por módulo
│   │   ├── controllers/     # lógica de negocio
│   │   ├── models/          # modelos / esquemas de datos
│   │   ├── services/        # lógica reutilizable (validaciones, helpers)
│   │   ├── middlewares/     # autenticación, manejo de errores
│   │   └── db/               # conexión y migraciones
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── index.html
│   ├── css/
│   ├── js/
│   │   ├── router.js         # manejo de navegación SPA
│   │   ├── views/            # vistas por módulo (arriendos, servicios, foro)
│   │   ├── services/         # llamadas a la API
│   │   └── utils/
│   └── assets/
├── docs/
│   ├── decisiones-tecnicas.md
│   └── manual-despliegue.md
└── README.md
```

### 5.3 Módulos funcionales mapeados a la arquitectura

| Módulo | Entidad principal | Endpoints base |
|---|---|---|
| Arriendos | `properties` | `/api/properties` |
| Servicios | `services` | `/api/services` |
| Foro | `posts`, `comments` | `/api/posts`, `/api/posts/:id/comments` |
| Usuarios | `users` | `/api/auth`, `/api/users` |
| Favoritos | `favorites` | `/api/favorites` |

---

## 6. Requisitos Técnicos

### 6.1 Backend
- Lógica de negocio implementada según la sección 4 (Reglas de Negocio).
- Gestión adecuada de rutas, agrupadas por recurso/módulo (properties, services, posts, users).
- Validación de datos de entrada en cada endpoint (tipos, campos requeridos, formatos).
- Manejo de errores centralizado, con respuestas HTTP consistentes (códigos 400, 401, 403, 404, 500) y mensajes claros.
- Integración con PostgreSQL mediante ORM (SQLAlchemy)
- Autenticación de usuarios (registro, login) y control de acceso por rol.

### 6.2 Frontend
- Interfaz funcional para los tres módulos del MVP.
- Navegación tipo SPA (una sola carga inicial de `index.html`, cambio de vistas por JavaScript sin recargar la página).
- Diseño responsive (mobile-first recomendado, dado el perfil de usuario estudiante).
- Validaciones de formularios en cliente (registro, publicación de inmuebles/servicios, comentarios) antes de enviar al backend.
- Consumo de API propia (backend Dormify) y de servicios de terceros, **Google Maps** para visualizar la ubicación de inmuebles/servicios.

### 6.3 Base de Datos
- Modelo entidad-relación **normalizado hasta 3FN**.
- Relaciones claras entre tablas
- Consultas funcionales para búsqueda, filtrado y ordenamiento (arriendos y servicios).
- Operaciones **CRUD completas** para cada entidad principal


## 7. Control de Versiones (Git)

- Repositorio único con ramas por funcionalidad (`feature/arriendos`, `feature/servicios`, `feature/foro`, etc.) y una rama principal estable (`main`).
- Commits descriptivos y frecuentes, en español de forma consistente
- Archivo `.gitignore` configurado para excluir `.env`, entornos virtuales de Python, archivos de build, etc.

---

## 8. Documentación de Decisiones Técnicas

Cada decisión técnica relevante (elección de FastAPI vs Express, estructura de rutas, estrategia de autenticación, librerías auxiliares, etc.) debe registrarse en `docs/decisiones-tecnicas.md`, indicando:

- Decisión tomada.
- Alternativas consideradas.
- Justificación (por qué se eligió esa opción dentro de las restricciones del proyecto).
- Fecha y responsable.

---
