/**
 * Vista Publicar Arriendo — Formulario para crear un nuevo arriendo.
 * Solo accesible para usuarios con rol 'propietario'.
 */

import * as api from '../services/api.js';
import { isAuthenticated, hasRole } from '../services/auth.js';
import { navigate } from '../router.js';
import { showToast } from '../utils/helpers.js';
import { validateRequired, validatePositiveNumber, validateForm, showFieldErrors, clearFieldErrors } from '../utils/validators.js';

export async function render() {
    if (!isAuthenticated()) {
        navigate('/login');
        return '<div></div>';
    }
    if (!hasRole('propietario')) {
        return `
            <div class="empty-state" style="margin-top: 5rem;">
                <i class="bi bi-shield-x"></i>
                <h4>Acceso denegado</h4>
                <p>Solo los usuarios con rol Propietario pueden publicar arriendos.</p>
                <a href="#/" class="btn btn-primary mt-3">Volver al inicio</a>
            </div>
        `;
    }

    return `
        <section class="page-section">
            <div class="container" style="max-width: 700px;">
                <div class="page-header animate-fade-in">
                    <h1 class="page-title"><i class="bi bi-plus-circle" style="color: var(--color-primary-light);"></i> Publicar Arriendo</h1>
                    <p class="page-subtitle">Crea una nueva publicación de inmueble</p>
                </div>

                <div class="form-card animate-fade-in" style="max-width: 100%;">
                    <form id="property-form">
                        <div class="mb-3">
                            <label for="title" class="form-label">Título *</label>
                            <input type="text" class="form-control" id="title" 
                                   placeholder="Ej: Habitación amoblada cerca de la Universidad Nacional">
                        </div>

                        <div class="row g-3 mb-3">
                            <div class="col-md-6">
                                <label for="property_type" class="form-label">Tipo de inmueble *</label>
                                <select class="form-select" id="property_type">
                                    <option value="">Seleccionar</option>
                                    <option value="habitacion">Habitación</option>
                                    <option value="apartaestudio">Apartaestudio</option>
                                    <option value="apartamento">Apartamento</option>
                                    <option value="residencia">Residencia Estudiantil</option>
                                </select>
                            </div>
                            <div class="col-md-6">
                                <label for="price" class="form-label">Precio mensual (COP) *</label>
                                <input type="number" class="form-control" id="price" 
                                       placeholder="Ej: 650000" min="0">
                            </div>
                        </div>

                        <div class="mb-3">
                            <label for="university" class="form-label">Universidad cercana *</label>
                            <input type="text" class="form-control" id="university" 
                                   placeholder="Ej: Universidad Nacional de Colombia">
                        </div>

                        <div class="mb-3">
                            <label for="address" class="form-label">Dirección *</label>
                            <input type="text" class="form-control" id="address" 
                                   placeholder="Ej: Calle 45 #28-30, Bogotá">
                        </div>

                        <div class="mb-3">
                            <label for="description" class="form-label">Descripción *</label>
                            <textarea class="form-control" id="description" rows="5"
                                      placeholder="Describe el inmueble: servicios incluidos, reglas, disponibilidad, etc."></textarea>
                        </div>

                        <div class="row g-3 mb-3">
                            <div class="col-md-6">
                                <label for="lat" class="form-label">Latitud <small class="text-muted">(opcional)</small></label>
                                <input type="number" class="form-control" id="lat" step="any" placeholder="Ej: 4.6382">
                            </div>
                            <div class="col-md-6">
                                <label for="lng" class="form-label">Longitud <small class="text-muted">(opcional)</small></label>
                                <input type="number" class="form-control" id="lng" step="any" placeholder="Ej: -74.0835">
                            </div>
                        </div>

                        <div class="mb-4">
                            <label class="form-label">URLs de imágenes <small class="text-muted">(una por línea)</small></label>
                            <textarea class="form-control" id="images" rows="3"
                                      placeholder="https://ejemplo.com/imagen1.jpg&#10;https://ejemplo.com/imagen2.jpg"></textarea>
                            <div class="form-text">Pega las URLs de las imágenes del inmueble, una por línea.</div>
                        </div>

                        <button type="submit" class="btn btn-primary w-100 py-2" id="btn-submit">
                            <i class="bi bi-check-lg"></i> Publicar Arriendo
                        </button>
                    </form>
                </div>
            </div>
        </section>
    `;
}

export async function afterRender() {
    const form = document.getElementById('property-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearFieldErrors();

        const data = {
            title: document.getElementById('title').value.trim(),
            property_type: document.getElementById('property_type').value,
            price: document.getElementById('price').value,
            university: document.getElementById('university').value.trim(),
            address: document.getElementById('address').value.trim(),
            description: document.getElementById('description').value.trim(),
            lat: document.getElementById('lat').value ? parseFloat(document.getElementById('lat').value) : null,
            lng: document.getElementById('lng').value ? parseFloat(document.getElementById('lng').value) : null,
            images: document.getElementById('images').value.split('\n').map(u => u.trim()).filter(u => u)
        };

        // Validar
        const { isValid, errors } = validateForm({
            title: v => validateRequired(v, 'El título', 3),
            property_type: v => validateRequired(v, 'El tipo de inmueble'),
            price: v => validatePositiveNumber(v, 'El precio'),
            university: v => validateRequired(v, 'La universidad', 3),
            address: v => validateRequired(v, 'La dirección', 5),
            description: v => validateRequired(v, 'La descripción', 10)
        }, data);

        if (!isValid) {
            showFieldErrors(errors);
            return;
        }

        const btn = document.getElementById('btn-submit');
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Publicando...';

        try {
            data.price = parseFloat(data.price);
            const result = await api.createProperty(data);
            showToast('¡Arriendo publicado exitosamente!', 'success');
            navigate(`/arriendos/${result.id}`);
        } catch (error) {
            showToast(error.message || 'Error al publicar', 'error');
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<i class="bi bi-check-lg"></i> Publicar Arriendo';
        }
    });
}
