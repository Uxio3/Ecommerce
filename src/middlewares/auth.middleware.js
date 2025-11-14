// Middleware para autenticación y autorización
const { getUserById } = require('../services/users.service');

/**
 * Middleware para verificar que el usuario está autenticado
 * Espera que el frontend envíe el userId en el header 'x-user-id'
 */
const requireAuth = async (req, res, next) => {
    try {
        const userId = req.headers['x-user-id'];
        
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'No autorizado. Debes iniciar sesión.'
            });
        }
        
        // Verificar que el usuario existe
        const user = await getUserById(parseInt(userId));
        
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Usuario no encontrado. Sesión inválida.'
            });
        }
        
        // Agregar el usuario al request para usarlo en los controladores
        req.user = user;
        next();
        
    } catch (error) {
        console.error('Error en requireAuth:', error);
        res.status(500).json({
            success: false,
            error: 'Error al verificar autenticación'
        });
    }
};

/**
 * Middleware para verificar que el usuario es administrador
 * Debe usarse después de requireAuth
 */
const requireAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: 'No autorizado. Debes iniciar sesión.'
        });
    }
    
    if (!req.user.is_admin || req.user.is_admin === 0) {
        return res.status(403).json({
            success: false,
            error: 'Acceso denegado. Se requieren permisos de administrador.'
        });
    }
    
    next();
};

module.exports = {
    requireAuth,
    requireAdmin
};