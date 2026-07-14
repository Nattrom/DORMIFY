/**
 * Punto de entrada de la SPA de Dormify.
 * Registra todas las rutas, restaura la sesión y lanza el router.
 */

import { registerRoute, init as initRouter } from './router.js';
import { restoreSession, initAuthListeners } from './services/auth.js';

// Importar vistas
import * as homeView from './views/home.js';
import { loginView, registerView } from './views/auth.js';
import * as arriendosView from './views/arriendos.js';
import * as arriendoDetalleView from './views/arriendo-detalle.js';
import * as serviciosView from './views/servicios.js';
import * as servicioDetalleView from './views/servicio-detalle.js';
import * as foroView from './views/foro.js';
import * as postDetalleView from './views/post-detalle.js';
import * as perfilView from './views/perfil.js';
import * as publicarArriendoView from './views/publicar-arriendo.js';
import * as publicarServicioView from './views/publicar-servicio.js';

/**
 * Inicializa la aplicación:
 * 1. Restaura sesión (JWT)
 * 2. Registra rutas
 * 3. Inicializa el router
 * 4. Configura el navbar interactivo
 */
async function initApp() {
    // 1. Restaurar sesión del usuario (si hay token guardado)
    await restoreSession();

    // 2. Registrar rutas del SPA
    registerRoute('/', homeView);
    registerRoute('/login', loginView);
    registerRoute('/registro', registerView);
    registerRoute('/arriendos', arriendosView);
    registerRoute('/arriendos/:id', arriendoDetalleView);
    registerRoute('/servicios', serviciosView);
    registerRoute('/servicios/:id', servicioDetalleView);
    registerRoute('/foro', foroView);
    registerRoute('/foro/:id', postDetalleView);
    registerRoute('/perfil', perfilView);
    registerRoute('/mis-favoritos', {
        render: async () => {
            const { isAuthenticated } = await import('./services/auth.js');
            if (!isAuthenticated()) {
                const { navigate } = await import('./router.js');
                navigate('/login');
                return '<div></div>';
            }
            // Reusar la vista de perfil con tab de favoritos activo
            const html = await perfilView.render();
            return html;
        },
        afterRender: async () => {
            await perfilView.afterRender();
            // Activar tab de favoritos automáticamente
            setTimeout(() => {
                const favTab = document.querySelector('[data-tab="favoritos"]');
                if (favTab) favTab.click();
            }, 100);
        }
    });
    registerRoute('/publicar-arriendo', publicarArriendoView);
    registerRoute('/publicar-servicio', publicarServicioView);

    // 3. Inicializar event listeners de auth en el navbar
    initAuthListeners();

    // 4. Inicializar el router (renderiza la ruta actual)
    initRouter('app');

    // 5. Navbar scroll effect
    setupNavbarScroll();
}

/**
 * Efecto de scroll en el navbar: agrega clase .scrolled al hacer scroll.
 */
function setupNavbarScroll() {
    const navbar = document.getElementById('main-navbar');
    if (!navbar) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

// ========== Lanzar la app cuando el DOM esté listo ==========
document.addEventListener('DOMContentLoaded', initApp);
