const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const login = async (email, password) => {
    const user = await User.findOne({ where: { email } });
    if (!user) return null;

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return null;

    const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );

    return {
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        }
    };
};

const register = async (userData) => {
    const { name, email, password } = userData;

    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) throw new Error('El usuario ya existe');

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
        name,
        email,
        password: hashedPassword
    });

    return {
        message: 'Usuario registrado exitosamente',
        user: {
            id: user.id,
            name: user.name,
            email: user.email
        }
    };
};

module.exports = {
    login,
    register
};
