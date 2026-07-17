/**
 * Vista Auth — Login y Registro con selector de rol.
 */

import * as authService from '../services/auth.js';
import { navigate } from '../router.js';
import { showToast } from '../utils/helpers.js';
import { validateEmail, validatePassword, validateRequired, validateForm, showFieldErrors, clearFieldErrors } from '../utils/validators.js';

// ---------- LOGIN ----------

export const loginView = {
    async render() {
        return `
            <div class="auth-page">
                <div class="auth-card animate-slide-up">
                    <div class="text-center mb-4">
                         <img src="assets/logoDormify.svg" alt="Dormify Logo" style="height: 95px; width: auto;">
                    </div>
                    <h2 class="auth-title">Bienvenido de vuelta</h2>
                    <p class="auth-subtitle">Inicia sesión en tu cuenta de Dormify</p>

                    <form id="login-form">
                        <div class="mb-3">
                            <label for="email" class="form-label">Correo electrónico</label>
                            <input type="email" class="form-control" id="email" 
                                   placeholder="tu@correo.com" required>
                        </div>
                        <div class="mb-3">
                            <label for="password" class="form-label">Contraseña</label>
                            <input type="password" class="form-control" id="password" 
                                   placeholder="Tu contraseña" required>
                        </div>
                        <button type="submit" class="btn btn-primary w-100 py-2" id="btn-login">
                            <i class="bi bi-box-arrow-in-right"></i> Iniciar Sesión
                        </button>
                    </form>

                    <p class="auth-divider">¿No tienes cuenta?</p>
                    <a href="#/registro" class="btn btn-outline-light w-100">
                        <i class="bi bi-person-plus"></i> Crear una cuenta
                    </a>
                </div>
            </div>
        `;
    },

    async afterRender() {
        const form = document.getElementById('login-form');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearFieldErrors();

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            // Validar
            const { isValid, errors } = validateForm({
                email: (v) => validateEmail(v),
                password: (v) => validatePassword(v)
            }, { email, password });

            if (!isValid) {
                showFieldErrors(errors);
                return;
            }

            const btn = document.getElementById('btn-login');
            btn.disabled = true;
            btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Ingresando...';

            try {
                await authService.login(email, password);
                showToast('¡Bienvenido de vuelta!', 'success');
                navigate('/');
            } catch (error) {
                showToast(error.message || 'Error al iniciar sesión', 'error');
            } finally {
                btn.disabled = false;
                btn.innerHTML = '<i class="bi bi-box-arrow-in-right"></i> Iniciar Sesión';
            }
        });
    }
};


// ---------- REGISTRO ----------

export const registerView = {
    async render() {
        return `
            <div class="auth-page">
                <div class="auth-card animate-slide-up" style="max-width: 520px;">
                   <div class="text-center mb-4">
                        <img src="assets/logoDormify.svg" alt="Dormify Logo" style="height: 95px; width: auto;">
                    </div>
                    <h2 class="auth-title">Crea tu cuenta</h2>
                    <p class="auth-subtitle">Únete a la comunidad estudiantil de Dormify</p>

                    <form id="register-form">
                        <!-- Selector de Rol -->
                        <label class="form-label">¿Cómo usarás Dormify?</label>
                        <div class="role-selector mb-3">
                            <div class="role-option active" data-role="estudiante">
                                <i class="bi bi-mortarboard"></i>
                                <span>Estudiante</span>
                            </div>
                            <div class="role-option" data-role="propietario">
                                <i class="bi bi-building"></i>
                                <span>Propietario</span>
                            </div>
                            <div class="role-option" data-role="proveedor">
                                <i class="bi bi-tools"></i>
                                <span>Proveedor</span>
                            </div>
                        </div>
                        <input type="hidden" id="role" value="estudiante">

                        <div class="mb-3">
                            <label for="full_name" class="form-label">Nombre completo</label>
                            <input type="text" class="form-control" id="full_name" 
                                   placeholder="Tu nombre completo" required>
                        </div>
                        <div class="mb-3">
                            <label for="email" class="form-label">Correo electrónico</label>
                            <input type="email" class="form-control" id="email" 
                                   placeholder="tu@correo.com" required>
                        </div>
                        <div class="mb-3">
                            <label for="phone" class="form-label">Teléfono <small class="text-muted">(opcional)</small></label>
                            <input type="tel" class="form-control" id="phone" 
                                   placeholder="+57 300 000 0000">
                        </div>
                        <div class="mb-3">
                            <label for="password" class="form-label">Contraseña</label>
                            <input type="password" class="form-control" id="password" 
                                   placeholder="Mínimo 6 caracteres" required>
                        </div>
                        <div class="mb-4">
                            <label for="password_confirm" class="form-label">Confirmar contraseña</label>
                            <input type="password" class="form-control" id="password_confirm" 
                                   placeholder="Repite tu contraseña" required>
                        </div>

                        <button type="submit" class="btn btn-primary w-100 py-2" id="btn-register">
                            <i class="bi bi-person-plus"></i> Crear Cuenta
                        </button>
                    </form>

                    <p class="auth-divider">¿Ya tienes cuenta?</p>
                    <a href="#/login" class="btn btn-outline-light w-100">
                        <i class="bi bi-box-arrow-in-right"></i> Iniciar Sesión
                    </a>
                </div>
            </div>
        `;
    },

    async afterRender() {
        // Selector de rol
        document.querySelectorAll('.role-option').forEach(option => {
            option.addEventListener('click', () => {
                document.querySelectorAll('.role-option').forEach(o => o.classList.remove('active'));
                option.classList.add('active');
                document.getElementById('role').value = option.dataset.role;
            });
        });

        // Submit del formulario
        const form = document.getElementById('register-form');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearFieldErrors();

            const full_name = document.getElementById('full_name').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            const password = document.getElementById('password').value;
            const password_confirm = document.getElementById('password_confirm').value;
            const role = document.getElementById('role').value;

            // Validar
            const { isValid, errors } = validateForm({
                full_name: (v) => validateRequired(v, 'El nombre', 2),
                email: (v) => validateEmail(v),
                password: (v) => validatePassword(v),
                password_confirm: (v) => {
                    if (!v) return 'Confirma tu contraseña';
                    if (v !== password) return 'Las contraseñas no coinciden';
                    return null;
                }
            }, { full_name, email, password, password_confirm });

            if (!isValid) {
                showFieldErrors(errors);
                return;
            }

            const btn = document.getElementById('btn-register');
            btn.disabled = true;
            btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Creando cuenta...';

            try {
                await authService.register({
                    email,
                    password,
                    full_name,
                    phone: phone || null,
                    role
                });
                showToast('¡Cuenta creada exitosamente! Bienvenido a Dormify.', 'success');
                navigate('/');
            } catch (error) {
                showToast(error.message || 'Error al crear la cuenta', 'error');
            } finally {
                btn.disabled = false;
                btn.innerHTML = '<i class="bi bi-person-plus"></i> Crear Cuenta';
            }
        });
    }
};
