const { DataTypes, Op } = require('sequelize');
const { sequelize } = require('../config/db');

const Categoria = sequelize.define('Categoria', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: {
                msg: 'El nombre de la categoría es requerido'
            },
            len: {
                args: [2, 100],
                msg: 'El nombre debe tener entre 2 y 100 caracteres'
            }
        }
    },

    slug: {
        type: DataTypes.STRING(120),
        allowNull: true,
        unique: true
    },

    descripcion: {
        type: DataTypes.TEXT,
        allowNull: true
    },

    imagen: {
        type: DataTypes.STRING(500),
        allowNull: true
    },

    icono: {
        type: DataTypes.STRING(50),
        allowNull: true,
        defaultValue: 'category',
        comment: 'Nombre del icono de Material Icons'
    },

    orden: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Orden de aparición en el menú'
    },

    activo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }

}, {
    timestamps: true,
    tableName: 'categorias',

    indexes: [
        { fields: ['slug'], unique: true },
        { fields: ['activo'] },
        { fields: ['orden'] }
    ],

    hooks: {
        beforeValidate: (categoria) => {
            if (categoria.nombre) {
                categoria.nombre = categoria.nombre.trim();
            }

            // Generar slug si no existe
            if (categoria.nombre && !categoria.slug) {
                categoria.slug = categoria.nombre
                    .toLowerCase()
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '')
                    .replace(/[^a-z0-9\s-]/g, '')
                    .replace(/\s+/g, '-')
                    .replace(/-+/g, '-')
                    .substring(0, 120);
            }
        }
    },

    scopes: {
        activas: {
            where: { activo: true },
            order: [['orden', 'ASC'], ['nombre', 'ASC']]
        }
    }
});

// Métodos estáticos
Categoria.obtenerActivas = async function () {
    return this.scope('activas').findAll();
};

Categoria.obtenerConProductos = async function () {
    const Producto = require('./Producto');
    return this.scope('activas').findAll({
        include: [{
            model: Producto,
            as: 'productos',
            where: { estado: 'activo' },
            required: false,
            attributes: ['id', 'nombre', 'precio', 'imagen']
        }]
    });
};

module.exports = Categoria;
