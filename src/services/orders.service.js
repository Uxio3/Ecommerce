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

module.exports = {
    createOrder,
    getUserOrders
};