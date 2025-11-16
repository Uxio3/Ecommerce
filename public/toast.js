// Sistema de notificaciones Toast
class Toast {
    constructor() {
        this.container = null;
        this.init();
    }

    init() {
        // Crear contenedor de toasts si no existe
        if (!document.getElementById('toast-container')) {
            const container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'toast-container';
            document.body.appendChild(container);
            this.container = container;
        } else {
            this.container = document.getElementById('toast-container');
        }
    }

    /**
     * Muestra una notificación toast
     * @param {string} message - Mensaje a mostrar
     * @param {string} type - Tipo: 'success', 'error', 'info', 'warning'
     * @param {number} duration - Duración en milisegundos (default: 3000)
     */
    show(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        // Icono según el tipo
        const icons = {
            success: '✅',
            error: '❌',
            info: 'ℹ️',
            warning: '⚠️'
        };
        
        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-icon">${icons[type] || icons.info}</span>
                <span class="toast-message">${message}</span>
                <button class="toast-close">&times;</button>
            </div>
        `;
        
        // Agregar al contenedor
        this.container.appendChild(toast);
        
        // Animar entrada
        setTimeout(() => {
            toast.classList.add('toast-show');
        }, 10);
        
        // Botón de cerrar
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => {
            this.remove(toast);
        });
        
        // Auto-remover después de la duración
        if (duration > 0) {
            setTimeout(() => {
                this.remove(toast);
            }, duration);
        }
        
        return toast;
    }

    /**
     * Remueve un toast con animación
     */
    remove(toast) {
        toast.classList.remove('toast-show');
        toast.classList.add('toast-hide');
        
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }

    // Métodos de conveniencia
    success(message, duration = 3000) {
        return this.show(message, 'success', duration);
    }

    error(message, duration = 4000) {
        return this.show(message, 'error', duration);
    }

    info(message, duration = 3000) {
        return this.show(message, 'info', duration);
    }

    warning(message, duration = 3000) {
        return this.show(message, 'warning', duration);
    }
}

// Crear instancia global
const toast = new Toast();