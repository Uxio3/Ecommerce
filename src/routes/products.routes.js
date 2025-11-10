const express = require('express');
const { getProducts } = require('../controllers/products.controller');

const router = express.Router();
// Asocia la ruta GET / a la función getProducts del controlador
router.get('/', getProducts);

module.exports = router;