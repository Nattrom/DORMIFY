/**
 * Vista Detalle de Post — Post completo con sistema de comentarios.
 */

import * as api from '../services/api.js';
import { isAuthenticated, getUser } from '../services/auth.js';
import { navigate } from '../router.js';
import { timeAgo, formatDate, getInitials, showToast } from '../utils/helpers.js';

export async function render(params) {
    try {
        const post = await api.getPost(params.id);
        const user = getUser();
        const isAuthor = user && user.id === post.author_id;

        return `
            <section class="page-section">
                <div class="container" style="max-width: 800px;">
                    <nav class="mb-3 animate-fade-in">
                        <a href="#/foro" style="color: var(--color-text-muted);">
                            <i class="bi bi-arrow-left"></i> Volver al foro
                        </a>
                    </nav>

                    <!-- Post -->
                    <article class="animate-fade-in">
                        <div class="d-flex justify-content-between align-items-start mb-3">
                            <div>
                                ${post.category ? `<span class="badge-category badge-${post.category === 'roommate' ? 'habitacion' : post.category === 'recomendacion' ? 'apartaestudio' : 'varios'} mb-2">${post.category}</span>` : ''}
                                <h1 class="detail-title">${post.title}</h1>
                            </div>
                            ${isAuthor ? `
                                <button class="btn btn-danger btn-sm" id="btn-delete-post">
                                    <i class="bi bi-trash"></i>
                                </button>
                            ` : ''}
                        </div>

                        <div class="post-author mb-4">
                            <div class="post-author-avatar" style="width: 40px; height: 40px; font-size: 0.9rem;">
                                ${getInitials(post.author.full_name)}
                            </div>
                            <div>
                                <div style="font-weight: 600;">${post.author.full_name}</div>
                                <div style="font-size: var(--font-size-xs); color: var(--color-text-muted);">
                                    ${formatDate(post.created_at)}
                                </div>
                            </div>
                        </div>

                        <div style="color: var(--color-text-secondary); line-height: 1.9; font-size: var(--font-size-base); white-space: pre-wrap; margin-bottom: 2rem;">
${post.content}
                        </div>
                    </article>

                    <hr style="border-color: var(--color-border); margin: 2rem 0;">

                    <!-- Comentarios -->
                    <div class="animate-fade-in">
                        <h4 style="font-weight: 700; margin-bottom: 1.5rem;">
                            <i class="bi bi-chat" style="color: var(--color-primary-light);"></i>
                            Comentarios (${(post.comments || []).length})
                        </h4>

                        ${isAuthenticated() ? `
                            <form id="comment-form" class="mb-4">
                                <div class="d-flex gap-2">
                                    <div class="post-author-avatar" style="width: 36px; height: 36px; font-size: 0.8rem; flex-shrink: 0; margin-top: 4px;">
                                        ${getInitials(user.full_name)}
                                    </div>
                                    <div class="flex-grow-1">
                                        <textarea class="form-control form-control-sm" id="comment-content"
                                                  placeholder="Escribe un comentario..." rows="2" style="min-height: 60px;"></textarea>
                                    </div>
                                    <button type="submit" class="btn btn-primary btn-sm align-self-end" id="btn-comment">
                                        <i class="bi bi-send"></i>
                                    </button>
                                </div>
                            </form>
                        ` : `
                            <div class="mb-4 p-3" style="background: var(--color-surface); border-radius: var(--radius-md); text-align: center;">
                                <p style="color: var(--color-text-muted); font-size: var(--font-size-sm); margin: 0;">
                                    <a href="#/login">Inicia sesión</a> para dejar un comentario.
                                </p>
                            </div>
                        `}

                        <div id="comments-list">
                            ${(post.comments || []).length === 0 ? `
                                <p style="color: var(--color-text-muted); text-align: center; font-size: var(--font-size-sm);">
                                    No hay comentarios aún. ¡Sé el primero!
                                </p>
                            ` : (post.comments || []).map(comment => renderComment(comment, user)).join('')}
                        </div>
                    </div>
                </div>
            </section>
        `;
    } catch (error) {
        return `
            <div class="empty-state" style="margin-top: 5rem;">
                <i class="bi bi-exclamation-triangle"></i>
                <h4>Publicación no encontrada</h4>
                <p>${error.message}</p>
                <a href="#/foro" class="btn btn-primary mt-3">Volver al foro</a>
            </div>
        `;
    }
}

function renderComment(comment, currentUser) {
    const isAuthor = currentUser && currentUser.id === comment.author_id;
    return `
        <div class="comment-card">
            <div class="comment-header">
                <div class="post-author">
                    <div class="post-author-avatar">${getInitials(comment.author.full_name)}</div>
                    <span style="font-weight: 600;">${comment.author.full_name}</span>
                    <span style="color: var(--color-text-muted);">· ${timeAgo(comment.created_at)}</span>
                </div>
                ${isAuthor ? `
                    <button class="btn btn-sm" style="color: var(--color-error); background: none; border: none;" 
                            onclick="window.deleteComment(${comment.post_id}, ${comment.id})" title="Eliminar comentario">
                        <i class="bi bi-trash"></i>
                    </button>
                ` : ''}
            </div>
            <div class="comment-content">${comment.content}</div>
        </div>
    `;
}

export async function afterRender(params) {
    // Crear comentario
    const form = document.getElementById('comment-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const content = document.getElementById('comment-content').value.trim();
            if (!content) {
                showToast('Escribe un comentario', 'warning');
                return;
            }

            const btn = document.getElementById('btn-comment');
            btn.disabled = true;

            try {
                await api.createComment(params.id, { content });
                showToast('Comentario publicado', 'success');
                // Recargar la vista
                const html = await render(params);
                document.getElementById('app').innerHTML = html;
                await afterRender(params);
            } catch (error) {
                showToast(error.message, 'error');
                btn.disabled = false;
            }
        });
    }

    // Función global para eliminar comentario (llamada desde onclick en el HTML)
    window.deleteComment = async (postId, commentId) => {
        if (!confirm('¿Eliminar este comentario?')) return;
        try {
            await api.deleteComment(postId, commentId);
            showToast('Comentario eliminado', 'success');
            const html = await render(params);
            document.getElementById('app').innerHTML = html;
            await afterRender(params);
        } catch (error) {
            showToast(error.message, 'error');
        }
    };

    // Eliminar post
    const deleteBtn = document.getElementById('btn-delete-post');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', async () => {
            if (confirm('¿Estás seguro de eliminar esta publicación y todos sus comentarios?')) {
                try {
                    await api.deletePost(params.id);
                    showToast('Publicación eliminada', 'success');
                    navigate('/foro');
                } catch (error) {
                    showToast(error.message, 'error');
                }
            }
        });
    }
}
