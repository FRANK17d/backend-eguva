const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Boletin = sequelize.define('Boletin', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    correo: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'boletin',
    timestamps: true
});

module.exports = Boletin;
