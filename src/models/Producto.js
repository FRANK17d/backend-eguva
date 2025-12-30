const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Producto = sequelize.define('Producto', {
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    categoria: {
        type: DataTypes.STRING,
        allowNull: false
    },
    precio: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    imagen: {
        type: DataTypes.STRING,
        allowNull: true
    },
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    condicion: {
        type: DataTypes.STRING,
        allowNull: true
    },
    marca: {
        type: DataTypes.STRING,
        allowNull: true
    },
    talla: {
        type: DataTypes.STRING,
        allowNull: true
    },
    stock: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    }
}, {
    timestamps: true,
    tableName: 'productos'
});

module.exports = Producto;
