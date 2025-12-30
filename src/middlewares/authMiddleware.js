const jwt = require('jsonwebtoken');
const User = require('../models/Usuario');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from the token and attach to request
            req.user = await User.findByPk(decoded.id);

            if (!req.user) {
                return res.status(401).json({ message: 'Usuario no encontrado' });
            }

            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'No autorizado, token fallido' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'No autorizado, no hay token' });
    }
};

const admin = (req, res, next) => {
    if (req.user && req.user.rol === 'administrador') {
        next();
    } else {
        res.status(403).json({ message: 'No autorizado como administrador' });
    }
};

module.exports = { protect, admin };
