// Definición de rutas relacionadas con /api/orders
const express = require('express');
const { createOrderController, getUserOrdersController, getAllOrdersController, updateOrderStatusController } = require('../controllers/orders.controller');
const { orderValidationRules, validateOrder } = require('../middlewares/order.validation');
const { requireAuth, requireAdmin } = require('../middlewares/auth.middleware');

// Crear un router de Express
const router = express.Router();

// POST /api/orders → crea un nuevo pedido (público, pero puede incluir userId)
router.post('/', orderValidationRules, validateOrder, createOrderController);

// GET /api/orders/user/:userId → obtiene todos los pedidos de un usuario (requiere autenticación)
router.get('/user/:userId', requireAuth, getUserOrdersController);

// GET /api/orders/admin/all → obtiene todos los pedidos (requiere admin)
router.get('/admin/all', requireAuth, requireAdmin, getAllOrdersController);

// PUT /api/orders/:id/status → actualiza el estado de un pedido (requiere admin)
router.put('/:id/status', requireAuth, requireAdmin, updateOrderStatusController);

// Exportar el router para usarlo en app.js
module.exports = router;