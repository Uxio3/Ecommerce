// API base URL
const API_URL = 'http://localhost:3000/api';

/**
 * Maneja el registro de un nuevo usuario
 */
async function handleRegister(event) {
    event.preventDefault();
    
    // Obtener los datos del formulario
    const formData = new FormData(event.target);
    const userData = {
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password')
    };
    
    // Obtener elementos del DOM
    const errorDiv = document.getElementById('register-error');
    const successDiv = document.getElementById('register-success');
    const submitButton = event.target.querySelector('button[type="submit"]');
    
    // Ocultar mensajes anteriores
    errorDiv.style.display = 'none';
    successDiv.style.display = 'none';
    
    // Deshabilitar el botón mientras se procesa
    submitButton.disabled = true;
    submitButton.textContent = 'Registrando...';
    
    try {
        // Hacer petición POST a /api/users/register
        const response = await fetch(`${API_URL}/users/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            // Registro exitoso
            successDiv.textContent = `¡Registro exitoso! Bienvenido, ${data.user.name}`;
            successDiv.style.display = 'block';
            
            // Guardar el usuario en localStorage
            localStorage.setItem('user', JSON.stringify(data.user));
            
            // Redirigir a la página principal después de 2 segundos
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        } else {
            // Error en el registro
            const errorMessage = data.error || data.details?.[0]?.msg || 'Error al registrar el usuario';
            errorDiv.textContent = errorMessage;
            errorDiv.style.display = 'block';
            
            // Rehabilitar el botón
            submitButton.disabled = false;
            submitButton.textContent = 'Registrarse';
        }
    } catch (error) {
        // Error de red o del servidor
        console.error('Error al registrar:', error);
        errorDiv.textContent = 'Error de conexión. Por favor intenta de nuevo.';
        errorDiv.style.display = 'block';
        
        // Rehabilitar el botón
        submitButton.disabled = false;
        submitButton.textContent = 'Registrarse';
    }
}

/**
 * Maneja el login de un usuario
 */
async function handleLogin(event) {
    event.preventDefault();
    
    // Obtener los datos del formulario
    const formData = new FormData(event.target);
    const userData = {
        email: formData.get('email'),
        password: formData.get('password')
    };
    
    // Obtener elementos del DOM
    const errorDiv = document.getElementById('login-error');
    const submitButton = event.target.querySelector('button[type="submit"]');
    
    // Ocultar mensajes anteriores
    errorDiv.style.display = 'none';
    
    // Deshabilitar el botón mientras se procesa
    submitButton.disabled = true;
    submitButton.textContent = 'Iniciando sesión...';
    
    try {
        // Hacer petición POST a /api/users/login
        const response = await fetch(`${API_URL}/users/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            // Login exitoso
            // Guardar el usuario en localStorage
            localStorage.setItem('user', JSON.stringify(data.user));
            
            // Redirigir a la página principal
            window.location.href = 'index.html';
        } else {
            // Error en el login
            const errorMessage = data.error || data.details?.[0]?.msg || 'Email o contraseña incorrectos';
            errorDiv.textContent = errorMessage;
            errorDiv.style.display = 'block';
            
            // Rehabilitar el botón
            submitButton.disabled = false;
            submitButton.textContent = 'Iniciar Sesión';
        }
    } catch (error) {
        // Error de red o del servidor
        console.error('Error al hacer login:', error);
        errorDiv.textContent = 'Error de conexión. Por favor intenta de nuevo.';
        errorDiv.style.display = 'block';
        
        // Rehabilitar el botón
        submitButton.disabled = false;
        submitButton.textContent = 'Iniciar Sesión';
    }
}

// Agregar event listeners cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    // Si estamos en la página de registro
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    // Si estamos en la página de login
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
});