// Importar Express
const express = require('express');

// Crear una instancia de la aplicación Express
const app = express();

// Definir el puerto, 3000 por defecto
const PORT = process.env.PORT || 3000;

// Ruta raíz
app.get('/', (req, res) => {
    res.send('Servidor funcionando correctamente');
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});