/**
 * Router SPA basado en hash (#/).
 * Maneja navegación sin recarga de página, con soporte para rutas parametrizadas.
 *
 * Ejemplo de uso:
 *   import { registerRoute, navigate, init } from './router.js';
 *   registerRoute('/', homeView);
 *   registerRoute('/arriendos/:id', detalleView);
 *   init('app');
 */

const routes = [];
let appContainer = null;
let currentCleanup = null;

/**
 * Registra una ruta con su módulo de vista.
 * El módulo debe exportar: render(params) -> string HTML
 * Opcionalmente: afterRender(params) y cleanup()
 */
export function registerRoute(pattern, viewModule) {
    routes.push({ pattern, viewModule });
}

/**
 * Navega a una ruta programáticamente.
 */
export function navigate(path) {
    window.location.hash = '#' + path;
}

/**
 * Obtiene la ruta actual sin el #.
 */
export function getCurrentPath() {
    return window.location.hash.slice(1) || '/';
}

/**
 * Inicializa el router y renderiza la ruta actual.
 */
export function init(containerId) {
    appContainer = document.getElementById(containerId);
    window.addEventListener('hashchange', handleRoute);
    handleRoute();
}

/**
 * Maneja el cambio de ruta: busca match, renderiza la vista correspondiente.
 */
async function handleRoute() {
    const hash = getCurrentPath();

    // Cleanup de la vista anterior si existe
    if (currentCleanup) {
        currentCleanup();
        currentCleanup = null;
    }

    for (const { pattern, viewModule } of routes) {
        const params = matchRoute(pattern, hash);
        if (params !== null) {
            try {
                // Renderizar vista
                const html = await viewModule.render(params);
                appContainer.innerHTML = html;

                // Ejecutar lógica post-render (event listeners, etc.)
                if (viewModule.afterRender) {
                    await viewModule.afterRender(params);
                }

                // Guardar función de cleanup si existe
                if (viewModule.cleanup) {
                    currentCleanup = viewModule.cleanup;
                }

                // Actualizar enlaces activos en la navbar
                updateNavLinks(hash);

                // Scroll al inicio
                window.scrollTo({ top: 0, behavior: 'smooth' });

            } catch (error) {
                console.error('Error renderizando vista:', error);
                appContainer.innerHTML = `
                    <div class="empty-state">
                        <i class="bi bi-exclamation-triangle"></i>
                        <h4>Error al cargar la página</h4>
                        <p>${error.message}</p>
                        <a href="#/" class="btn btn-primary mt-3">Volver al inicio</a>
                    </div>
                `;
            }
            return;
        }
    }

    // 404 — Ninguna ruta coincide
    appContainer.innerHTML = `
        <div class="empty-state" style="margin-top: 5rem;">
            <i class="bi bi-question-circle"></i>
            <h4>Página no encontrada</h4>
            <p>La página que buscas no existe.</p>
            <a href="#/" class="btn btn-primary mt-3">
                <i class="bi bi-house-door"></i> Ir al Inicio
            </a>
        </div>
    `;
}

/**
 * Intenta hacer match de un patrón de ruta con el hash actual.
 * Soporta parámetros con :nombre.
 * Retorna objeto de params si hay match, o null si no.
 */
function matchRoute(pattern, hash) {
    const paramNames = [];
    const regexStr = '^' + pattern.replace(/:[^/]+/g, (match) => {
        paramNames.push(match.slice(1));
        return '([^/]+)';
    }) + '$';

    const regex = new RegExp(regexStr);
    const result = hash.match(regex);

    if (!result) return null;

    const params = {};
    paramNames.forEach((name, index) => {
        params[name] = decodeURIComponent(result[index + 1]);
    });
    return params;
}

/**
 * Actualiza la clase .active en los nav-links según la ruta actual.
 */
function updateNavLinks(currentHash) {
    const navLinks = document.querySelectorAll('#nav-links .nav-link');
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (!href) return;
        const linkPath = href.replace('#', '');
        if (currentHash === linkPath || (linkPath !== '/' && currentHash.startsWith(linkPath))) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}
