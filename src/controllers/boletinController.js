const Boletin = require('../models/Boletin');
const { sendNewsletterWelcomeEmail } = require('../services/emailService');

const suscribir = async (req, res) => {
    try {
        const { correo } = req.body;

        if (!correo) {
            return res.status(400).json({ mensaje: 'El correo es obligatorio' });
        }

        // Verificar si ya existe
        const existe = await Boletin.findOne({ where: { correo } });

        if (existe) {
            if (existe.activo) {
                return res.status(400).json({ mensaje: 'Este correo ya está suscrito' });
            } else {
                // Reactivar si estaba inactivo
                existe.activo = true;
                await existe.save();
                return res.status(200).json({ mensaje: 'Suscripción reactivada con éxito' });
            }
        }

        await Boletin.create({ correo });

        // Enviar email de bienvenida (sin await para no retrasar la respuesta al cliente)
        sendNewsletterWelcomeEmail(correo);

        res.status(201).json({ mensaje: '¡Gracias por suscribirte!' });
    } catch (error) {
        console.error('Error en newsletter:', error);
        res.status(500).json({ mensaje: 'Error al procesar la suscripción' });
    }
};

const { Op } = require('sequelize');

const listarSuscritos = async (req, res) => {
    try {
        const pagina = parseInt(req.query.pagina) || 1;
        const limite = parseInt(req.query.limite) || 10;
        const buscar = req.query.buscar || '';
        const offset = (pagina - 1) * limite;

        const where = {};
        if (buscar) {
            where.correo = { [Op.like]: `%${buscar}%` };
        }

        const { count, rows: suscritos } = await Boletin.findAndCountAll({
            where,
            order: [['createdAt', 'DESC']],
            limit: limite,
            offset: offset
        });

        res.json({
            suscriptores: suscritos,
            total: count,
            paginas: Math.ceil(count / limite),
            paginaActual: pagina
        });
    } catch (error) {
        console.error('Error al listar suscriptores:', error);
        res.status(500).json({ mensaje: 'Error al obtener suscriptores' });
    }
};

module.exports = {
    suscribir,
    listarSuscritos
};
