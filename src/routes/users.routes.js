// Definición de rutas relacionadas con /api/users
const express = require('express');

const {
    registerController,
    loginController
} = require('../controllers/users.controller');

const {
    registerValidationRules,
    loginValidationRules,
    validate
} = require('../middlewares/user.validation');

const router = express.Router();

// POST /api/users/register → registra un nuevo usuario
router.post('/register', registerValidationRules, validate, registerController);

// POST /api/users/login → inicia sesión de un usuario
router.post('/login', loginValidationRules, validate, loginController);

module.exports = router;