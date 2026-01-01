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
    nombreCompleto: {
        type: DataTypes.STRING,
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
        type: DataTypes.ENUM('Pendiente', 'Pagado', 'Enviado', 'Entregado', 'Cancelado', 'Rechazado'),
        defaultValue: 'Pendiente'
    },
    metodoPago: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'Transferencia'
    },
    direccionEnvio: {
        type: DataTypes.TEXT,
        allowNull: true  // Opcional - el cliente recoge en agencia
    },
    departamento: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'La Libertad'
    },
    provincia: {
        type: DataTypes.STRING,
        allowNull: false
    },
    distrito: {
        type: DataTypes.STRING,
        allowNull: true
    },
    codigoPostal: {
        type: DataTypes.STRING(10),
        allowNull: true
    },
    dni: {
        type: DataTypes.STRING(15),
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
    },
    mercadopago_preference_id: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'pedidos',
    timestamps: true
});

module.exports = Pedido;
