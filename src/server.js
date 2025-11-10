// Punto de entrada que arranca la aplicación
const app = require('./app');
const { testConnection } = require('./config/database');

const PORT = process.env.PORT || 3000;
// Arranca el servidor:
// Comprueba la conexión a la bd
// Si es corrcta, pone Express a escuchar en el puerto indicado
async function startServer() {
    try {
        await testConnection(); // Verifica que MySQL responde
        app.listen(PORT, () => {
            console.log(`Servidor corriendo en http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('No se pudo iniciar el servidor por un error en la base de datos.');
        process.exit(1); // Termina el proceso con código de error
    }
}

startServer();