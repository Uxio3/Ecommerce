// Definición de rutas relacionadas con /api/products
const express = require('express');

const {
    getProducts,
    getProduct,
    createProductController,
    updateProductController,
    deleteProductController,
    getAllProductsIncludingDeletedController,
    restoreProductController,
} = require('../controllers/products.controller');

const { productValidationRules, validate } = require('../middlewares/validation.middleware');
const { requireAuth, requireAdmin } = require('../middlewares/auth.middleware');

const router = express.Router();

// Rutas públicas (no requieren autenticación)
router.get('/', getProducts);
router.get('/:id', getProduct);

// Rutas que requieren autenticación y ser admin
router.post('/', requireAuth, requireAdmin, productValidationRules, validate, createProductController);
router.put('/:id', requireAuth, requireAdmin, productValidationRules, validate, updateProductController);
router.delete('/:id', requireAuth, requireAdmin, deleteProductController);
router.get('/admin/all', requireAuth, requireAdmin, getAllProductsIncludingDeletedController);
router.put('/:id/restore', requireAuth, requireAdmin, restoreProductController);

module.exports = router;