require('dotenv').config();

const express = require('express');
const cors = require('cors');

const productsRouter = require('./routes/products.routes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.static('public'));

// Rutas
app.get('/', (req, res) => {
    res.send('Servidor funcionando correctamente');
});

app.use('/api/products', productsRouter);

module.exports = app;