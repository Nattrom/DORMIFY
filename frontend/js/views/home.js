/**
 * Vista Home — Landing page de Dormify.
 * Hero section con búsqueda, features, y propiedades destacadas.
 */

import * as api from '../services/api.js';
import { navigate } from '../router.js';
import { formatPrice, getPropertyTypeLabel, getImageUrl, truncate } from '../utils/helpers.js';

export async function render() {
    // Intentar cargar propiedades destacadas
    let featuredProperties = [];
    try {
        const result = await api.getProperties({ per_page: 6, sort_by: 'recent' });
        featuredProperties = result.items || [];
    } catch (e) {
        // Si el backend no está disponible, mostrar sin propiedades
    }

    return `
        <!-- HERO -->
        <section class="hero-section">
            <div class="container">
                <div class="row align-items-center">
                    <div class="col-lg-7">
                        <div class="hero-content animate-slide-up">
                            <h1 class="hero-title">
                                Encuentra tu <span class="highlight">hogar ideal</span> cerca de tu universidad
                            </h1>
                            <p class="hero-subtitle">
                                Dormify conecta estudiantes con alojamientos, servicios y una comunidad estudiantil activa. Tu nueva vida universitaria empieza aquí.
                            </p>
                            <div class="hero-search">
                                <input type="text" id="hero-search-input" 
                                       placeholder="Buscar por universidad, zona o tipo de inmueble...">
                                <button class="btn btn-primary" id="hero-search-btn">
                                    <i class="bi bi-search"></i> Buscar
                                </button>
                            </div>
                            <div class="hero-stats">
                                <div class="hero-stat">
                                    <div class="hero-stat-number">${featuredProperties.length > 0 ? '50+' : '—'}</div>
                                    <div class="hero-stat-label">Inmuebles</div>
                                </div>
                                <div class="hero-stat">
                                    <div class="hero-stat-number">${featuredProperties.length > 0 ? '10+' : '—'}</div>
                                    <div class="hero-stat-label">Universidades</div>
                                </div>
                                <div class="hero-stat">
                                    <div class="hero-stat-number">${featuredProperties.length > 0 ? '100+' : '—'}</div>
                                    <div class="hero-stat-label">Estudiantes</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-5 d-none d-lg-block">
                        <div class="col-lg-5 d-none d-lg-block text-center">
                            <img src="assets/logoDormify.svg" alt="Dormify Logo" 
                            style="height: 480px; width: 500px; opacity: 0.5; filter: drop-shadow(0 30px 60px rgba(0,0,0,0.4));">
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- FEATURES -->
        <section class="page-section">
            <div class="container">
                <div class="section-header">
                    <h2 class="section-title">Todo lo que necesitas en un solo lugar</h2>
                    <p class="section-subtitle">Descubre los módulos de Dormify</p>
                </div>
                <div class="row g-4">
                    <div class="col-md-4">
                        <div class="feature-card" onclick="location.hash='#/arriendos'" style="cursor:pointer">
                            <div class="feature-card-icon">
                                <i class="bi bi-building"></i>
                            </div>
                            <h5>Arriendos</h5>
                            <p>Encuentra habitaciones, apartaestudios, apartamentos y residencias cerca de tu universidad.</p>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="feature-card" onclick="location.hash='#/servicios'" style="cursor:pointer">
                            <div class="feature-card-icon" style="background: linear-gradient(135deg, #BFB077, #d4c99a);">
                                <i class="bi bi-tools"></i>
                            </div>
                            <h5>Servicios</h5>
                            <p>Lavanderías, plomería, electricistas, mudanzas y más servicios útiles para tu vida estudiantil.</p>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="feature-card" onclick="location.hash='#/foro'" style="cursor:pointer">
                            <div class="feature-card-icon" style="background: linear-gradient(135deg, #245e45, #2d7a56);">
                                <i class="bi bi-chat-square-text"></i>
                            </div>
                            <h5>Foro</h5>
                            <p>Conecta con otros estudiantes, comparte experiencias, busca roommates y pide recomendaciones.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- PROPIEDADES DESTACADAS -->
        ${featuredProperties.length > 0 ? `
        <section class="page-section" style="background: var(--color-bg-alt);">
            <div class="container">
                <div class="section-header">
                    <h2 class="section-title">Arriendos destacados</h2>
                    <p class="section-subtitle">Los más recientes cerca de tu universidad</p>
                </div>
                <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                    ${featuredProperties.map(prop => `
                        <div class="col">
                            <div class="card-glass animate-fade-in" onclick="location.hash='#/arriendos/${prop.id}'">
                                <div class="card-img-wrapper">
                                    <img src="${getImageUrl(prop.images)}" class="card-img-top" 
                                         alt="${prop.title}"
                                         onerror="this.src='https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'">
                                    <div class="card-price">${formatPrice(prop.price)}/mes</div>
                                </div>
                                <div class="card-body">
                                    <span class="badge-category badge-${prop.property_type}">${getPropertyTypeLabel(prop.property_type)}</span>
                                    <h5 class="card-title mt-2">${truncate(prop.title, 50)}</h5>
                                    <div class="card-meta">
                                        <span class="card-meta-item">
                                            <i class="bi bi-geo-alt"></i> ${truncate(prop.address, 30)}
                                        </span>
                                        <span class="card-meta-item">
                                            <i class="bi bi-mortarboard"></i> ${truncate(prop.university, 25)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="text-center mt-4">
                    <a href="#/arriendos" class="btn btn-outline-primary btn-lg">
                        Ver todos los arriendos <i class="bi bi-arrow-right"></i>
                    </a>
                </div>
            </div>
        </section>
        ` : `
        <section class="page-section" style="background: var(--color-bg-alt);">
            <div class="container">
                <div class="empty-state">
                    <i class="bi bi-cloud-slash"></i>
                    <h4>Backend no disponible</h4>
                    <p>Asegúrate de que el servidor FastAPI esté corriendo en http://localhost:8000</p>
                    <code style="color: var(--color-primary-light);">cd backend && uvicorn app.main:app --reload</code>
                </div>
            </div>
        </section>
        `}

        <!-- CTA -->
        <section class="page-section">
            <div class="container">
                <div class="text-center" style="max-width: 600px; margin: 0 auto;">
                    <h2 class="section-title">¿Tienes un inmueble o servicio?</h2>
                    <p class="section-subtitle mb-4">Regístrate como propietario o proveedor y publica gratis en Dormify.</p>
                    <a href="#/registro" class="btn btn-primary btn-lg px-5">
                        <i class="bi bi-person-plus"></i> Crear cuenta gratis
                    </a>
                </div>
            </div>
        </section>
    `;
}

export function afterRender() {
    // Búsqueda desde el hero
    const searchInput = document.getElementById('hero-search-input');
    const searchBtn = document.getElementById('hero-search-btn');

    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            const query = searchInput.value.trim();
            if (query) {
                navigate(`/arriendos?search=${encodeURIComponent(query)}`);
            } else {
                navigate('/arriendos');
            }
        });
    }
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                searchBtn.click();
            }
        });
    }
}
