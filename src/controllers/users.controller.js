// Controlador para manejar las peticiones HTTP relacionadas con usuarios
const { createUser, getUserByEmail, verifyPassword } = require('../services/users.service');

/**
 * Controlador para POST /api/users/register
 * Registra un nuevo usuario en el sistema
 */
async function registerController(req, res) {
    try {
        // Obtener los datos del body de la petición
        const { name, email, password } = req.body;
        
        // Verificar que todos los campos estén presentes
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Todos los campos son obligatorios (name, email, password)'
            });
        }
        
        // Llamar al servicio para crear el usuario
        const user = await createUser({ name, email, password });
        
        // Responder con éxito (201 = Created) y el usuario creado (SIN la contraseña)
        res.status(201).json({
            success: true,
            message: 'Usuario registrado correctamente',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                created_at: user.created_at
            }
        });
        
    } catch (error) {
        // Si hay un error, registrarlo en la consola
        console.error('Error al registrar usuario:', error);
        
        // Responder con error (400 = Bad Request) y el mensaje de error
        res.status(400).json({
            success: false,
            error: error.message || 'Error al registrar el usuario'
        });
    }
}

/**
 * Controlador para POST /api/users/login
 * Inicia sesión de un usuario existente
 */
async function loginController(req, res) {
    try {
        // Obtener email y contraseña del body
        const { email, password } = req.body;
        
        // Verificar que ambos campos estén presentes
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email y contraseña son obligatorios'
            });
        }
        
        // Buscar el usuario por email
        const user = await getUserByEmail(email);
        
        // Si el usuario no existe, devolver error
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Email o contraseña incorrectos'
            });
        }
        
        // Verificar la contraseña
        const isPasswordValid = await verifyPassword(password, user.password_hash);
        
        // Si la contraseña no es correcta, devolver error
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                error: 'Email o contraseña incorrectos'
            });
        }
        
        // Si todo está correcto, responder con éxito
        // IMPORTANTE: NO devolver el password_hash
        res.json({
            success: true,
            message: 'Login exitoso',
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
        
    } catch (error) {
        // Si hay un error, registrarlo en la consola
        console.error('Error al hacer login:', error);
        
        // Responder con error (500 = Internal Server Error)
        res.status(500).json({
            success: false,
            error: 'Error al hacer login'
        });
    }
}

module.exports = {
    registerController,
    loginController
};