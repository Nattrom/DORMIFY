/**
 * Vista Detalle de Arriendo — Galería, info, mapa, propietario, favorito.
 */

import * as api from '../services/api.js';
import { isAuthenticated, getUser } from '../services/auth.js';
import { navigate } from '../router.js';
import { formatPrice, formatDate, getPropertyTypeLabel, getImageUrl, getMapEmbedUrl, getInitials, showToast } from '../utils/helpers.js';

export async function render(params) {
    try {
        const prop = await api.getProperty(params.id);
        const mapUrl = getMapEmbedUrl(prop.address, prop.lat, prop.lng);
        const user = getUser();
        const isOwner = user && user.id === prop.owner_id;

        return `
            <section class="page-section">
                <div class="container">
                    <!-- Breadcrumb -->
                    <nav class="mb-3 animate-fade-in">
                        <a href="#/arriendos" style="color: var(--color-text-muted);">
                            <i class="bi bi-arrow-left"></i> Volver a arriendos
                        </a>
                    </nav>

                    <!-- Galería -->
                    <div class="detail-hero animate-fade-in">
                        <div class="detail-gallery">
                            <img src="${getImageUrl(prop.images, 0)}" alt="${prop.title}" class="gallery-main"
                                 onerror="this.src='https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'">
                            ${prop.images && prop.images.length > 1 ? `
                                <img src="${getImageUrl(prop.images, 1)}" alt="${prop.title}"
                                     onerror="this.style.display='none'">
                            ` : ''}
                            ${prop.images && prop.images.length > 2 ? `
                                <img src="${getImageUrl(prop.images, 2)}" alt="${prop.title}"
                                     onerror="this.style.display='none'">
                            ` : ''}
                        </div>
                    </div>

                    <div class="row g-4">
                        <!-- Info principal -->
                        <div class="col-lg-8 animate-fade-in">
                            <div class="d-flex justify-content-between align-items-start mb-3">
                                <div>
                                    <span class="badge-category badge-${prop.property_type} mb-2">${getPropertyTypeLabel(prop.property_type)}</span>
                                    <h1 class="detail-title">${prop.title}</h1>
                                    <div class="detail-address">
                                        <i class="bi bi-geo-alt"></i> ${prop.address}
                                    </div>
                                </div>
                                <div class="text-end">
                                    <div class="detail-price">${formatPrice(prop.price)}<span>/mes</span></div>
                                </div>
                            </div>

                            ${isOwner ? `
                                <div class="mb-3">
                                    <a href="#/editar-arriendo/${prop.id}" class="btn btn-outline-primary btn-sm me-2">
                                        <i class="bi bi-pencil"></i> Editar
                                    </a>
                                    <button class="btn btn-danger btn-sm" id="btn-delete-property">
                                        <i class="bi bi-trash"></i> Eliminar
                                    </button>
                                </div>
                            ` : ''}

                            <!-- Descripción -->
                            <div class="detail-section">
                                <h4><i class="bi bi-text-paragraph"></i> Descripción</h4>
                                <p style="color: var(--color-text-secondary); line-height: 1.8;">${prop.description}</p>
                            </div>

                            <!-- Universidad -->
                            <div class="detail-section">
                                <h4><i class="bi bi-mortarboard"></i> Universidad cercana</h4>
                                <p style="color: var(--color-text-secondary);">${prop.university}</p>
                            </div>

                            <!-- Mapa -->
                            ${mapUrl ? `
                            <div class="detail-section">
                                <h4><i class="bi bi-map"></i> Ubicación</h4>
                                <div class="map-container">
                                    <iframe src="${mapUrl}" allowfullscreen loading="lazy"
                                            referrerpolicy="no-referrer-when-downgrade"></iframe>
                                </div>
                            </div>
                            ` : ''}

                            <!-- Detalles -->
                            <div class="detail-section">
                                <h4><i class="bi bi-info-circle"></i> Detalles</h4>
                                <div class="row g-3">
                                    <div class="col-6 col-md-3">
                                        <div style="background: var(--color-surface); border-radius: var(--radius-md); padding: 1rem; text-align: center;">
                                            <i class="bi bi-house-door" style="font-size: 1.5rem; color: var(--color-primary-light);"></i>
                                            <div style="font-size: var(--font-size-xs); color: var(--color-text-muted); margin-top: 0.3rem;">Tipo</div>
                                            <div style="font-weight: 600; font-size: var(--font-size-sm);">${getPropertyTypeLabel(prop.property_type)}</div>
                                        </div>
                                    </div>
                                    <div class="col-6 col-md-3">
                                        <div style="background: var(--color-surface); border-radius: var(--radius-md); padding: 1rem; text-align: center;">
                                            <i class="bi bi-cash-stack" style="font-size: 1.5rem; color: var(--color-success);"></i>
                                            <div style="font-size: var(--font-size-xs); color: var(--color-text-muted); margin-top: 0.3rem;">Precio</div>
                                            <div style="font-weight: 600; font-size: var(--font-size-sm);">${formatPrice(prop.price)}</div>
                                        </div>
                                    </div>
                                    <div class="col-6 col-md-3">
                                        <div style="background: var(--color-surface); border-radius: var(--radius-md); padding: 1rem; text-align: center;">
                                            <i class="bi bi-calendar-event" style="font-size: 1.5rem; color: var(--color-accent);"></i>
                                            <div style="font-size: var(--font-size-xs); color: var(--color-text-muted); margin-top: 0.3rem;">Publicado</div>
                                            <div style="font-weight: 600; font-size: var(--font-size-sm);">${formatDate(prop.created_at)}</div>
                                        </div>
                                    </div>
                                    <div class="col-6 col-md-3">
                                        <div style="background: var(--color-surface); border-radius: var(--radius-md); padding: 1rem; text-align: center;">
                                            <i class="bi bi-images" style="font-size: 1.5rem; color: var(--color-secondary);"></i>
                                            <div style="font-size: var(--font-size-xs); color: var(--color-text-muted); margin-top: 0.3rem;">Fotos</div>
                                            <div style="font-weight: 600; font-size: var(--font-size-sm);">${(prop.images || []).length}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Sidebar -->
                        <div class="col-lg-4 animate-fade-in">
                            <div class="detail-sidebar">
                                <h5 style="font-weight: 700; margin-bottom: 1rem;">Información del propietario</h5>
                                <div class="owner-info">
                                    <div class="owner-avatar">${getInitials(prop.owner.full_name)}</div>
                                    <div>
                                        <div style="font-weight: 600;">${prop.owner.full_name}</div>
                                        <div style="font-size: var(--font-size-xs); color: var(--color-text-muted);">Propietario</div>
                                    </div>
                                </div>
                                ${prop.owner.phone ? `
                                    <div style="margin-bottom: 0.75rem; font-size: var(--font-size-sm); color: var(--color-text-secondary);">
                                        <i class="bi bi-telephone" style="color: var(--color-primary-light);"></i> ${prop.owner.phone}
                                    </div>
                                ` : ''}
                                <div style="margin-bottom: 1.5rem; font-size: var(--font-size-sm); color: var(--color-text-secondary);">
                                    <i class="bi bi-envelope" style="color: var(--color-primary-light);"></i> ${prop.owner.email}
                                </div>

                                ${isAuthenticated() && !isOwner ? `
                                    <button class="btn-favorite w-100 mb-2" id="btn-toggle-fav" data-property-id="${prop.id}">
                                        <i class="bi bi-heart"></i> Agregar a favoritos
                                    </button>
                                ` : ''}

                                ${!isAuthenticated() ? `
                                    <a href="#/login" class="btn btn-outline-primary w-100">
                                        <i class="bi bi-box-arrow-in-right"></i> Inicia sesión para contactar
                                    </a>
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
                <h4>Propiedad no encontrada</h4>
                <p>${error.message}</p>
                <a href="#/arriendos" class="btn btn-primary mt-3">Ver todos los arriendos</a>
            </div>
        `;
    }
}

export async function afterRender(params) {
    // Botón favorito
    const favBtn = document.getElementById('btn-toggle-fav');
    if (favBtn) {
        // Verificar si ya es favorito
        try {
            const favorites = await api.getFavorites('property');
            const isFav = favorites.some(f => f.property_id === parseInt(params.id));
            if (isFav) {
                favBtn.classList.add('active');
                favBtn.innerHTML = '<i class="bi bi-heart-fill"></i> En favoritos';
            }
        } catch(e) { /* ok */ }

        favBtn.addEventListener('click', async () => {
            try {
                if (favBtn.classList.contains('active')) {
                    await api.removePropertyFavorite(parseInt(params.id));
                    favBtn.classList.remove('active');
                    favBtn.innerHTML = '<i class="bi bi-heart"></i> Agregar a favoritos';
                    showToast('Eliminado de favoritos', 'success');
                } else {
                    await api.addFavorite({ property_id: parseInt(params.id) });
                    favBtn.classList.add('active');
                    favBtn.innerHTML = '<i class="bi bi-heart-fill"></i> En favoritos';
                    showToast('Agregado a favoritos', 'success');
                }
            } catch (error) {
                showToast(error.message, 'error');
            }
        });
    }

    // Botón eliminar (solo para el dueño)
    const deleteBtn = document.getElementById('btn-delete-property');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', async () => {
            if (confirm('¿Estás seguro de que deseas eliminar esta propiedad?')) {
                try {
                    await api.deleteProperty(params.id);
                    showToast('Propiedad eliminada', 'success');
                    navigate('/arriendos');
                } catch (error) {
                    showToast(error.message, 'error');
                }
            }
        });
    }
}
