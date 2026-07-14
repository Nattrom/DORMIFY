/**
 * Vista Servicios — Listado de servicios con filtros por categoría.
 */

import * as api from '../services/api.js';
import { getServiceCategoryLabel, getImageUrl, truncate, cardSkeleton } from '../utils/helpers.js';

let currentFilters = {};

export async function render() {
    return `
        <section class="page-section">
            <div class="container">
                <div class="page-header animate-fade-in">
                    <h1 class="page-title"><i class="bi bi-tools" style="color: var(--color-secondary);"></i> Servicios</h1>
                    <p class="page-subtitle">Servicios útiles para tu vida estudiantil</p>
                </div>

                <!-- Filtros -->
                <div class="filter-bar animate-fade-in">
                    <div class="filter-group">
                        <div class="form-group" style="flex: 2;">
                            <label>Buscar</label>
                            <input type="text" class="form-control form-control-sm" id="filter-search" 
                                   placeholder="Nombre o descripción del servicio...">
                        </div>
                        <div class="form-group">
                            <label>Categoría</label>
                            <select class="form-select form-select-sm" id="filter-category">
                                <option value="">Todas</option>
                                <option value="lavanderia">Lavandería</option>
                                <option value="plomeria">Plomería</option>
                                <option value="electricista">Electricista</option>
                                <option value="carpinteria">Carpintería</option>
                                <option value="papeleria">Papelería</option>
                                <option value="mudanzas">Mudanzas</option>
                                <option value="varios">Varios</option>
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

                <!-- Grid -->
                <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4" id="services-grid">
                    ${cardSkeleton(6)}
                </div>

                <div class="pagination-wrapper" id="pagination"></div>
            </div>
        </section>
    `;
}

export async function afterRender() {
    await loadServices(1);

    document.getElementById('btn-filter').addEventListener('click', () => {
        currentFilters = {
            search: document.getElementById('filter-search').value,
            category: document.getElementById('filter-category').value
        };
        loadServices(1);
    });

    document.getElementById('filter-search')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            currentFilters.search = e.target.value;
            loadServices(1);
        }
    });
}

async function loadServices(page) {
    const grid = document.getElementById('services-grid');
    const pagination = document.getElementById('pagination');

    try {
        const result = await api.getServices({ ...currentFilters, page, per_page: 12 });
        const services = result.items;

        if (services.length === 0) {
            grid.innerHTML = `
                <div class="col-12">
                    <div class="empty-state">
                        <i class="bi bi-search"></i>
                        <h4>No se encontraron servicios</h4>
                        <p>Intenta con otros filtros</p>
                    </div>
                </div>
            `;
            pagination.innerHTML = '';
            return;
        }

        grid.innerHTML = services.map(svc => `
            <div class="col">
                <div class="card-glass animate-fade-in" onclick="location.hash='#/servicios/${svc.id}'">
                    <div class="card-img-wrapper">
                        <img src="${getImageUrl(svc.images)}" class="card-img-top" 
                             alt="${svc.name}" loading="lazy"
                             onerror="this.src='https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800'">
                    </div>
                    <div class="card-body">
                        <span class="badge-category badge-${svc.category}">${getServiceCategoryLabel(svc.category)}</span>
                        <h5 class="card-title mt-2">${truncate(svc.name, 50)}</h5>
                        <p class="card-text">${truncate(svc.description, 100)}</p>
                        <div class="card-meta">
                            ${svc.location ? `
                                <span class="card-meta-item">
                                    <i class="bi bi-geo-alt"></i> ${truncate(svc.location, 30)}
                                </span>
                            ` : ''}
                            ${svc.schedule ? `
                                <span class="card-meta-item">
                                    <i class="bi bi-clock"></i> ${truncate(svc.schedule, 25)}
                                </span>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        // Paginación
        const totalPages = Math.ceil(result.total / result.per_page);
        if (totalPages > 1) {
            let html = '';
            for (let i = 1; i <= totalPages; i++) {
                html += `<button class="page-btn ${i === page ? 'active' : ''}" data-page="${i}">${i}</button>`;
            }
            pagination.innerHTML = html;
            pagination.querySelectorAll('.page-btn').forEach(btn => {
                btn.addEventListener('click', () => loadServices(parseInt(btn.dataset.page)));
            });
        } else {
            pagination.innerHTML = '';
        }

    } catch (error) {
        grid.innerHTML = `
            <div class="col-12">
                <div class="empty-state">
                    <i class="bi bi-exclamation-triangle"></i>
                    <h4>Error al cargar servicios</h4>
                    <p>${error.message}</p>
                </div>
            </div>
        `;
    }
}

export function cleanup() {
    currentFilters = {};
}
