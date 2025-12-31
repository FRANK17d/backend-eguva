const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Pedido = sequelize.define('Pedido', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    usuarioId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
    },
    subtotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
    },
    costoEnvio: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
    },
    estado: {
        type: DataTypes.ENUM('Pendiente', 'Pagado', 'Enviado', 'Entregado', 'Cancelado'),
        defaultValue: 'Pendiente'
    },
    metodoPago: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'Transferencia'
    },
    direccionEnvio: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    ciudad: {
        type: DataTypes.STRING,
        allowNull: false
    },
    telefono: {
        type: DataTypes.STRING,
        allowNull: false
    },
    notas: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    // Para pagos (opcional para Stripe o MercadoPago después)
    paymentId: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'pedidos',
    timestamps: true
});

module.exports = Pedido;
