// Middleware para validar datos de usuarios usando express-validator
const { body, validationResult } = require('express-validator');

/**
 * Reglas de validación para registrar un usuario
 */
const registerValidationRules = [
    // Validar nombre: obligatorio, no vacío, mínimo 3 caracteres
    body('name')
        .notEmpty()
        .withMessage('El nombre es obligatorio')
        .isLength({ min: 3 })
        .withMessage('El nombre debe tener al menos 3 caracteres')
        .trim(),

    // Validar email: obligatorio, formato de email válido
    body('email')
        .notEmpty()
        .withMessage('El email es obligatorio')
        .isEmail()
        .withMessage('El email debe tener un formato válido')
        .normalizeEmail(), // Convierte el email a minúsculas y elimina espacios

    // Validar contraseña: obligatoria, mínimo 6 caracteres
    body('password')
        .notEmpty()
        .withMessage('La contraseña es obligatoria')
        .isLength({ min: 6 })
        .withMessage('La contraseña debe tener al menos 6 caracteres'),
];

/**
 * Reglas de validación para hacer login
 */
const loginValidationRules = [
    // Validar email: obligatorio, formato de email válido
    body('email')
        .notEmpty()
        .withMessage('El email es obligatorio')
        .isEmail()
        .withMessage('El email debe tener un formato válido')
        .normalizeEmail(),

    // Validar contraseña: obligatoria
    body('password')
        .notEmpty()
        .withMessage('La contraseña es obligatoria'),
];

/**
 * Middleware que verifica si hay errores de validación
 * Si hay errores, responde con 400 (Bad Request) y los mensajes de error
 * Si no hay errores, continúa con el siguiente middleware (el controlador)
 */
const validate = (req, res, next) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            error: 'Error de validación',
            details: errors.array() // Array con todos los errores encontrados
        });
    }
    
    // Si no hay errores, continuar con el siguiente middleware
    next();
};

module.exports = {
    registerValidationRules,
    loginValidationRules,
    validate
};