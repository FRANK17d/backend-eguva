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
            await sequelize.sync({ alter: false });
            console.log('Modelos sincronizados (producción).');
        } else {
            await sequelize.sync({ alter: false });

            // Fix manual para columnas faltantes si alter:true falla (MySQL standard no soporta ADD COLUMN IF NOT EXISTS)
            try { await sequelize.query("ALTER TABLE pedidos ADD COLUMN mercadopago_preference_id VARCHAR(255) NULL;"); } catch (e) { }
            try { await sequelize.query("ALTER TABLE pedidos ADD COLUMN subtotal DECIMAL(10,2) NOT NULL DEFAULT 0.00;"); } catch (e) { }
            try { await sequelize.query("ALTER TABLE pedidos ADD COLUMN costoEnvio DECIMAL(10,2) NOT NULL DEFAULT 0.00;"); } catch (e) { }

            console.log('Modelos sincronizados (desarrollo).');
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
