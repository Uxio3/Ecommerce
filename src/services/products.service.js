// Este fichero ejecuta consultas a la bd relacionadas con productos
const { pool } = require('../config/database');
// Devuelve un array de objetos con todas las columnas de la tabla
async function getAllProducts() {
    const [rows] = await pool.query('SELECT * FROM products');
    return rows;
}

module.exports = {
    getAllProducts,
};