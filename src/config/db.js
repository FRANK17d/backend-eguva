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
        } else {
            await sequelize.sync({ alter: false });
        }

        // Fix manual para columnas faltantes (Funciona en Dev y Producción)
        // Intentamos agregar las columnas una por una. Si ya existen, el catch ignorará el error.
        try { await sequelize.query("ALTER TABLE pedidos ADD COLUMN mercadopago_preference_id VARCHAR(255) NULL;"); } catch (e) { }
        try { await sequelize.query("ALTER TABLE pedidos ADD COLUMN subtotal DECIMAL(10,2) NOT NULL DEFAULT 0.00;"); } catch (e) { }
        try { await sequelize.query("ALTER TABLE pedidos ADD COLUMN costoEnvio DECIMAL(10,2) NOT NULL DEFAULT 0.00;"); } catch (e) { }
        try { await sequelize.query("ALTER TABLE pedidos ADD COLUMN paymentId VARCHAR(255) NULL;"); } catch (e) { }

        // Nuevas columnas para formulario de envío actualizado
        try { await sequelize.query("ALTER TABLE pedidos ADD COLUMN nombreCompleto VARCHAR(255) NOT NULL DEFAULT '';"); } catch (e) { }
        try { await sequelize.query("ALTER TABLE pedidos ADD COLUMN dni VARCHAR(15) NOT NULL DEFAULT '';"); } catch (e) { }
        try { await sequelize.query("ALTER TABLE pedidos ADD COLUMN departamento VARCHAR(255) DEFAULT 'La Libertad';"); } catch (e) { }
        try { await sequelize.query("ALTER TABLE pedidos ADD COLUMN provincia VARCHAR(255);"); } catch (e) { }
        try { await sequelize.query("ALTER TABLE pedidos ADD COLUMN distrito VARCHAR(255);"); } catch (e) { }
        try { await sequelize.query("ALTER TABLE pedidos ADD COLUMN codigoPostal VARCHAR(10);"); } catch (e) { }

        // Hacer direccionEnvio opcional (si existe la columna)
        try { await sequelize.query("ALTER TABLE pedidos MODIFY COLUMN direccionEnvio TEXT NULL;"); } catch (e) { }

        // Actualizar ENUM de estado para incluir 'Rechazado'
        try { await sequelize.query("ALTER TABLE pedidos MODIFY COLUMN estado ENUM('Pendiente', 'Pagado', 'Enviado', 'Entregado', 'Cancelado', 'Rechazado') DEFAULT 'Pendiente';"); } catch (e) { }

        console.log('Modelos sincronizados y columnas verificadas.');
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
