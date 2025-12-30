const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Usuario = sequelize.define('Usuario', {
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    correo: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    contrasena: {
        type: DataTypes.STRING,
        allowNull: false
    },
    rol: {
        type: DataTypes.ENUM('usuario', 'administrador'),
        defaultValue: 'usuario'
    }
}, {
    timestamps: true,
    tableName: 'usuarios',
    defaultScope: {
        attributes: { exclude: ['contrasena'] }
    },
    scopes: {
        withPassword: { attributes: {}, }
    },
    hooks: {
        beforeSave: (usuario) => {
            if (usuario.correo) {
                usuario.correo = usuario.correo.toLowerCase().trim();
            }
        }
    }
});

module.exports = Usuario;
