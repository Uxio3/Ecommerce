// Definición de rutas relacionadas con /api/products
const express = require('express');

const {
    getProducts,
    getProduct,
    createProductController,
    updateProductController,
    deleteProductController,
} = require('../controllers/products.controller');

const { productValidationRules, validate } = require('../middlewares/validation.middleware');

const router = express.Router();

// Asocia la ruta GET / a la función getProducts del controlador
router.get('/', getProducts);

// GET /api/products/:id → obtiene un producto específico por ID
router.get('/:id', getProduct);

// POST /api/products → crea un nuevo producto
router.post('/', productValidationRules, validate, createProductController);

// PUT /api/products/:id → actualiza un producto existente
router.put('/:id', productValidationRules, validate, updateProductController);

// DELETE /api/products/:id → elimina un producto
router.delete('/:id', deleteProductController);

module.exports = router;