/**
 * Cliente API centralizado para comunicación con el backend de Dormify.
 * Wrapper sobre fetch con manejo de JWT, errores y respuestas JSON.
 */

const API_BASE_URL = 'http://localhost:8000/api';

/**
 * Obtiene el token JWT almacenado.
 */
function getToken() {
    return localStorage.getItem('dormify_token');
}

/**
 * Almacena el token JWT.
 */
export function setToken(token) {
    localStorage.setItem('dormify_token', token);
}

/**
 * Elimina el token JWT.
 */
export function removeToken() {
    localStorage.removeItem('dormify_token');
}

/**
 * Verifica si hay un token almacenado.
 */
export function hasToken() {
    return !!getToken();
}

/**
 * Realiza una petición HTTP al backend.
 * Maneja automáticamente: headers, token JWT, parsing JSON, errores HTTP.
 *
 * @param {string} endpoint - Ruta relativa al API (ej: '/properties')
 * @param {object} options - { method, body, params }
 * @returns {Promise<object>} - Respuesta parseada como JSON
 */
async function request(endpoint, options = {}) {
    const { method = 'GET', body = null, params = null } = options;

    // Construir URL con query params
    let url = `${API_BASE_URL}${endpoint}`;
    if (params) {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                searchParams.append(key, value);
            }
        });
        const queryString = searchParams.toString();
        if (queryString) url += `?${queryString}`;
    }

    // Configurar headers
    const headers = {};
    const token = getToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // Configurar body
    let fetchBody = null;
    if (body) {
        headers['Content-Type'] = 'application/json';
        fetchBody = JSON.stringify(body);
    }

    try {
        const response = await fetch(url, {
            method,
            headers,
            body: fetchBody
        });

        // Manejar 204 No Content
        if (response.status === 204) {
            return null;
        }

        const data = await response.json();

        if (!response.ok) {
            // Error HTTP del servidor
            const errorMessage = data.detail || `Error ${response.status}`;
            const error = new Error(errorMessage);
            error.status = response.status;
            error.data = data;
            throw error;
        }

        return data;

    } catch (error) {
        // Si ya es un error HTTP procesado, re-lanzar
        if (error.status) throw error;

        // Error de red/conexión
        const networkError = new Error('Error de conexión. Verifica que el servidor esté activo.');
        networkError.status = 0;
        throw networkError;
    }
}


// ==========================================
//  ENDPOINTS DE AUTENTICACIÓN
// ==========================================

export async function register(userData) {
    return request('/auth/register', { method: 'POST', body: userData });
}

export async function login(credentials) {
    return request('/auth/login', { method: 'POST', body: credentials });
}

export async function getMe() {
    return request('/auth/me');
}

export async function updateProfile(data) {
    return request('/auth/me', { method: 'PUT', body: data });
}


// ==========================================
//  ENDPOINTS DE PROPIEDADES (ARRIENDOS)
// ==========================================

export async function getProperties(filters = {}) {
    return request('/properties/', { params: filters });
}

export async function getProperty(id) {
    return request(`/properties/${id}`);
}

export async function createProperty(data) {
    return request('/properties/', { method: 'POST', body: data });
}

export async function updateProperty(id, data) {
    return request(`/properties/${id}`, { method: 'PUT', body: data });
}

export async function deleteProperty(id) {
    return request(`/properties/${id}`, { method: 'DELETE' });
}


// ==========================================
//  ENDPOINTS DE SERVICIOS
// ==========================================

export async function getServices(filters = {}) {
    return request('/services/', { params: filters });
}

export async function getService(id) {
    return request(`/services/${id}`);
}

export async function createService(data) {
    return request('/services/', { method: 'POST', body: data });
}

export async function updateService(id, data) {
    return request(`/services/${id}`, { method: 'PUT', body: data });
}

export async function deleteService(id) {
    return request(`/services/${id}`, { method: 'DELETE' });
}


// ==========================================
//  ENDPOINTS DEL FORO
// ==========================================

export async function getPosts(filters = {}) {
    return request('/posts/', { params: filters });
}

export async function getPost(id) {
    return request(`/posts/${id}`);
}

export async function createPost(data) {
    return request('/posts/', { method: 'POST', body: data });
}

export async function updatePost(id, data) {
    return request(`/posts/${id}`, { method: 'PUT', body: data });
}

export async function deletePost(id) {
    return request(`/posts/${id}`, { method: 'DELETE' });
}

export async function getComments(postId) {
    return request(`/posts/${postId}/comments`);
}

export async function createComment(postId, data) {
    return request(`/posts/${postId}/comments`, { method: 'POST', body: data });
}

export async function deleteComment(postId, commentId) {
    return request(`/posts/${postId}/comments/${commentId}`, { method: 'DELETE' });
}


// ==========================================
//  ENDPOINTS DE FAVORITOS
// ==========================================

export async function getFavorites(type = null) {
    const params = type ? { type } : {};
    return request('/favorites/', { params });
}

export async function addFavorite(data) {
    return request('/favorites/', { method: 'POST', body: data });
}

export async function removeFavorite(id) {
    return request(`/favorites/${id}`, { method: 'DELETE' });
}

export async function removePropertyFavorite(propertyId) {
    return request(`/favorites/property/${propertyId}`, { method: 'DELETE' });
}

export async function removeServiceFavorite(serviceId) {
    return request(`/favorites/service/${serviceId}`, { method: 'DELETE' });
}


// ==========================================
//  ENDPOINTS DE USUARIOS
// ==========================================

export async function getUserProfile(userId) {
    return request(`/users/${userId}`);
}
