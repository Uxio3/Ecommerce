// Servicio para manejar operaciones relacionadas con usuarios
const { pool } = require('../config/database');
const bcrypt = require('bcrypt');

/**
 * Crea un nuevo usuario en la base de datos
 * @param {Object} userData - Datos del usuario (name, email, password)
 * @returns {Object} - El usuario creado (sin la contraseña)
 */
async function createUser(userData) {
    const { name, email, password } = userData;
    
    // Verificar si el email ya existe
    const [existingUsers] = await pool.query(
        'SELECT id FROM users WHERE email = ?',
        [email]
    );
    
    if (existingUsers.length > 0) {
        throw new Error('El email ya está registrado');
    }
    
    // Hashear la contraseña (10 rondas de salt)
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    // Insertar el usuario en la base de datos
    const [result] = await pool.query(
        'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
        [name, email, passwordHash]
    );
    
    // Obtener el usuario creado (sin la contraseña)
    const [users] = await pool.query(
        'SELECT id, name, email, created_at FROM users WHERE id = ?',
        [result.insertId]
    );
    
    return users[0];
}

/**
 * Busca un usuario por su email
 * @param {string} email - Email del usuario
 * @returns {Object|null} - El usuario si existe, null si no
 */
async function getUserByEmail(email) {
    const [rows] = await pool.query(
        'SELECT * FROM users WHERE email = ?',
        [email]
    );
    
    return rows.length > 0 ? rows[0] : null;
}

/**
 * Verifica si la contraseña es correcta
 * @param {string} password - Contraseña en texto plano
 * @param {string} passwordHash - Hash de la contraseña almacenado
 * @returns {boolean} - true si la contraseña es correcta, false si no
 */
async function verifyPassword(password, passwordHash) {
    return await bcrypt.compare(password, passwordHash);
}

module.exports = {
    createUser,
    getUserByEmail,
    verifyPassword
};