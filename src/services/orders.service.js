// Servicio para manejar operaciones relacionadas con pedidos (orders)
const { pool } = require('../config/database');

/**
 * Crea un nuevo pedido con sus items
 * @param {Array} items - Array de objetos con { productId, quantity }
 * @returns {Object} - El pedido creado con su ID y total
 */
async function createOrder(items) {
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
        
        // Paso 2: Insertar el pedido en la tabla orders
        const [orderResult] = await connection.query(
            'INSERT INTO orders (total, status) VALUES (?, ?)',
            [total, 'pending']
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

module.exports = {
    createOrder
};