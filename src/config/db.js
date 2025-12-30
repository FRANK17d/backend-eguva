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

        await sequelize.sync({ alter: true });
        console.log('Los modelos se han sincronizado con la base de datos.');
    } catch (error) {
        console.error('No se pudo conectar a la base de datos:', error);
    }
};

module.exports = { sequelize, connectDB };
