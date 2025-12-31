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

const requestPasswordReset = async (correo) => {
    const user = await User.findOne({ where: { correo } });

    if (!user) {
        // Por seguridad, no revelamos si el usuario existe o no
        throw new Error('Si el correo existe en nuestro sistema, recibirás instrucciones para recuperar tu contraseña');
    }

    // Generar token aleatorio
    const crypto = require('crypto');
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash del token antes de guardarlo
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Guardar token hasheado y fecha de expiración (1 hora)
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hora
    await user.save();

    // Enviar email con el token original (no hasheado)
    const { sendPasswordResetEmail } = require('./emailService');
    await sendPasswordResetEmail(user.correo, resetToken);

    return {
        message: 'Se ha enviado un correo con las instrucciones para recuperar tu contraseña'
    };
};

const resetPassword = async (token, nuevaContrasena) => {
    // Hashear el token recibido para comparar
    const crypto = require('crypto');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Buscar usuario con el token válido y no expirado
    const user = await User.scope('withPassword').findOne({
        where: {
            resetPasswordToken: hashedToken,
        }
    });

    if (!user) {
        throw new Error('Token inválido o expirado');
    }

    // Verificar si el token ha expirado
    if (user.resetPasswordExpires < new Date()) {
        throw new Error('El token ha expirado. Por favor, solicita uno nuevo');
    }

    // Actualizar la contraseña
    user.contrasena = await bcrypt.hash(nuevaContrasena, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    return {
        message: 'Contraseña actualizada exitosamente'
    };
};

module.exports = {
    login,
    register,
    requestPasswordReset,
    resetPassword
};
