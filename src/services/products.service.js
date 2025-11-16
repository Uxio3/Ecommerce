// Este fichero ejecuta consultas a la bd relacionadas con productos
const { pool } = require('../config/database');

// Devuelve un array de objetos con todas las columnas de la tabla (solo activos)
async function getAllProducts() {
    const [rows] = await pool.query('SELECT * FROM products WHERE deleted = FALSE OR deleted IS NULL');
    return rows;
}

// Obtiene productos con paginación
async function getProductsPaginated(page = 1, limit = 12) {
    const offset = (page - 1) * limit;
    
    // Obtener productos paginados
    const [rows] = await pool.query(
        'SELECT * FROM products WHERE deleted = FALSE OR deleted IS NULL ORDER BY id DESC LIMIT ? OFFSET ?',
        [limit, offset]
    );
    
    // Obtener el total de productos
    const [countResult] = await pool.query(
        'SELECT COUNT(*) as total FROM products WHERE deleted = FALSE OR deleted IS NULL'
    );
    
    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);
    
    return {
        products: rows,
        pagination: {
            page: page,
            limit: limit,
            total: total,
            totalPages: totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1
        }
    };
}

// Obtiene todos los productos con paginación (incluyendo eliminados) - para admin
async function getAllProductsIncludingDeletedPaginated(page = 1, limit = 12) {
    const offset = (page - 1) * limit;
    
    // Obtener productos paginados
    const [rows] = await pool.query(
        'SELECT * FROM products ORDER BY deleted ASC, id DESC LIMIT ? OFFSET ?',
        [limit, offset]
    );
    
    // Obtener el total de productos
    const [countResult] = await pool.query('SELECT COUNT(*) as total FROM products');
    
    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);
    
    return {
        products: rows,
        pagination: {
            page: page,
            limit: limit,
            total: total,
            totalPages: totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1
        }
    };
}

// Obtiene un producto específico por su ID
async function getProductById(id) {
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    return rows.length > 0 ? rows[0] : null;
}

// Crea un nuevo producto en la base de datos
async function createProduct(productData) {
    const { name, description, price, stock, img_url } = productData;
    const [result] = await pool.query(
        'INSERT INTO products (name, description, price, stock, img_url) VALUES (?, ?, ?, ?, ?)',
        [name, description, price, stock, img_url]
    );
    // Después de insertar, obtenemos el producto completo con su ID
    return await getProductById(result.insertId);
}

// Actualiza un producto por su ID
async function updateProduct(id, productData) {
    const { name, description, price, stock, img_url } = productData;
    const [result] = await pool.query(
        'UPDATE products SET name = ?, description = ?, price = ?, stock = ?, img_url = ? WHERE id = ?',
        [name, description, price, stock, img_url, id]
    );
    // Si se actualizó alguna fila, se devuelve el producto actual actualizado
    if (result.affectedRows > 0) {
        return await getProductById(id);
    }
    return null;
}

// Elimina un producto por su ID (soft delete)
async function deleteProduct(id) {
    const [result] = await pool.query(
        'UPDATE products SET deleted = TRUE, deleted_at = CURRENT_TIMESTAMP WHERE id = ?',
        [id]
    );
    return result.affectedRows > 0; // Devuelve un booleano
}

// Obtiene todos los productos (incluyendo eliminados) - para admin
async function getAllProductsIncludingDeleted() {
    const [rows] = await pool.query('SELECT * FROM products ORDER BY deleted ASC, id DESC');
    return rows;
}

// Reactiva un producto eliminado
async function restoreProduct(id) {
    const [result] = await pool.query(
        'UPDATE products SET deleted = FALSE, deleted_at = NULL WHERE id = ?',
        [id]
    );
    return result.affectedRows > 0;
}

module.exports = {
    getAllProducts,
    getProductsPaginated,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getAllProductsIncludingDeleted,
    getAllProductsIncludingDeletedPaginated,
    restoreProduct,
};