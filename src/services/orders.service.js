// Servicio para manejar operaciones relacionadas con pedidos (orders)
const { pool } = require('../config/database');

/**
 * Crea un nuevo pedido con sus items
 * @param {Array} items - Array de objetos con { productId, quantity }
 * @param {number|null} userId - ID del usuario (opcional, puede ser null)
 * @returns {Object} - El pedido creado con su ID y total
 */
async function createOrder(items, userId = null) {
    // Obtener una conexión del pool
    const connection = await pool.getConnection();
    
    try {
        // Iniciar una transacción (todo o nada)
        await connection.beginTransaction();
        
        // Paso 1: Obtener los precios actuales de los productos y verificar stock
        let total = 0;
        const orderItems = [];
        
        for (const item of items) {
            // Consultar el producto en la base de datos
            const [productRows] = await connection.query(
                'SELECT id, price, stock FROM products WHERE id = ?',
                [item.productId]
            );
            
            // Si el producto no existe, lanzar error
            if (productRows.length === 0) {
                throw new Error(`Producto con ID ${item.productId} no encontrado`);
            }
            
            const product = productRows[0];
            
            // Verificar que hay suficiente stock
            if (product.stock < item.quantity) {
                throw new Error(`Stock insuficiente para el producto ${product.id}. Stock disponible: ${product.stock}`);
            }
            
            // Calcular el subtotal de este item
            const subtotal = parseFloat(product.price) * item.quantity;
            total += subtotal;
            
            // Guardar la información del item para insertarlo después
            orderItems.push({
                product_id: product.id,
                quantity: item.quantity,
                unit_price: parseFloat(product.price)
            });
        }
        
        // Paso 2: Insertar el pedido en la tabla orders (ahora incluyendo user_id)
        const [orderResult] = await connection.query(
            'INSERT INTO orders (total, status, user_id) VALUES (?, ?, ?)',
            [total, 'pending', userId]
        );
        
        const orderId = orderResult.insertId; // ID del pedido recién creado
        
        // Paso 3: Insertar cada item del pedido en order_items
        for (const orderItem of orderItems) {
            await connection.query(
                'INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)',
                [orderId, orderItem.product_id, orderItem.quantity, orderItem.unit_price]
            );
            
            // Paso 4: Actualizar el stock del producto (reducir la cantidad vendida)
            await connection.query(
                'UPDATE products SET stock = stock - ? WHERE id = ?',
                [orderItem.quantity, orderItem.product_id]
            );
        }
        
        // Si todo salió bien, confirmar la transacción
        await connection.commit();
        
        // Devolver el pedido creado
        return {
            id: orderId,
            total: total,
            status: 'pending',
            user_id: userId,
            items: orderItems
        };
        
    } catch (error) {
        // Si algo falló, deshacer todos los cambios (rollback)
        await connection.rollback();
        throw error; // Re-lanzar el error para que el controlador lo maneje
    } finally {
        // Siempre liberar la conexión, incluso si hubo un error
        connection.release();
    }
}

/**
 * Obtiene todos los pedidos de un usuario específico
 * @param {number} userId - ID del usuario
 * @returns {Array} - Array de pedidos con sus items
 */
async function getUserOrders(userId) {
    try {
        // Obtener todos los pedidos del usuario
        const [orders] = await pool.query(
            `SELECT 
                id, 
                total, 
                status, 
                created_at, 
                updated_at 
            FROM orders 
            WHERE user_id = ? 
            ORDER BY created_at DESC`,
            [userId]
        );
        
        // Para cada pedido, obtener sus items
        for (const order of orders) {
            const [items] = await pool.query(
                `SELECT 
                    oi.id,
                    oi.quantity,
                    oi.unit_price,
                    p.id as product_id,
                    p.name as product_name,
                    p.img_url as product_image
                FROM order_items oi
                JOIN products p ON oi.product_id = p.id
                WHERE oi.order_id = ?
                ORDER BY oi.id`,
                [order.id]
            );
            
            // Agregar los items al pedido
            order.items = items;
        }
        
        return orders;
        
    } catch (error) {
        console.error('Error al obtener pedidos del usuario:', error);
        throw error;
    }
}

/**
 * Obtiene todos los pedidos (para administración)
 * @returns {Array} - Array de todos los pedidos con sus items y usuarios
 */
async function getAllOrders() {
    try {
        // Obtener todos los pedidos con información del usuario
        const [orders] = await pool.query(
            `SELECT 
                o.id, 
                o.total, 
                o.status, 
                o.created_at, 
                o.updated_at,
                o.user_id,
                u.name as user_name,
                u.email as user_email
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            ORDER BY o.created_at DESC`
        );
        
        // Para cada pedido, obtener sus items
        for (const order of orders) {
            const [items] = await pool.query(
                `SELECT 
                    oi.id,
                    oi.quantity,
                    oi.unit_price,
                    p.id as product_id,
                    p.name as product_name,
                    p.img_url as product_image
                FROM order_items oi
                JOIN products p ON oi.product_id = p.id
                WHERE oi.order_id = ?
                ORDER BY oi.id`,
                [order.id]
            );
            
            // Agregar los items al pedido
            order.items = items;
        }
        
        return orders;
        
    } catch (error) {
        console.error('Error al obtener todos los pedidos:', error);
        throw error;
    }
}

/**
 * Actualiza el estado de un pedido
 * @param {number} orderId - ID del pedido
 * @param {string} status - Nuevo estado (pending, completed, cancelled)
 * @returns {Object} - El pedido actualizado
 */
async function updateOrderStatus(orderId, status) {
    try {
        // Validar que el estado sea válido
        const validStatuses = ['pending', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            throw new Error(`Estado inválido. Debe ser uno de: ${validStatuses.join(', ')}`);
        }
        
        // Actualizar el estado del pedido
        const [result] = await pool.query(
            'UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [status, orderId]
        );
        
        // Verificar que el pedido existe
        if (result.affectedRows === 0) {
            throw new Error(`Pedido con ID ${orderId} no encontrado`);
        }
        
        // Obtener el pedido actualizado
        const [orders] = await pool.query(
            'SELECT * FROM orders WHERE id = ?',
            [orderId]
        );
        
        return orders[0];
        
    } catch (error) {
        console.error('Error al actualizar el estado del pedido:', error);
        throw error;
    }
}

module.exports = {
    createOrder,
    getUserOrders,
    getAllOrders,
    updateOrderStatus
};