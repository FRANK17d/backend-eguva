const Usuario = require('../models/Usuario');

const getProfile = async (req, res) => {
    try {
        // req.user comes from the protect middleware
        res.json(req.user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const { Op } = require('sequelize');

const getUsers = async (req, res) => {
    try {
        const pagina = parseInt(req.query.pagina) || 1;
        const limite = parseInt(req.query.limite) || 10;
        const buscar = req.query.buscar || '';
        const offset = (pagina - 1) * limite;

        const where = {};
        if (buscar) {
            where[Op.or] = [
                { nombre: { [Op.like]: `%${buscar}%` } },
                { correo: { [Op.like]: `%${buscar}%` } }
            ];
        }

        const { count, rows: users } = await Usuario.findAndCountAll({
            where,
            order: [['createdAt', 'DESC']],
            limit: limite,
            offset: offset
        });

        res.json({
            usuarios: users,
            total: count,
            paginas: Math.ceil(count / limite),
            paginaActual: pagina
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getProfile, getUsers };
