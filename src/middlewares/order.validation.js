// Middleware para validar datos de pedidos usando express-validator
const { body, validationResult } = require('express-validator');

/**
 * Reglas de validación para crear un pedido
 * El frontend debe enviar: { items: [{ productId: 1, quantity: 2 }, ...] }
 */
const orderValidationRules = [
    // Validar que 'items' existe y es un array con al menos 1 elemento
    body('items')
        .isArray({ min: 1 })
        .withMessage('items debe ser un array con al menos 1 producto'),
    
    // Validar cada item del array
    body('items.*.productId')
        .isInt({ min: 1 })
        .withMessage('productId debe ser un número entero mayor que 0'),
    
    body('items.*.quantity')
        .isInt({ min: 1 })
        .withMessage('quantity debe ser un número entero mayor que 0'),
];

/**
 * Middleware que verifica si hay errores de validación
 * Si hay errores, responde con 400 (Bad Request) y los mensajes de error
 * Si no hay errores, continúa con el siguiente middleware (el controlador)
 */
const validateOrder = (req, res, next) => {
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
    orderValidationRules,
    validateOrder
};