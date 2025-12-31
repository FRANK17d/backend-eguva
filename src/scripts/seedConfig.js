const { Configuracion } = require('../models');
const { sequelize } = require('../config/db');

const seedConfig = async () => {
    try {
        await sequelize.authenticate();
        console.log('Conexión establecida correctamente.');

        const defaultConfigs = [
            {
                clave: 'shipping_cost',
                valor: '15.00',
                tipo: 'number',
                descripcion: 'Costo base de envío'
            },
            {
                clave: 'free_shipping_threshold',
                valor: '45.00',
                tipo: 'number',
                descripcion: 'Monto mínimo para envío gratuito'
            }
        ];

        for (const config of defaultConfigs) {
            await Configuracion.findOrCreate({
                where: { clave: config.clave },
                defaults: config
            });
        }

        console.log('Configuraciones inicializadas correctamente.');
        process.exit(0);
    } catch (error) {
        console.error('Error al inicializar configuraciones:', error);
        process.exit(1);
    }
};

seedConfig();
