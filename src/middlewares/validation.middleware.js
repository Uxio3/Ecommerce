// Middleware para validar datos de productos usando express-validator
const { body, validationResult } = require('express-validator');

/**
 * Reglas de validación para crear/actualizar un producto
 */
const productValidationRules = [
    // Validar nombre: obligatorio, no vacío, mínimo 3 caracteres
    body('name')
        .notEmpty()
        .withMessage('El nombre es obligatorio')
        .isLength({ min: 3 })
        .withMessage('El nombre debe tener al menos 3 caracteres')
        .trim(), // Elimina espacios al inicio y final

    // Validar descripción: opcional, pero si existe, mínimo 10 caracteres
    body('description')
        .optional()
        .isLength({ min: 10 })
        .withMessage('La descripción debe tener al menos 10 caracteres')
        .trim(),

    // Validar precio: obligatorio, número positivo mayor que 0
    body('price')
        .notEmpty()
        .withMessage('El precio es obligatorio')
        .isFloat({ min: 0.01 })
        .withMessage('El precio debe ser un número positivo mayor que 0'),

    // Validar stock: obligatorio, número entero mayor o igual a 0
    body('stock')
        .notEmpty()
        .withMessage('El stock es obligatorio')
        .isInt({ min: 0 })
        .withMessage('El stock debe ser un número entero mayor o igual a 0'),

    // Validar img_url: opcional, pero si existe, debe ser una URL válida o una ruta relativa
body('img_url')
    .optional()
    .custom((value) => {
        // Si es una URL completa (http:// o https://), validarla como URL
        if (value.startsWith('http://') || value.startsWith('https://')) {
            return require('validator').isURL(value);
        }
        // Si es una ruta relativa, solo verificar que no esté vacía
        return value && value.trim().length > 0;
    })
    .withMessage('La URL de la imagen debe ser una URL válida o una ruta relativa'),
];

/**
 * Middleware que verifica si hay errores de validación
 * Si hay errores, responde con 400 (Bad Request) y los mensajes de error
 * Si no hay errores, continúa con el siguiente middleware
 */
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: 'Error de validación',
            details: errors.array(), // Array con todos los errores encontrados
        });
    }
    next(); // Si no hay errores, continúa con el siguiente middleware
};

module.exports = {
    productValidationRules,
    validate,
};