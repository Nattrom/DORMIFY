# Contexto del Proyecto: Dormify

## 1. Visión General

**Dormify** es una plataforma web dirigida inicialmente a estudiantes universitarios que buscan habitaciones, apartamentos o residencias cerca de sus universidades.

Dormify no busca ser simplemente una plataforma inmobiliaria: su visión a largo plazo es convertirse en una **comunidad estudiantil integral**, donde los estudiantes puedan no solo encontrar alojamiento, sino también compartir experiencias, publicar contenido, encontrar compañeros de habitación, recibir recomendaciones e interactuar entre sí.

## 2. Alcance del MVP

El primer producto mínimo viable (MVP) se centrará exclusivamente en tres módulos:

1. **Arriendos**
2. **Servicios**
3. **Foro**

Cualquier otra funcionalidad (mensajería, sistema de matching de roommates, perfiles sociales avanzados, etc.) queda fuera del alcance del MVP y se contempla para futuras versiones.

## 3. Objetivo del MVP

> Facilitar que un estudiante encuentre un lugar para vivir cerca de su universidad.

Este es el problema central que el MVP debe resolver. Los módulos de Servicios y Foro existen como funcionalidades complementarias que enriquecen esa experiencia principal, no como objetivos independientes.

## 4. Módulos del MVP

### 4.1 Módulo de Arriendos (módulo principal)

Permite a los propietarios publicar inmuebles de los siguientes tipos:

- Habitación
- Apartaestudio
- Apartamento
- Residencia estudiantil

**Cada publicación incluye:**

| Campo | Detalle |
|---|---|
| Título | Nombre descriptivo de la publicación |
| Descripción | Servicios incluidos, reglas y disponibilidad |
| Precio | Valor del arriendo |
| Dirección | Ubicación del inmueble |
| Universidad cercana | Referencia geográfica clave para el estudiante |
| Imágenes | Fotografías del inmueble |
| Información del propietario | Datos de contacto |

**Funcionalidades para el estudiante:**
- Buscar inmuebles
- Filtrar resultados
- Ordenar resultados
- Guardar favoritos
- Visualizar el detalle de un inmueble

### 4.2 Módulo de Servicios

Permite publicar servicios útiles para la vida estudiantil, tales como:

- Lavanderías
- Plomería
- Electricista
- Carpintería
- Papelerías
- Mudanzas
- Servicios varios (limpieza de habitaciones, planchado de ropa, chefs, etc.)

**Cada servicio incluye:**

| Campo | Detalle |
|---|---|
| Nombre | Nombre del servicio |
| Descripción | Detalle de lo que ofrece |
| Categoría | Tipo de servicio |
| Ubicación | Opcional |
| Imágenes | Fotografías o material visual |
| Horarios | Disponibilidad del servicio |
| Información de contacto | Datos para comunicarse con el proveedor |

**Funcionalidades para el estudiante:**
- Buscar servicios
- Filtrar resultados
- Guardar favoritos
- Ver detalle del servicio

### 4.3 Módulo de Foro

Espacio donde los estudiantes pueden crear publicaciones para interactuar con la comunidad. Ejemplos de uso:

- "Busco roommate"
- "Recomiendo esta residencia"
- "¿Alguien estudia Ingeniería?"
- "¿Qué barrio recomiendan?"

**Cada publicación incluye:**

| Campo | Detalle |
|---|---|
| Título | Título de la publicación |
| Contenido | Cuerpo del mensaje |
| Categoría | Opcional |
| Autor | Usuario que publica |
| Fecha | Fecha de creación |
| Comentarios | Respuestas de otros usuarios |

## 5. Tipos de Usuario

El sistema contempla inicialmente tres roles:

### 5.1 Estudiante
- Crear publicaciones en el foro
- Guardar favoritos
- Comentar
- Editar su perfil

### 5.2 Propietario
- Publicar inmuebles
- Editar publicaciones
- Eliminar publicaciones
- Editar su perfil

### 5.3 Proveedor de Servicios
- Publicar servicios
- Editar publicaciones
- Eliminar publicaciones
- Editar su perfil

## 6. Resumen para Referencia Rápida

- **Producto:** Plataforma web para estudiantes universitarios (alojamiento + comunidad)
- **Problema central del MVP:** Ayudar a un estudiante a encontrar dónde vivir cerca de su universidad
- **Módulos del MVP:** Arriendos, Servicios, Foro
- **Roles de usuario:** Estudiante, Propietario, Proveedor de Servicios
- **Visión a futuro:** Evolucionar hacia una comunidad estudiantil completa (roommates, recomendaciones, interacción social)
