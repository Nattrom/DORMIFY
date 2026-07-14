/**
 * Vista Publicar Servicio — Formulario para crear un nuevo servicio.
 * Solo accesible para usuarios con rol 'proveedor'.
 */

import * as api from '../services/api.js';
import { isAuthenticated, hasRole } from '../services/auth.js';
import { navigate } from '../router.js';
import { showToast } from '../utils/helpers.js';
import { validateRequired, validateForm, showFieldErrors, clearFieldErrors } from '../utils/validators.js';

export async function render() {
    if (!isAuthenticated()) {
        navigate('/login');
        return '<div></div>';
    }
    if (!hasRole('proveedor')) {
        return `
            <div class="empty-state" style="margin-top: 5rem;">
                <i class="bi bi-shield-x"></i>
                <h4>Acceso denegado</h4>
                <p>Solo los usuarios con rol Proveedor de Servicios pueden publicar servicios.</p>
                <a href="#/" class="btn btn-primary mt-3">Volver al inicio</a>
            </div>
        `;
    }

    return `
        <section class="page-section">
            <div class="container" style="max-width: 700px;">
                <div class="page-header animate-fade-in">
                    <h1 class="page-title"><i class="bi bi-plus-circle" style="color: var(--color-secondary);"></i> Publicar Servicio</h1>
                    <p class="page-subtitle">Ofrece tu servicio a la comunidad estudiantil</p>
                </div>

                <div class="form-card animate-fade-in" style="max-width: 100%;">
                    <form id="service-form">
                        <div class="mb-3">
                            <label for="name" class="form-label">Nombre del servicio *</label>
                            <input type="text" class="form-control" id="name" 
                                   placeholder="Ej: Lavandería Express Universitaria">
                        </div>

                        <div class="mb-3">
                            <label for="category" class="form-label">Categoría *</label>
                            <select class="form-select" id="category">
                                <option value="">Seleccionar</option>
                                <option value="lavanderia">Lavandería</option>
                                <option value="plomeria">Plomería</option>
                                <option value="electricista">Electricista</option>
                                <option value="carpinteria">Carpintería</option>
                                <option value="papeleria">Papelería</option>
                                <option value="mudanzas">Mudanzas</option>
                                <option value="varios">Varios</option>
                            </select>
                        </div>

                        <div class="mb-3">
                            <label for="description" class="form-label">Descripción *</label>
                            <textarea class="form-control" id="description" rows="4"
                                      placeholder="Describe tu servicio, precios, paquetes especiales..."></textarea>
                        </div>

                        <div class="mb-3">
                            <label for="contact_info" class="form-label">Información de contacto *</label>
                            <input type="text" class="form-control" id="contact_info" 
                                   placeholder="Ej: +57 300 123 4567 | tu@email.com">
                        </div>

                        <div class="mb-3">
                            <label for="location" class="form-label">Ubicación <small class="text-muted">(opcional)</small></label>
                            <input type="text" class="form-control" id="location" 
                                   placeholder="Ej: Carrera 30 #45-10, Bogotá">
                        </div>

                        <div class="mb-3">
                            <label for="schedule" class="form-label">Horarios <small class="text-muted">(opcional)</small></label>
                            <input type="text" class="form-control" id="schedule" 
                                   placeholder="Ej: Lunes a Sábado: 7:00 AM - 8:00 PM">
                        </div>

                        <div class="mb-4">
                            <label class="form-label">URLs de imágenes <small class="text-muted">(una por línea)</small></label>
                            <textarea class="form-control" id="images" rows="3"
                                      placeholder="https://ejemplo.com/imagen1.jpg"></textarea>
                        </div>

                        <button type="submit" class="btn btn-primary w-100 py-2" id="btn-submit">
                            <i class="bi bi-check-lg"></i> Publicar Servicio
                        </button>
                    </form>
                </div>
            </div>
        </section>
    `;
}

export async function afterRender() {
    const form = document.getElementById('service-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearFieldErrors();

        const data = {
            name: document.getElementById('name').value.trim(),
            category: document.getElementById('category').value,
            description: document.getElementById('description').value.trim(),
            contact_info: document.getElementById('contact_info').value.trim(),
            location: document.getElementById('location').value.trim() || null,
            schedule: document.getElementById('schedule').value.trim() || null,
            images: document.getElementById('images').value.split('\n').map(u => u.trim()).filter(u => u)
        };

        const { isValid, errors } = validateForm({
            name: v => validateRequired(v, 'El nombre', 3),
            category: v => validateRequired(v, 'La categoría'),
            description: v => validateRequired(v, 'La descripción', 10),
            contact_info: v => validateRequired(v, 'La información de contacto', 5)
        }, data);

        if (!isValid) {
            showFieldErrors(errors);
            return;
        }

        const btn = document.getElementById('btn-submit');
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Publicando...';

        try {
            const result = await api.createService(data);
            showToast('¡Servicio publicado exitosamente!', 'success');
            navigate(`/servicios/${result.id}`);
        } catch (error) {
            showToast(error.message || 'Error al publicar', 'error');
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<i class="bi bi-check-lg"></i> Publicar Servicio';
        }
    });
}
