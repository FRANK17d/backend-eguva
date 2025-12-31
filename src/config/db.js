const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 3306,
        dialect: 'mysql',
        logging: false,
    }
);

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('La conexión a MySQL se ha establecido correctamente.');

        // Sincronización basada en el entorno
        if (process.env.NODE_ENV === 'production') {
            // TEMPORAL: alter:true para agregar nuevas columnas (resetPasswordToken, resetPasswordExpires)
            // TODO: Revertir a sync() sin alter después del primer deploy exitoso
            await sequelize.sync({ alter: true });
            console.log('Modelos sincronizados (producción - ALTER MODE TEMPORAL).');
        } else {
            // En desarrollo: permite modificar estructura
            await sequelize.sync({ alter: true });
            console.log('Modelos sincronizados (desarrollo - alter mode).');
        }
    } catch (error) {
        console.error('No se pudo conectar a la base de datos:', error.message);

        // En producción, detener la aplicación si falla la BD
        if (process.env.NODE_ENV === 'production') {
            console.error('Deteniendo aplicación por error crítico en BD');
            process.exit(1);
        }
    }
};

module.exports = { sequelize, connectDB };
