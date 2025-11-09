const { pool } = require('../config/database');

async function getAllProducts() {
    const [rows] = await pool.query('SELECT * FROM products');
    return rows;
}

module.exports = {
    getAllProducts,
};