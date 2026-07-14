/**
 * Servicio de autenticación.
 * Gestiona el estado de sesión del usuario y actualiza la UI del navbar.
 */

import * as api from './api.js';
import { navigate } from '../router.js';

// Estado de autenticación global
let currentUser = null;

/**
 * Obtiene el usuario actual (desde memoria).
 */
export function getUser() {
    return currentUser;
}

/**
 * Verifica si hay un usuario autenticado.
 */
export function isAuthenticated() {
    return currentUser !== null;
}

/**
 * Verifica si el usuario tiene un rol específico.
 */
export function hasRole(role) {
    return currentUser && currentUser.role === role;
}

/**
 * Intenta restaurar la sesión desde el token almacenado.
 * Se llama al inicializar la app.
 */
export async function restoreSession() {
    if (!api.hasToken()) {
        currentUser = null;
        updateNavbar();
        return;
    }

    try {
        currentUser = await api.getMe();
        updateNavbar();
    } catch (error) {
        // Token inválido o expirado
        console.warn('Sesión expirada, limpiando token.');
        api.removeToken();
        currentUser = null;
        updateNavbar();
    }
}

/**
 * Inicia sesión con email y contraseña.
 */
export async function login(email, password) {
    const response = await api.login({ email, password });
    api.setToken(response.access_token);
    currentUser = response.user;
    updateNavbar();
    return currentUser;
}

/**
 * Registra un nuevo usuario.
 */
export async function register(userData) {
    const response = await api.register(userData);
    api.setToken(response.access_token);
    currentUser = response.user;
    updateNavbar();
    return currentUser;
}

/**
 * Cierra la sesión del usuario.
 */
export function logout() {
    api.removeToken();
    currentUser = null;
    updateNavbar();
    navigate('/');
}

/**
 * Actualiza el perfil del usuario actual.
 */
export async function updateProfile(data) {
    currentUser = await api.updateProfile(data);
    updateNavbar();
    return currentUser;
}

/**
 * Actualiza la UI del navbar según el estado de autenticación.
 */
function updateNavbar() {
    const authSection = document.getElementById('nav-auth');
    const userSection = document.getElementById('nav-user');
    const usernameSpan = document.getElementById('nav-username');
    const publicarWrapper = document.getElementById('dropdown-publicar-wrapper');
    const publicarLink = document.getElementById('dropdown-publicar');

    if (!authSection || !userSection) return;

    if (currentUser) {
        // Mostrar menú de usuario
        authSection.classList.add('d-none');
        userSection.classList.remove('d-none');
        usernameSpan.textContent = currentUser.full_name.split(' ')[0];

        // Mostrar "Publicar" según el rol
        if (currentUser.role === 'propietario') {
            publicarWrapper.classList.remove('d-none');
            publicarLink.href = '#/publicar-arriendo';
            publicarLink.innerHTML = '<i class="bi bi-plus-circle"></i> Publicar Arriendo';
        } else if (currentUser.role === 'proveedor') {
            publicarWrapper.classList.remove('d-none');
            publicarLink.href = '#/publicar-servicio';
            publicarLink.innerHTML = '<i class="bi bi-plus-circle"></i> Publicar Servicio';
        } else {
            publicarWrapper.classList.add('d-none');
        }
    } else {
        // Mostrar botones de login/registro
        authSection.classList.remove('d-none');
        userSection.classList.add('d-none');
    }
}

/**
 * Inicializa los event listeners del navbar para auth.
 */
export function initAuthListeners() {
    const logoutBtn = document.getElementById('btn-nav-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }
}
