const Usuario = require('../models/Usuario');

const getProfile = async (req, res) => {
    try {
        // req.user comes from the protect middleware
        res.json(req.user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getUsers = async (req, res) => {
    try {
        const users = await Usuario.findAll({
            order: [['createdAt', 'DESC']]
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getProfile, getUsers };
