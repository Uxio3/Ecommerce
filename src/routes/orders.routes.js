// Definición de rutas relacionadas con /api/orders
const express = require('express');
const { createOrderController } = require('../controllers/orders.controller');
const { orderValidationRules, validateOrder } = require('../middlewares/order.validation');

// Crear un router de Express
const router = express.Router();

// POST /api/orders → crea un nuevo pedido
// Primero se ejecutan las validaciones (orderValidationRules, validateOrder)
// Si las validaciones pasan, se ejecuta el controlador (createOrderController)
router.post('/', orderValidationRules, validateOrder, createOrderController);

// Exportar el router para usarlo en app.js
module.exports = router;