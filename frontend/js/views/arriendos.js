/**
 * Vista Arriendos — Listado de propiedades con filtros, búsqueda y paginación.
 */

import * as api from '../services/api.js';
import { formatPrice, getPropertyTypeLabel, getImageUrl, truncate, cardSkeleton } from '../utils/helpers.js';

let currentFilters = {};

export async function render(params) {
    // Leer filtros desde URL si vienen como query params
    const hashParts = window.location.hash.split('?');
    if (hashParts[1]) {
        const urlParams = new URLSearchParams(hashParts[1]);
        if (urlParams.get('search')) currentFilters.search = urlParams.get('search');
        if (urlParams.get('type')) currentFilters.property_type = urlParams.get('type');
    }

    return `
        <section class="page-section">
            <div class="container">
                <!-- Header -->
                <div class="page-header animate-fade-in">
                    <h1 class="page-title"><i class="bi bi-building" style="color: var(--color-primary-light);"></i> Arriendos</h1>
                    <p class="page-subtitle">Encuentra el alojamiento ideal cerca de tu universidad</p>
                </div>

                <!-- Filtros -->
                <div class="filter-bar animate-fade-in">
                    <div class="filter-group">
                        <div class="form-group" style="flex: 2;">
                            <label>Buscar</label>
                            <input type="text" class="form-control form-control-sm" id="filter-search" 
                                   placeholder="Título, dirección, descripción..." 
                                   value="${currentFilters.search || ''}">
                        </div>
                        <div class="form-group">
                            <label>Universidad</label>
                            <input type="text" class="form-control form-control-sm" id="filter-university" 
                                   placeholder="Nombre de universidad..."
                                   value="${currentFilters.university || ''}">
                        </div>
                        <div class="form-group">
                            <label>Tipo</label>
                            <select class="form-select form-select-sm" id="filter-type">
                                <option value="">Todos</option>
                                <option value="habitacion" ${currentFilters.property_type === 'habitacion' ? 'selected' : ''}>Habitación</option>
                                <option value="apartaestudio" ${currentFilters.property_type === 'apartaestudio' ? 'selected' : ''}>Apartaestudio</option>
                                <option value="apartamento" ${currentFilters.property_type === 'apartamento' ? 'selected' : ''}>Apartamento</option>
                                <option value="residencia" ${currentFilters.property_type === 'residencia' ? 'selected' : ''}>Residencia</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Precio mín.</label>
                            <input type="number" class="form-control form-control-sm" id="filter-min-price" 
                                   placeholder="0" min="0" value="${currentFilters.min_price || ''}">
                        </div>
                        <div class="form-group">
                            <label>Precio máx.</label>
                            <input type="number" class="form-control form-control-sm" id="filter-max-price" 
                                   placeholder="Sin límite" min="0" value="${currentFilters.max_price || ''}">
                        </div>
                        <div class="form-group">
                            <label>Ordenar</label>
                            <select class="form-select form-select-sm" id="filter-sort">
                                <option value="recent">Más recientes</option>
                                <option value="price_asc">Menor precio</option>
                                <option value="price_desc">Mayor precio</option>
                            </select>
                        </div>
                        <div class="form-group" style="flex: 0;">
                            <label>&nbsp;</label>
                            <button class="btn btn-primary btn-sm" id="btn-filter">
                                <i class="bi bi-search"></i> Filtrar
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Grid de propiedades -->
                <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4" id="properties-grid">
                    ${cardSkeleton(6)}
                </div>

                <!-- Paginación -->
                <div class="pagination-wrapper" id="pagination"></div>
            </div>
        </section>
    `;
}

export async function afterRender() {
    // Cargar propiedades iniciales
    await loadProperties(1);

    // Botón filtrar
    document.getElementById('btn-filter').addEventListener('click', () => {
        updateFilters();
        loadProperties(1);
    });

    // Enter en campos de búsqueda
    ['filter-search', 'filter-university'].forEach(id => {
        document.getElementById(id)?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                updateFilters();
                loadProperties(1);
            }
        });
    });
}

function updateFilters() {
    currentFilters = {
        search: document.getElementById('filter-search').value,
        university: document.getElementById('filter-university').value,
        property_type: document.getElementById('filter-type').value,
        min_price: document.getElementById('filter-min-price').value,
        max_price: document.getElementById('filter-max-price').value,
        sort_by: document.getElementById('filter-sort').value
    };
}

async function loadProperties(page) {
    const grid = document.getElementById('properties-grid');
    const pagination = document.getElementById('pagination');

    try {
        const result = await api.getProperties({ ...currentFilters, page, per_page: 12 });
        const properties = result.items;

        if (properties.length === 0) {
            grid.innerHTML = `
                <div class="col-12">
                    <div class="empty-state">
                        <i class="bi bi-search"></i>
                        <h4>No se encontraron arriendos</h4>
                        <p>Intenta con otros filtros de búsqueda</p>
                    </div>
                </div>
            `;
            pagination.innerHTML = '';
            return;
        }

        grid.innerHTML = properties.map(prop => `
            <div class="col">
                <div class="card-glass animate-fade-in" onclick="location.hash='#/arriendos/${prop.id}'">
                    <div class="card-img-wrapper">
                        <img src="${getImageUrl(prop.images)}" class="card-img-top" 
                             alt="${prop.title}"
                             loading="lazy"
                             onerror="this.src='https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'">
                        <div class="card-price">${formatPrice(prop.price)}/mes</div>
                    </div>
                    <div class="card-body">
                        <span class="badge-category badge-${prop.property_type}">${getPropertyTypeLabel(prop.property_type)}</span>
                        <h5 class="card-title mt-2">${truncate(prop.title, 55)}</h5>
                        <p class="card-text">${truncate(prop.description, 80)}</p>
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
        `).join('');

        // Paginación
        const totalPages = Math.ceil(result.total / result.per_page);
        if (totalPages > 1) {
            let paginationHTML = '';
            if (page > 1) {
                paginationHTML += `<button class="page-btn" data-page="${page - 1}"><i class="bi bi-chevron-left"></i></button>`;
            }
            for (let i = 1; i <= totalPages; i++) {
                if (i === 1 || i === totalPages || (i >= page - 2 && i <= page + 2)) {
                    paginationHTML += `<button class="page-btn ${i === page ? 'active' : ''}" data-page="${i}">${i}</button>`;
                } else if (i === page - 3 || i === page + 3) {
                    paginationHTML += `<span style="color: var(--color-text-muted); padding: 0 0.5rem;">...</span>`;
                }
            }
            if (page < totalPages) {
                paginationHTML += `<button class="page-btn" data-page="${page + 1}"><i class="bi bi-chevron-right"></i></button>`;
            }
            pagination.innerHTML = paginationHTML;
            pagination.querySelectorAll('.page-btn').forEach(btn => {
                btn.addEventListener('click', () => loadProperties(parseInt(btn.dataset.page)));
            });
        } else {
            pagination.innerHTML = '';
        }

    } catch (error) {
        grid.innerHTML = `
            <div class="col-12">
                <div class="empty-state">
                    <i class="bi bi-exclamation-triangle"></i>
                    <h4>Error al cargar arriendos</h4>
                    <p>${error.message}</p>
                </div>
            </div>
        `;
    }
}

export function cleanup() {
    currentFilters = {};
}
