const mysql = require('mysql2/promise');
// Parámetros de conexión leídos desde variables de entorno (.env)
const dbConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
};
// Pool de conexiones para reutilizarlas y mejorar rendimiento
const pool = mysql.createPool(dbConfig);
// Prueba que la conexión a MySQL funciona
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Conexión a MySQL establecida correctamente');
        connection.release();
    } catch (error) {
        console.error('❌ Error al conectar con MySQL:', error.message);
        throw error;
    }
}
// Se exporta pool y testConnection
module.exports = {
    pool,
    testConnection,
};