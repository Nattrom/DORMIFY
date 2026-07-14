/**
 * Vista Foro — Listado de posts con búsqueda y creación.
 */

import * as api from '../services/api.js';
import { isAuthenticated } from '../services/auth.js';
import { navigate } from '../router.js';
import { timeAgo, truncate, getInitials, showToast } from '../utils/helpers.js';

export async function render() {
    return `
        <section class="page-section">
            <div class="container">
                <div class="row">
                    <div class="col-lg-8">
                        <div class="page-header animate-fade-in">
                            <h1 class="page-title"><i class="bi bi-chat-square-text" style="color: var(--color-accent);"></i> Foro</h1>
                            <p class="page-subtitle">Conecta con la comunidad estudiantil</p>
                        </div>

                        <!-- Filtros -->
                        <div class="filter-bar animate-fade-in mb-3">
                            <div class="filter-group">
                                <div class="form-group" style="flex: 2;">
                                    <input type="text" class="form-control form-control-sm" id="filter-search"
                                           placeholder="Buscar publicaciones...">
                                </div>
                                <div class="form-group">
                                    <select class="form-select form-select-sm" id="filter-category">
                                        <option value="">Todas las categorías</option>
                                        <option value="roommate">Roommate</option>
                                        <option value="recomendacion">Recomendación</option>
                                        <option value="pregunta">Pregunta</option>
                                        <option value="general">General</option>
                                    </select>
                                </div>
                                <div class="form-group" style="flex: 0;">
                                    <button class="btn btn-primary btn-sm" id="btn-filter">
                                        <i class="bi bi-search"></i>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Posts -->
                        <div id="posts-list">
                            <div class="loading-screen" style="min-height: 200px;">
                                <div class="spinner-border text-primary"></div>
                            </div>
                        </div>

                        <div class="pagination-wrapper" id="pagination"></div>
                    </div>

                    <!-- Sidebar: Crear post -->
                    <div class="col-lg-4">
                        <div class="animate-fade-in">
                            ${isAuthenticated() ? `
                                <div class="detail-sidebar">
                                    <h5 style="font-weight: 700; margin-bottom: 1rem;">
                                        <i class="bi bi-plus-circle" style="color: var(--color-primary-light);"></i> Crear publicación
                                    </h5>
                                    <form id="create-post-form">
                                        <div class="mb-3">
                                            <input type="text" class="form-control form-control-sm" id="post-title"
                                                   placeholder="Título de tu publicación" required>
                                        </div>
                                        <div class="mb-3">
                                            <textarea class="form-control form-control-sm" id="post-content"
                                                      placeholder="¿Qué quieres compartir con la comunidad?" rows="4" required
                                                      style="min-height: 100px;"></textarea>
                                        </div>
                                        <div class="mb-3">
                                            <select class="form-select form-select-sm" id="post-category">
                                                <option value="">Categoría (opcional)</option>
                                                <option value="roommate">Roommate</option>
                                                <option value="recomendacion">Recomendación</option>
                                                <option value="pregunta">Pregunta</option>
                                                <option value="general">General</option>
                                            </select>
                                        </div>
                                        <button type="submit" class="btn btn-primary w-100 btn-sm" id="btn-create-post">
                                            <i class="bi bi-send"></i> Publicar
                                        </button>
                                    </form>
                                </div>
                            ` : `
                                <div class="detail-sidebar text-center">
                                    <i class="bi bi-chat-left-text" style="font-size: 2rem; color: var(--color-primary-light);"></i>
                                    <p style="color: var(--color-text-secondary); font-size: var(--font-size-sm); margin-top: 0.5rem;">
                                        Inicia sesión para crear publicaciones y comentar.
                                    </p>
                                    <a href="#/login" class="btn btn-primary btn-sm w-100">
                                        <i class="bi bi-box-arrow-in-right"></i> Iniciar Sesión
                                    </a>
                                </div>
                            `}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    `;
}

export async function afterRender() {
    await loadPosts(1);

    // Filtros
    document.getElementById('btn-filter')?.addEventListener('click', () => loadPosts(1));
    document.getElementById('filter-search')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') loadPosts(1);
    });
    document.getElementById('filter-category')?.addEventListener('change', () => loadPosts(1));

    // Crear post
    const form = document.getElementById('create-post-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const title = document.getElementById('post-title').value.trim();
            const content = document.getElementById('post-content').value.trim();
            const category = document.getElementById('post-category').value || null;

            if (!title || title.length < 3) {
                showToast('El título debe tener al menos 3 caracteres', 'warning');
                return;
            }
            if (!content || content.length < 10) {
                showToast('El contenido debe tener al menos 10 caracteres', 'warning');
                return;
            }

            const btn = document.getElementById('btn-create-post');
            btn.disabled = true;

            try {
                await api.createPost({ title, content, category });
                showToast('Publicación creada', 'success');
                form.reset();
                await loadPosts(1);
            } catch (error) {
                showToast(error.message, 'error');
            } finally {
                btn.disabled = false;
            }
        });
    }
}

async function loadPosts(page) {
    const list = document.getElementById('posts-list');
    const pagination = document.getElementById('pagination');

    const filters = {
        search: document.getElementById('filter-search')?.value || '',
        category: document.getElementById('filter-category')?.value || '',
        page,
        per_page: 10
    };

    try {
        const result = await api.getPosts(filters);
        const posts = result.items;

        if (posts.length === 0) {
            list.innerHTML = `
                <div class="empty-state">
                    <i class="bi bi-chat-square"></i>
                    <h4>No hay publicaciones aún</h4>
                    <p>¡Sé el primero en publicar algo!</p>
                </div>
            `;
            pagination.innerHTML = '';
            return;
        }

        list.innerHTML = posts.map(post => `
            <div class="post-card animate-fade-in" onclick="location.hash='#/foro/${post.id}'">
                <div class="post-card-header">
                    <h5 class="post-card-title">${post.title}</h5>
                    ${post.category ? `<span class="badge-category badge-${post.category === 'roommate' ? 'habitacion' : post.category === 'recomendacion' ? 'apartaestudio' : 'varios'}">${post.category}</span>` : ''}
                </div>
                <p class="post-card-content">${truncate(post.content, 150)}</p>
                <div class="post-card-footer">
                    <div class="post-author">
                        <div class="post-author-avatar">${getInitials(post.author.full_name)}</div>
                        <span>${post.author.full_name}</span>
                        <span style="color: var(--color-text-muted);">· ${timeAgo(post.created_at)}</span>
                    </div>
                    <div style="color: var(--color-text-muted); font-size: var(--font-size-sm);">
                        <i class="bi bi-chat"></i> ${(post.comments || []).length}
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
                btn.addEventListener('click', () => loadPosts(parseInt(btn.dataset.page)));
            });
        } else {
            pagination.innerHTML = '';
        }

    } catch (error) {
        list.innerHTML = `
            <div class="empty-state">
                <i class="bi bi-exclamation-triangle"></i>
                <h4>Error al cargar publicaciones</h4>
                <p>${error.message}</p>
            </div>
        `;
    }
}
