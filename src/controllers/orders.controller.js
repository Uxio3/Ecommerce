// Controlador para manejar las peticiones HTTP relacionadas con pedidos
const { createOrder } = require('../services/orders.service');

/**
 * Controlador para POST /api/orders
 * Crea un nuevo pedido con los items enviados desde el frontend
 */
async function createOrderController(req, res) {
    try {
        // Obtener los items del body de la petición
        // El frontend enviará: { items: [{ productId: 1, quantity: 2 }, ...] }
        const { items } = req.body;
        
        // Llamar al servicio para crear el pedido
        const order = await createOrder(items);
        
        // Responder con éxito (201 = Created) y el pedido creado
        res.status(201).json({
            success: true,
            message: 'Pedido creado correctamente',
            order: order
        });
        
    } catch (error) {
        // Si hay un error, registrarlo en la consola
        console.error('Error al crear el pedido:', error);
        
        // Responder con error (400 = Bad Request) y el mensaje de error
        res.status(400).json({
            success: false,
            error: error.message || 'Error al crear el pedido'
        });
    }
}

module.exports = {
    createOrderController
};