/**
 * Vista Detalle de Servicio.
 */

import * as api from '../services/api.js';
import { isAuthenticated, getUser } from '../services/auth.js';
import { navigate } from '../router.js';
import { getServiceCategoryLabel, getImageUrl, getInitials, formatDate, showToast } from '../utils/helpers.js';

export async function render(params) {
    try {
        const svc = await api.getService(params.id);
        const user = getUser();
        const isOwner = user && user.id === svc.provider_id;

        return `
            <section class="page-section">
                <div class="container">
                    <nav class="mb-3 animate-fade-in">
                        <a href="#/servicios" style="color: var(--color-text-muted);">
                            <i class="bi bi-arrow-left"></i> Volver a servicios
                        </a>
                    </nav>

                    <div class="row g-4">
                        <div class="col-lg-8 animate-fade-in">
                            <!-- Imagen -->
                            <div style="border-radius: var(--radius-xl); overflow: hidden; margin-bottom: 2rem;">
                                <img src="${getImageUrl(svc.images)}" alt="${svc.name}" 
                                     style="width: 100%; max-height: 400px; object-fit: cover;"
                                     onerror="this.src='https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800'">
                            </div>

                            <span class="badge-category badge-${svc.category} mb-2">${getServiceCategoryLabel(svc.category)}</span>
                            <h1 class="detail-title">${svc.name}</h1>

                            ${isOwner ? `
                                <div class="mb-3">
                                    <a href="#/editar-servicio/${svc.id}" class="btn btn-outline-primary btn-sm me-2">
                                        <i class="bi bi-pencil"></i> Editar
                                    </a>
                                    <button class="btn btn-danger btn-sm" id="btn-delete-service">
                                        <i class="bi bi-trash"></i> Eliminar
                                    </button>
                                </div>
                            ` : ''}

                            <div class="detail-section">
                                <h4><i class="bi bi-text-paragraph"></i> Descripción</h4>
                                <p style="color: var(--color-text-secondary); line-height: 1.8;">${svc.description}</p>
                            </div>

                            ${svc.schedule ? `
                            <div class="detail-section">
                                <h4><i class="bi bi-clock"></i> Horarios</h4>
                                <p style="color: var(--color-text-secondary);">${svc.schedule}</p>
                            </div>
                            ` : ''}

                            ${svc.location ? `
                            <div class="detail-section">
                                <h4><i class="bi bi-geo-alt"></i> Ubicación</h4>
                                <p style="color: var(--color-text-secondary);">${svc.location}</p>
                            </div>
                            ` : ''}

                            <div class="detail-section">
                                <h4><i class="bi bi-calendar-event"></i> Publicado</h4>
                                <p style="color: var(--color-text-secondary);">${formatDate(svc.created_at)}</p>
                            </div>
                        </div>

                        <div class="col-lg-4 animate-fade-in">
                            <div class="detail-sidebar">
                                <h5 style="font-weight: 700; margin-bottom: 1rem;">Información de contacto</h5>
                                <div class="owner-info">
                                    <div class="owner-avatar">${getInitials(svc.provider.full_name)}</div>
                                    <div>
                                        <div style="font-weight: 600;">${svc.provider.full_name}</div>
                                        <div style="font-size: var(--font-size-xs); color: var(--color-text-muted);">Proveedor de servicios</div>
                                    </div>
                                </div>
                                <div style="margin-bottom: 0.75rem; font-size: var(--font-size-sm); color: var(--color-text-secondary);">
                                    <i class="bi bi-telephone" style="color: var(--color-primary-light);"></i> ${svc.contact_info}
                                </div>
                                <div style="margin-bottom: 1.5rem; font-size: var(--font-size-sm); color: var(--color-text-secondary);">
                                    <i class="bi bi-envelope" style="color: var(--color-primary-light);"></i> ${svc.provider.email}
                                </div>

                                ${isAuthenticated() && !isOwner ? `
                                    <button class="btn-favorite w-100" id="btn-toggle-fav" data-service-id="${svc.id}">
                                        <i class="bi bi-heart"></i> Agregar a favoritos
                                    </button>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        `;
    } catch (error) {
        return `
            <div class="empty-state" style="margin-top: 5rem;">
                <i class="bi bi-exclamation-triangle"></i>
                <h4>Servicio no encontrado</h4>
                <p>${error.message}</p>
                <a href="#/servicios" class="btn btn-primary mt-3">Ver todos los servicios</a>
            </div>
        `;
    }
}

export async function afterRender(params) {
    const favBtn = document.getElementById('btn-toggle-fav');
    if (favBtn) {
        try {
            const favorites = await api.getFavorites('service');
            const isFav = favorites.some(f => f.service_id === parseInt(params.id));
            if (isFav) {
                favBtn.classList.add('active');
                favBtn.innerHTML = '<i class="bi bi-heart-fill"></i> En favoritos';
            }
        } catch(e) {}

        favBtn.addEventListener('click', async () => {
            try {
                if (favBtn.classList.contains('active')) {
                    await api.removeServiceFavorite(parseInt(params.id));
                    favBtn.classList.remove('active');
                    favBtn.innerHTML = '<i class="bi bi-heart"></i> Agregar a favoritos';
                    showToast('Eliminado de favoritos', 'success');
                } else {
                    await api.addFavorite({ service_id: parseInt(params.id) });
                    favBtn.classList.add('active');
                    favBtn.innerHTML = '<i class="bi bi-heart-fill"></i> En favoritos';
                    showToast('Agregado a favoritos', 'success');
                }
            } catch (error) {
                showToast(error.message, 'error');
            }
        });
    }

    const deleteBtn = document.getElementById('btn-delete-service');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', async () => {
            if (confirm('¿Estás seguro de que deseas eliminar este servicio?')) {
                try {
                    await api.deleteService(params.id);
                    showToast('Servicio eliminado', 'success');
                    navigate('/servicios');
                } catch (error) {
                    showToast(error.message, 'error');
                }
            }
        });
    }
}
