# Decisiones Técnicas — Proyecto Dormify

Este documento registra las decisiones técnicas relevantes del proyecto, incluyendo la justificación y las alternativas consideradas.

---

## 1. Framework de Backend: FastAPI (Python)

**Decisión:** Usar FastAPI como framework de backend.

**Alternativas consideradas:**
- Express.js (Node.js)
- Flask (Python)
- Django (Python)

**Justificación:**
- FastAPI es un framework moderno de Python con tipado estático y validación automática vía Pydantic.
- Genera documentación interactiva automáticamente (Swagger UI en `/docs`).
- Tiene excelente rendimiento gracias a Starlette y Pydantic.
- Compatible con la Ruta Básica del proyecto (Python es una de las tecnologías centrales).
- Curva de aprendizaje menor que Django, más estructurado que Flask.

**Fecha:** Julio 2024  
**Responsable:** Equipo de desarrollo

---

## 2. ORM: SQLAlchemy

**Decisión:** Usar SQLAlchemy como ORM para la interacción con PostgreSQL.

**Alternativas consideradas:**
- psycopg2 directo (SQL crudo)
- Peewee ORM
- Tortoise ORM

**Justificación:**
- SQLAlchemy es el ORM más maduro y documentado del ecosistema Python.
- Permite definir modelos como clases Python, mapeándolos a tablas de PostgreSQL.
- Soporta relaciones, validaciones y migraciones.
- Integración nativa con FastAPI mediante inyección de dependencias.
- Permite SQL crudo cuando sea necesario.

**Fecha:** Julio 2024  
**Responsable:** Equipo de desarrollo

---

## 3. Autenticación: JWT (JSON Web Tokens)

**Decisión:** Implementar autenticación basada en JWT.

**Alternativas consideradas:**
- Sesiones con cookies
- OAuth2 con proveedor externo
- Basic Auth

**Justificación:**
- JWT es stateless, ideal para una arquitectura desacoplada (API REST + SPA).
- No requiere almacenamiento de sesiones en el servidor.
- El token se envía en el header `Authorization: Bearer`, compatible con CORS.
- Permite incluir información del usuario (id, rol) en el payload del token.
- `python-jose` y `passlib` son librerías maduras y seguras para manejo de JWT y hashing.

**Fecha:** Julio 2024  
**Responsable:** Equipo de desarrollo

---

## 4. Frontend: SPA con JavaScript Vanilla

**Decisión:** Construir el frontend como Single Page Application usando JavaScript Vanilla.

**Alternativas consideradas:**
- React / Vue / Angular (no permitidos por las reglas del proyecto)
- Multi-page Application (MPA) tradicional

**Justificación:**
- Las reglas del proyecto restringen el uso de frameworks de frontend.
- Una SPA proporciona mejor experiencia de usuario (sin recargas de página).
- Se implementó un router hash-based manualmente (`router.js`) para manejar la navegación.
- Las vistas son módulos ES6 que exportan funciones `render()` y `afterRender()`.
- Este enfoque demuestra comprensión profunda de JavaScript sin depender de frameworks.

**Fecha:** Julio 2024  
**Responsable:** Equipo de desarrollo

---

## 5. Estilos: Bootstrap 5 + CSS Custom

**Decisión:** Usar Bootstrap 5 como base de estilos y complementar con CSS personalizado.

**Alternativas consideradas:**
- CSS puro (sin framework)
- Tailwind CSS
- Materialize CSS

**Justificación:**
- Bootstrap 5 es permitido por las reglas del proyecto.
- Proporciona un sistema de grid responsive y componentes prediseñados (navbar, forms, buttons).
- Se personalizó extensamente con variables CSS para crear un tema oscuro premium.
- El CSS custom agrega glassmorphism, gradientes y animaciones que Bootstrap no incluye.
- Google Fonts (Inter) mejora la tipografía.

**Fecha:** Julio 2024  
**Responsable:** Equipo de desarrollo

---

## 6. Base de Datos: PostgreSQL

**Decisión:** Usar PostgreSQL como sistema de gestión de base de datos relacional.

**Alternativas consideradas:**
- MySQL
- SQLite (no recomendado para producción)

**Justificación:**
- PostgreSQL es requerido por las reglas del proyecto.
- Soporta tipos de datos JSON nativos (usado para almacenar arrays de URLs de imágenes).
- Excelente soporte para consultas complejas, índices y restricciones.
- Modelo relacional normalizado hasta 3FN.

**Fecha:** Julio 2024  
**Responsable:** Equipo de desarrollo

---

## 7. Visualización de Mapas: Google Maps Embed

**Decisión:** Usar iframes de Google Maps Embed para mostrar la ubicación de inmuebles.

**Alternativas consideradas:**
- Google Maps JavaScript API (requiere API Key)
- Leaflet.js con OpenStreetMap
- Mapbox

**Justificación:**
- Los requisitos del proyecto especifican Google Maps.
- Los embeds con iframe funcionan sin necesidad de API Key para uso básico.
- Se construye la URL del iframe dinámicamente con la dirección o coordenadas del inmueble.
- Simplicidad de implementación sin dependencias adicionales.

**Fecha:** Julio 2024  
**Responsable:** Equipo de desarrollo

---

## 8. Almacenamiento de Imágenes: URLs externas

**Decisión:** Almacenar las imágenes como URLs en un campo JSON en la base de datos.

**Alternativas consideradas:**
- Upload de archivos al servidor
- Servicio de almacenamiento en la nube (S3, Cloudinary)
- Base64 en la BD

**Justificación:**
- Simplifica significativamente el MVP al no requerir manejo de archivos.
- Las URLs se almacenan en un array JSON en PostgreSQL.
- Los usuarios pueden pegar URLs de imágenes alojadas externamente.
- Se proporcionan imágenes de placeholder (Unsplash) para los datos semilla.
- En futuras versiones se puede agregar upload de archivos.

**Fecha:** Julio 2024  
**Responsable:** Equipo de desarrollo
