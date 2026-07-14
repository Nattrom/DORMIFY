/**
 * Vista Perfil — Info del usuario, sus publicaciones y favoritos.
 */

import * as api from '../services/api.js';
import { getUser, isAuthenticated, updateProfile } from '../services/auth.js';
import { navigate } from '../router.js';
import { formatPrice, getPropertyTypeLabel, getServiceCategoryLabel, getRoleLabel, getInitials, getImageUrl, truncate, showToast, formatDate } from '../utils/helpers.js';

export async function render() {
    if (!isAuthenticated()) {
        navigate('/login');
        return '<div></div>';
    }

    const user = getUser();

    return `
        <section class="page-section">
            <div class="container" style="max-width: 900px;">
                <!-- Profile Header -->
                <div class="profile-header animate-fade-in">
                    <div class="profile-avatar-lg">${getInitials(user.full_name)}</div>
                    <div class="profile-info">
                        <h2>${user.full_name}</h2>
                        <span class="role-badge">${getRoleLabel(user.role)}</span>
                        <p style="color: var(--color-text-secondary); font-size: var(--font-size-sm); margin-top: 0.5rem;">
                            <i class="bi bi-envelope"></i> ${user.email}
                            ${user.phone ? `<span class="ms-3"><i class="bi bi-telephone"></i> ${user.phone}</span>` : ''}
                        </p>
                        <p style="color: var(--color-text-muted); font-size: var(--font-size-xs);">
                            Miembro desde ${formatDate(user.created_at)}
                        </p>
                    </div>
                </div>

                <!-- Tabs -->
                <div class="tabs-nav animate-fade-in">
                    <button class="tab-btn active" data-tab="editar">
                        <i class="bi bi-pencil"></i> Editar perfil
                    </button>
                    <button class="tab-btn" data-tab="publicaciones">
                        <i class="bi bi-collection"></i> Mis publicaciones
                    </button>
                    <button class="tab-btn" data-tab="favoritos">
                        <i class="bi bi-heart"></i> Mis favoritos
                    </button>
                </div>

                <!-- Tab Content -->
                <div id="tab-content">
                    ${renderEditTab(user)}
                </div>
            </div>
        </section>
    `;
}

function renderEditTab(user) {
    return `
        <div class="animate-fade-in" style="max-width: 500px;">
            <form id="edit-profile-form">
                <div class="mb-3">
                    <label for="full_name" class="form-label">Nombre completo</label>
                    <input type="text" class="form-control" id="full_name" value="${user.full_name}">
                </div>
                <div class="mb-3">
                    <label for="phone" class="form-label">Teléfono</label>
                    <input type="tel" class="form-control" id="phone" value="${user.phone || ''}" placeholder="+57 300 000 0000">
                </div>
                <div class="mb-3">
                    <label for="avatar_url" class="form-label">URL de avatar</label>
                    <input type="url" class="form-control" id="avatar_url" value="${user.avatar_url || ''}" placeholder="https://ejemplo.com/foto.jpg">
                </div>
                <button type="submit" class="btn btn-primary" id="btn-save-profile">
                    <i class="bi bi-check-lg"></i> Guardar cambios
                </button>
            </form>
        </div>
    `;
}

export async function afterRender() {
    const user = getUser();

    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const tab = btn.dataset.tab;
            const content = document.getElementById('tab-content');

            if (tab === 'editar') {
                content.innerHTML = renderEditTab(user);
                setupEditForm();
            } else if (tab === 'publicaciones') {
                content.innerHTML = '<div class="loading-screen" style="min-height:200px"><div class="spinner-border text-primary"></div></div>';
                await loadPublications(content);
            } else if (tab === 'favoritos') {
                content.innerHTML = '<div class="loading-screen" style="min-height:200px"><div class="spinner-border text-primary"></div></div>';
                await loadFavorites(content);
            }
        });
    });

    // Setup edit form initially
    setupEditForm();
}

function setupEditForm() {
    const form = document.getElementById('edit-profile-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('btn-save-profile');
        btn.disabled = true;

        try {
            const data = {
                full_name: document.getElementById('full_name').value,
                phone: document.getElementById('phone').value || null,
                avatar_url: document.getElementById('avatar_url').value || null
            };
            await updateProfile(data);
            showToast('Perfil actualizado', 'success');
        } catch (error) {
            showToast(error.message, 'error');
        } finally {
            btn.disabled = false;
        }
    });
}

