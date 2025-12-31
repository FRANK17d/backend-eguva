const { Configuracion } = require('../models');

exports.getConfigs = async (req, res) => {
    try {
        const configs = await Configuracion.findAll();
        res.json({
            status: 'success',
            data: configs
        });
    } catch (error) {
        console.error('Error al obtener configuraciones:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error al obtener configuraciones'
        });
    }
};

exports.updateConfig = async (req, res) => {
    const { clave, valor } = req.body;
    try {
        const config = await Configuracion.findOne({ where: { clave } });
        if (!config) {
            return res.status(404).json({
                status: 'error',
                message: 'Configuración no encontrada'
            });
        }

        config.valor = valor;
        await config.save();

        res.json({
            status: 'success',
            message: 'Configuración actualizada correctamente',
            data: config
        });
    } catch (error) {
        console.error('Error al actualizar configuración:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error al actualizar configuración'
        });
    }
};

exports.getPublicConfigs = async (req, res) => {
    try {
        // Solo enviamos las configuraciones que el frontend necesita y que no son sensibles
        const publicKeys = ['shipping_cost', 'free_shipping_threshold'];
        const configs = await Configuracion.findAll({
            where: {
                clave: publicKeys
            }
        });

        // Convertir a un objeto clave-valor para facilitar el uso en el frontend
        const configObject = {};
        configs.forEach(c => {
            configObject[c.clave] = c.tipo === 'number' ? parseFloat(c.valor) : c.valor;
        });

        res.json({
            status: 'success',
            data: configObject
        });
    } catch (error) {
        console.error('Error al obtener configuraciones públicas:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error al obtener configuraciones'
        });
    }
};
