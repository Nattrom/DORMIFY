/**
 * Funciones auxiliares de formato y utilidades generales.
 */

/**
 * Formatea un precio en pesos colombianos.
 */
export function formatPrice(price) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(price);
}

/**
 * Formatea una fecha ISO a formato legible en español.
 */
export function formatDate(isoDate) {
    const date = new Date(isoDate);
    return date.toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

/**
 * Formatea una fecha relativa (hace X minutos/horas/días).
 */
export function timeAgo(isoDate) {
    const now = new Date();
    const date = new Date(isoDate);
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'hace un momento';
    if (seconds < 3600) return `hace ${Math.floor(seconds / 60)} min`;
    if (seconds < 86400) return `hace ${Math.floor(seconds / 3600)}h`;
    if (seconds < 604800) return `hace ${Math.floor(seconds / 86400)} días`;
    return formatDate(isoDate);
}

/**
 * Trunca un texto a un máximo de caracteres.
 */
export function truncate(text, maxLength = 100) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

/**
 * Obtiene las iniciales de un nombre.
 */
export function getInitials(name) {
    if (!name) return '?';
    return name
        .split(' ')
        .filter(Boolean)
        .map(word => word[0].toUpperCase())
        .slice(0, 2)
        .join('');
}

/**
 * Mapea tipos de propiedad a etiquetas legibles.
 */
export function getPropertyTypeLabel(type) {
    const labels = {
        'habitacion': 'Habitación',
        'apartaestudio': 'Apartaestudio',
        'apartamento': 'Apartamento',
        'residencia': 'Residencia'
    };
    return labels[type] || type;
}

/**
 * Mapea categorías de servicio a etiquetas legibles.
 */
export function getServiceCategoryLabel(category) {
    const labels = {
        'lavanderia': 'Lavandería',
        'plomeria': 'Plomería',
        'electricista': 'Electricista',
        'carpinteria': 'Carpintería',
        'papeleria': 'Papelería',
        'mudanzas': 'Mudanzas',
        'varios': 'Varios'
    };
    return labels[category] || category;
}

/**
 * Mapea roles de usuario a etiquetas legibles.
 */
export function getRoleLabel(role) {
    const labels = {
        'estudiante': 'Estudiante',
        'propietario': 'Propietario',
        'proveedor': 'Proveedor de Servicios'
    };
    return labels[role] || role;
}

/**
 * Genera la URL de un iframe de Google Maps para una dirección.
 */
export function getMapEmbedUrl(address, lat, lng) {
    if (lat && lng) {
        return `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`;
    }
    if (address) {
        return `https://maps.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;
    }
    return null;
}

/**
 * Obtiene una imagen placeholder si no hay imágenes.
 */
export function getImageUrl(images, index = 0) {
    if (images && images.length > index) {
        return images[index];
    }
    return 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop';
}

/**
 * Muestra una notificación toast.
 */
export function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toastId = `toast-${Date.now()}`;
    const iconMap = {
        success: 'bi-check-circle-fill',
        error: 'bi-x-circle-fill',
        warning: 'bi-exclamation-triangle-fill'
    };
    const icon = iconMap[type] || iconMap.success;

    const toastHTML = `
        <div class="toast toast-${type} animate-fade-in" id="${toastId}" role="alert">
            <div class="toast-body d-flex align-items-center gap-2">
                <i class="bi ${icon}"></i>
                <span>${message}</span>
                <button type="button" class="btn-close btn-close-white ms-auto" onclick="this.closest('.toast').remove()"></button>
            </div>
        </div>
    `;

    container.insertAdjacentHTML('beforeend', toastHTML);

    // Auto-dismiss después de 4 segundos
    setTimeout(() => {
        const toast = document.getElementById(toastId);
        if (toast) toast.remove();
    }, 4000);
}

/**
 * Genera HTML para un skeleton loader de card.
 */
export function cardSkeleton(count = 6) {
    return Array(count).fill('').map(() => `
        <div class="col">
            <div class="card-glass animate-fade-in" style="opacity: 0.5;">
                <div style="height: 220px; background: var(--color-surface);"></div>
                <div class="card-body">
                    <div style="height: 20px; width: 70%; background: var(--color-surface); border-radius: 4px; margin-bottom: 8px;"></div>
                    <div style="height: 14px; width: 100%; background: var(--color-surface); border-radius: 4px; margin-bottom: 6px;"></div>
                    <div style="height: 14px; width: 60%; background: var(--color-surface); border-radius: 4px;"></div>
                </div>
            </div>
        </div>
    `).join('');
}
