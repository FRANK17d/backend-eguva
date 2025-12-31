const authService = require('../services/authService');

const login = async (req, res) => {
    try {
        const { correo, contrasena } = req.body;
        const result = await authService.login(correo, contrasena);

        if (!result) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const register = async (req, res) => {
    try {
        const result = await authService.register(req.body);
        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const requestPasswordReset = async (req, res) => {
    try {
        const { correo } = req.body;
        const result = await authService.requestPasswordReset(correo);
        res.json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { contrasena } = req.body;
        const result = await authService.resetPassword(token, contrasena);
        res.json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    login,
    register,
    requestPasswordReset,
    resetPassword
};
