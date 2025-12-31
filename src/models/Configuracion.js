const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Configuracion = sequelize.define('Configuracion', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    clave: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        comment: 'shipping_cost, free_shipping_threshold, etc'
    },
    valor: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    tipo: {
        type: DataTypes.ENUM('number', 'string', 'boolean'),
        allowNull: false,
        defaultValue: 'string'
    },
    descripcion: {
        type: DataTypes.STRING(255),
        allowNull: true
    }
}, {
    timestamps: true,
    tableName: 'configuraciones'
});

module.exports = Configuracion;
