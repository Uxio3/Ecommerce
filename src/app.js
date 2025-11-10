// Fichero para configurar Express (middlewares y rutas)
require('dotenv').config();

const express = require('express');
const cors = require('cors');

const productsRouter = require('./routes/products.routes');

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.static('public'));

// Rutas
app.get('/', (req, res) => {
    res.send('Servidor funcionando correctamente');
});
// Rutas de productos bajo /api/products
app.use('/api/products', productsRouter);

module.exports = app;