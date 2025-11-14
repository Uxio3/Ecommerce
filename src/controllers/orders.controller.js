// Controlador para manejar las peticiones HTTP relacionadas con pedidos
const { createOrder, getUserOrders, getAllOrders, updateOrderStatus } = require('../services/orders.service');
/**
 * Controlador para POST /api/orders
 * Crea un nuevo pedido con los items enviados desde el frontend
 */
async function createOrderController(req, res) {
    try {
        // Obtener los items y el userId del body de la petición
        // El frontend enviará: { items: [...], userId: 1 } o { items: [...] } si no hay usuario
        const { items, userId } = req.body;
        
        // Validar que items existe y es un array
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Los items del pedido son obligatorios y deben ser un array no vacío'
            });
        }
        
        // Llamar al servicio para crear el pedido (userId puede ser null)
        const order = await createOrder(items, userId || null);
        
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

/**
 * Controlador para GET /api/orders/user/:userId
 * Obtiene todos los pedidos de un usuario específico
 */
async function getUserOrdersController(req, res) {
    try {
        const userId = parseInt(req.params.userId);
        
        // Verificar que el usuario está intentando ver sus propios pedidos
        if (req.user.id !== userId) {
            return res.status(403).json({
                success: false,
                error: 'No tienes permiso para ver estos pedidos'
            });
        }
        
        if (isNaN(userId) || userId <= 0) {
            return res.status(400).json({
                success: false,
                error: 'ID de usuario inválido'
            });
        }
        
        const orders = await getUserOrders(userId);
        res.json({ success: true, orders: orders });
    } catch (error) {
        console.error('Error al obtener pedidos del usuario:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener los pedidos del usuario'
        });
    }
}

/**
 * Controlador para GET /api/orders/admin/all
 * Obtiene todos los pedidos (solo para administración)
 */
async function getAllOrdersController(req, res) {
    try {
        // Llamar al servicio para obtener todos los pedidos
        const orders = await getAllOrders();
        
        // Responder con éxito y los pedidos
        res.json({
            success: true,
            orders: orders
        });
        
    } catch (error) {
        // Si hay un error, registrarlo en la consola
        console.error('Error al obtener todos los pedidos:', error);
        
        // Responder con error (500 = Internal Server Error)
        res.status(500).json({
            success: false,
            error: 'Error al obtener los pedidos'
        });
    }
}

/**
 * Controlador para PUT /api/orders/:id/status
 * Actualiza el estado de un pedido
 */
async function updateOrderStatusController(req, res) {
    try {
        // Obtener el ID del pedido y el nuevo estado de los parámetros
        const orderId = parseInt(req.params.id);
        const { status } = req.body;
        
        // Validar que orderId sea un número válido
        if (isNaN(orderId)) {
            return res.status(400).json({
                success: false,
                error: 'ID de pedido inválido'
            });
        }
        
        // Validar que status esté presente
        if (!status) {
            return res.status(400).json({
                success: false,
                error: 'El estado es obligatorio'
            });
        }
        
        // Llamar al servicio para actualizar el estado
        const order = await updateOrderStatus(orderId, status);
        
        // Responder con éxito y el pedido actualizado
        res.json({
            success: true,
            message: 'Estado del pedido actualizado correctamente',
            order: order
        });
        
    } catch (error) {
        // Si hay un error, registrarlo en la consola
        console.error('Error al actualizar el estado del pedido:', error);
        
        // Responder con error
        res.status(400).json({
            success: false,
            error: error.message || 'Error al actualizar el estado del pedido'
        });
    }
}

module.exports = {
    createOrderController,
    getUserOrdersController,
    getAllOrdersController,
    updateOrderStatusController
};