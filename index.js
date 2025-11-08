// Cargar variables de entorno desde .env para usarlas con process.env
require('dotenv').config();

// Importar Express
const express = require('express');

// Importar CORS
const cors = require('cors');

// Importar mysql2
const mysql = require('mysql2/promise');

// Crear una instancia de la aplicación Express
const app = express();

// Configurar CORS para permitir peticiones desde cualquier origen
app.use(cors());

// Servir archivos estáticos desde la carpeta public
app.use(express.static('public'));

// Definir el puerto, 3000 por defecto
const PORT = process.env.PORT || 3000;

// Configuración de la base de datos desde .env
const dbConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Crear el pool de conexiones
const pool = mysql.createPool(dbConfig);

// Función para probar la conexión
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Conexión a MySQL establecida correctamente');
        connection.release();
    } catch (error) {
        console.error('❌ Error al conectar con MySQL:', error.message);
    }
}

// Probar la conexión al iniciar el servidor
testConnection();

// Ruta raíz
app.get('/', (req, res) => {
    res.send('Servidor funcionando correctamente');
});

// Ruta de prueba para obtener productos
app.get('/api/products', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM products');
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).json({ error: 'Error al obtener productos' });
    }
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});