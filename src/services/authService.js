const User = require('../models/Usuario');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const login = async (correo, contrasena) => {
    const user = await User.scope('withPassword').findOne({ where: { correo } });
    if (!user) return null;

    const isMatch = await bcrypt.compare(contrasena, user.contrasena);
    if (!isMatch) return null;

    const token = jwt.sign(
        { id: user.id, role: user.rol },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );

    return {
        token,
        user: {
            id: user.id,
            nombre: user.nombre,
            correo: user.correo,
            rol: user.rol
        }
    };
};

const register = async (userData) => {
    const { nombre, correo, contrasena, rol } = userData;

    const existingUser = await User.findOne({ where: { correo } });
    if (existingUser) throw new Error('El usuario ya existe');

    const hashedPassword = await bcrypt.hash(contrasena, 10);

    const user = await User.create({
        nombre,
        correo,
        contrasena: hashedPassword,
        rol: rol || 'usuario'
    });

    return {
        message: 'Usuario registrado exitosamente',
        user: {
            id: user.id,
            nombre: user.nombre,
            correo: user.correo,
            rol: user.rol
        }
    };
};

module.exports = {
    login,
    register
};
