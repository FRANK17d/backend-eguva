const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const DetallePedido = sequelize.define('DetallePedido', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    pedidoId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    productoId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    },
    precio: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    }
}, {
    tableName: 'detalles_pedidos',
    timestamps: false
});

module.exports = DetallePedido;