async function loadPublications(container) {
    const user = getUser();
    let html = '<div class="animate-fade-in">';

    try {
        if (user.role === 'propietario') {
            const result = await api.getProperties({ per_page: 50 });
            const myProps = result.items.filter(p => p.owner_id === user.id);

            html += '<h5 style="font-weight: 700; margin-bottom: 1rem;">Mis arriendos</h5>';
            if (myProps.length === 0) {
                html += `<div class="empty-state"><p>No has publicado arriendos aún.</p>
                    <a href="#/publicar-arriendo" class="btn btn-primary btn-sm mt-2"><i class="bi bi-plus"></i> Publicar arriendo</a></div>`;
            } else {
                html += '<div class="row row-cols-1 row-cols-md-2 g-3">';
                myProps.forEach(prop => {
                    html += `
                        <div class="col">
                            <div class="card-glass" onclick="location.hash='#/arriendos/${prop.id}'">
                                <div class="card-img-wrapper">
                                    <img src="${getImageUrl(prop.images)}" class="card-img-top" alt="${prop.title}" style="height: 160px;"
                                         onerror="this.src='https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'">
                                    <div class="card-price">${formatPrice(prop.price)}/mes</div>
                                </div>
                                <div class="card-body">
                                    <h6 class="card-title">${truncate(prop.title, 40)}</h6>
                                    <span class="badge-category badge-${prop.property_type}">${getPropertyTypeLabel(prop.property_type)}</span>
                                </div>
                            </div>
                        </div>
                    `;
                });
                html += '</div>';
            }
        } else if (user.role === 'proveedor') {
            const result = await api.getServices({ per_page: 50 });
            const mySvcs = result.items.filter(s => s.provider_id === user.id);

            html += '<h5 style="font-weight: 700; margin-bottom: 1rem;">Mis servicios</h5>';
            if (mySvcs.length === 0) {
                html += `<div class="empty-state"><p>No has publicado servicios aún.</p>
                    <a href="#/publicar-servicio" class="btn btn-primary btn-sm mt-2"><i class="bi bi-plus"></i> Publicar servicio</a></div>`;
            } else {
                html += '<div class="row row-cols-1 row-cols-md-2 g-3">';
                mySvcs.forEach(svc => {
                    html += `
                        <div class="col">
                            <div class="card-glass" onclick="location.hash='#/servicios/${svc.id}'">
                                <div class="card-body">
                                    <span class="badge-category badge-${svc.category}">${getServiceCategoryLabel(svc.category)}</span>
                                    <h6 class="card-title mt-2">${truncate(svc.name, 40)}</h6>
                                    <p class="card-text">${truncate(svc.description, 60)}</p>
                                </div>
                            </div>
                        </div>
                    `;
                });
                html += '</div>';
            }
        } else {
            // Estudiantes: mostrar posts del foro
            const result = await api.getPosts({ per_page: 50 });
            const myPosts = result.items.filter(p => p.author_id === user.id);

            html += '<h5 style="font-weight: 700; margin-bottom: 1rem;">Mis posts del foro</h5>';
            if (myPosts.length === 0) {
                html += `<div class="empty-state"><p>No has creado publicaciones en el foro.</p>
                    <a href="#/foro" class="btn btn-primary btn-sm mt-2">Ir al foro</a></div>`;
            } else {
                myPosts.forEach(post => {
                    html += `
                        <div class="post-card" onclick="location.hash='#/foro/${post.id}'">
                            <h6 class="post-card-title">${post.title}</h6>
                            <p class="post-card-content">${truncate(post.content, 100)}</p>
                        </div>
                    `;
                });
            }
        }
    } catch (error) {
        html += `<div class="empty-state"><p>Error al cargar publicaciones: ${error.message}</p></div>`;
    }

    html += '</div>';
    container.innerHTML = html;
}

async function loadFavorites(container) {
    let html = '<div class="animate-fade-in">';

    try {
        const favorites = await api.getFavorites();

        if (favorites.length === 0) {
            html += `<div class="empty-state"><i class="bi bi-heart"></i><h4>No tienes favoritos</h4><p>Explora arriendos y servicios para guardarlos.</p></div>`;
        } else {
            // Separar por tipo
            const propFavs = favorites.filter(f => f.property_id);
            const svcFavs = favorites.filter(f => f.service_id);

            if (propFavs.length > 0) {
                html += '<h5 style="font-weight: 700; margin-bottom: 1rem;">Arriendos favoritos</h5>';
                html += '<div class="row row-cols-1 row-cols-md-2 g-3 mb-4">';
                for (const fav of propFavs) {
                    try {
                        const prop = await api.getProperty(fav.property_id);
                        html += `
                            <div class="col">
                                <div class="card-glass" onclick="location.hash='#/arriendos/${prop.id}'">
                                    <div class="card-img-wrapper">
                                        <img src="${getImageUrl(prop.images)}" class="card-img-top" alt="${prop.title}" style="height: 160px;"
                                             onerror="this.src='https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'">
                                        <div class="card-price">${formatPrice(prop.price)}/mes</div>
                                    </div>
                                    <div class="card-body">
                                        <h6 class="card-title">${truncate(prop.title, 40)}</h6>
                                    </div>
                                </div>
                            </div>
                        `;
                    } catch(e) {}
                }
                html += '</div>';
            }

            if (svcFavs.length > 0) {
                html += '<h5 style="font-weight: 700; margin-bottom: 1rem;">Servicios favoritos</h5>';
                html += '<div class="row row-cols-1 row-cols-md-2 g-3">';
                for (const fav of svcFavs) {
                    try {
                        const svc = await api.getService(fav.service_id);
                        html += `
                            <div class="col">
                                <div class="card-glass" onclick="location.hash='#/servicios/${svc.id}'">
                                    <div class="card-body">
                                        <span class="badge-category badge-${svc.category}">${getServiceCategoryLabel(svc.category)}</span>
                                        <h6 class="card-title mt-2">${svc.name}</h6>
                                    </div>
                                </div>
                            </div>
                        `;
                    } catch(e) {}
                }
                html += '</div>';
            }
        }
    } catch (error) {
        html += `<div class="empty-state"><p>Error al cargar favoritos: ${error.message}</p></div>`;
    }

    html += '</div>';
    container.innerHTML = html;
}
