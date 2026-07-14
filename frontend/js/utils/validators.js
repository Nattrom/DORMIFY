/**
 * Validaciones de formularios en el lado del cliente.
 * Se ejecutan antes de enviar datos al backend.
 */

/**
 * Valida un campo de email.
 */
export function validateEmail(email) {
    const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email || email.trim() === '') return 'El correo electrónico es requerido';
    if (!pattern.test(email)) return 'Formato de correo inválido';
    return null;
}

/**
 * Valida una contraseña.
 */
export function validatePassword(password) {
    if (!password) return 'La contraseña es requerida';
    if (password.length < 6) return 'La contraseña debe tener al menos 6 caracteres';
    return null;
}

/**
 * Valida un campo de texto requerido con longitud mínima.
 */
export function validateRequired(value, fieldName, minLength = 1) {
    if (!value || value.trim() === '') return `${fieldName} es requerido`;
    if (value.trim().length < minLength) return `${fieldName} debe tener al menos ${minLength} caracteres`;
    return null;
}

/**
 * Valida un campo numérico positivo.
 */
export function validatePositiveNumber(value, fieldName) {
    if (value === null || value === undefined || value === '') return `${fieldName} es requerido`;
    const num = parseFloat(value);
    if (isNaN(num)) return `${fieldName} debe ser un número`;
    if (num <= 0) return `${fieldName} debe ser mayor a 0`;
    return null;
}

/**
 * Valida una URL.
 */
export function validateUrl(url) {
    if (!url || url.trim() === '') return null; // URLs son opcionales
    const pattern = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;
    if (!pattern.test(url)) return 'Formato de URL inválido';
    return null;
}

/**
 * Valida un formulario completo.
 * @param {object} rules - { fieldName: validationFunction(value) }
 * @param {object} values - { fieldName: value }
 * @returns {{ isValid: boolean, errors: object }}
 */
export function validateForm(rules, values) {
    const errors = {};
    let isValid = true;

    Object.entries(rules).forEach(([field, validator]) => {
        const error = validator(values[field]);
        if (error) {
            errors[field] = error;
            isValid = false;
        }
    });

    return { isValid, errors };
}

/**
 * Muestra errores de validación en los campos del formulario.
 */
export function showFieldErrors(errors) {
    // Limpiar errores previos
    clearFieldErrors();

    Object.entries(errors).forEach(([field, message]) => {
        const input = document.getElementById(field);
        if (input) {
            input.classList.add('is-invalid');
            // Crear mensaje de error
            const errorDiv = document.createElement('div');
            errorDiv.className = 'field-error';
            errorDiv.textContent = message;
            errorDiv.id = `${field}-error`;
            input.parentNode.appendChild(errorDiv);
        }
    });
}

/**
 * Limpia todos los errores de validación del formulario.
 */
export function clearFieldErrors() {
    document.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
    document.querySelectorAll('.field-error').forEach(el => el.remove());
}
