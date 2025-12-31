const { DataTypes, Op } = require('sequelize');
const { sequelize } = require('../config/db');

const Producto = sequelize.define('Producto', {
    // Identificador único
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    // Información básica del producto
    nombre: {
        type: DataTypes.STRING(200),
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'El nombre del producto es requerido'
            },
            len: {
                args: [2, 200],
                msg: 'El nombre debe tener entre 2 y 200 caracteres'
            }
        }
    },

    // Slug para URLs amigables
    slug: {
        type: DataTypes.STRING(250),
        allowNull: true,
        unique: true
    },

    // Descripción detallada
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
            len: {
                args: [0, 5000],
                msg: 'La descripción no puede exceder 5000 caracteres'
            }
        }
    },

    // Categoría del producto (clave foránea)
    categoriaId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'categorias',
            key: 'id'
        }
    },

    // Precio actual
    precio: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            isDecimal: {
                msg: 'El precio debe ser un número válido'
            },
            min: {
                args: [0.01],
                msg: 'El precio debe ser mayor a 0'
            }
        },
        get() {
            const value = this.getDataValue('precio');
            return value ? parseFloat(value) : null;
        }
    },

    // Precio original (para mostrar descuentos)
    precioOriginal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        validate: {
            isDecimal: {
                msg: 'El precio original debe ser un número válido'
            },
            min: {
                args: [0.01],
                msg: 'El precio original debe ser mayor a 0'
            }
        },
        get() {
            const value = this.getDataValue('precioOriginal');
            return value ? parseFloat(value) : null;
        }
    },

    // Imagen principal
    imagen: {
        type: DataTypes.STRING(500),
        allowNull: true
    },

    // Galería de imágenes adicionales (JSON array de URLs)
    imagenes: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
        validate: {
            isValidArray(value) {
                if (value && !Array.isArray(value)) {
                    throw new Error('Las imágenes deben ser un array');
                }
                if (value && value.length > 10) {
                    throw new Error('Máximo 10 imágenes permitidas');
                }
            }
        }
    },

    // Condición del producto
    condicion: {
        type: DataTypes.ENUM('Excelente', 'Muy Bueno', 'Bueno', 'Regular'),
        allowNull: false,
        defaultValue: 'Bueno',
        validate: {
            isIn: {
                args: [['Excelente', 'Muy Bueno', 'Bueno', 'Regular']],
                msg: 'Condición no válida'
            }
        }
    },

    // Talla del producto
    talla: {
        type: DataTypes.STRING(20),
        allowNull: true
    },

    // Stock disponible
    stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
            isInt: {
                msg: 'El stock debe ser un número entero'
            },
            min: {
                args: [0],
                msg: 'El stock no puede ser negativo'
            }
        }
    },

    // Estado del producto
    estado: {
        type: DataTypes.ENUM('activo', 'inactivo', 'agotado', 'borrador'),
        allowNull: false,
        defaultValue: 'activo'
    },

    // Producto destacado
    destacado: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }

}, {
    timestamps: true,
    tableName: 'productos',
    paranoid: true, // Soft delete - no elimina realmente, solo marca deletedAt

    // Índices para búsquedas rápidas
    indexes: [
        { fields: ['categoriaId'] },
        { fields: ['estado'] },
        { fields: ['destacado'] },
        { fields: ['precio'] },
        { fields: ['condicion'] },
        { fields: ['slug'], unique: true },
        { fields: ['createdAt'] }
    ],

    // Hooks del modelo
    hooks: {
        beforeValidate: (producto) => {
            // Limpiar espacios en blanco del nombre
            if (producto.nombre) {
                producto.nombre = producto.nombre.trim();
            }

            // Generar slug si no existe
            if (producto.nombre && !producto.slug) {
                producto.slug = producto.nombre
                    .toLowerCase()
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
                    .replace(/[^a-z0-9\s-]/g, '') // Solo letras, números, espacios y guiones
                    .replace(/\s+/g, '-') // Espacios a guiones
                    .replace(/-+/g, '-') // Múltiples guiones a uno solo
                    .substring(0, 250);
            }
        },

        beforeSave: (producto) => {
            // Actualizar estado a agotado si stock es 0
            if (producto.stock === 0 && producto.estado === 'activo') {
                producto.estado = 'agotado';
            }

            // Reactivar si se agrega stock
            if (producto.stock > 0 && producto.estado === 'agotado') {
                producto.estado = 'activo';
            }
        }
    },

    // Scopes predefinidos para consultas comunes
    scopes: {
        activos: {
            where: { estado: 'activo' }
        },
        destacados: {
            where: { destacado: true, estado: 'activo' }
        },
        conStock: {
            where: { stock: { [Op.gt]: 0 } }
        },
        porCategoria(categoriaId) {
            return {
                where: { categoriaId, estado: 'activo' }
            };
        },
        recientes: {
            order: [['createdAt', 'DESC']],
            limit: 10
        }
    }
});

// Métodos de instancia
Producto.prototype.tieneDescuento = function () {
    return this.precioOriginal && this.precioOriginal > this.precio;
};

Producto.prototype.getPorcentajeDescuento = function () {
    if (!this.tieneDescuento()) return 0;
    return Math.round((1 - this.precio / this.precioOriginal) * 100);
};

Producto.prototype.estaDisponible = function () {
    return this.stock > 0 && this.estado === 'activo';
};

Producto.prototype.toJSON = function () {
    const values = { ...this.get() };

    // Agregar campos calculados
    values.tieneDescuento = this.tieneDescuento();
    values.porcentajeDescuento = this.getPorcentajeDescuento();
    values.disponible = this.estaDisponible();

    // Remover campos sensibles
    delete values.deletedAt;

    return values;
};

// Métodos estáticos
Producto.buscar = async function (termino, opciones = {}) {
    const { limite = 20, pagina = 1, categoriaId } = opciones;

    const where = {
        estado: 'activo',
        [Op.or]: [
            { nombre: { [Op.like]: `%${termino}%` } },
            { descripcion: { [Op.like]: `%${termino}%` } }
        ]
    };

    if (categoriaId) {
        where.categoriaId = categoriaId;
    }

    return this.findAndCountAll({
        where,
        limit: limite,
        offset: (pagina - 1) * limite,
        order: [['createdAt', 'DESC']]
    });
};

Producto.obtenerPorCategoria = async function (categoriaId, limite = 20) {
    return this.scope('activos').findAll({
        where: { categoriaId },
        limit: limite,
        order: [['createdAt', 'DESC']]
    });
};

Producto.obtenerDestacados = async function (limite = 8) {
    return this.scope(['activos', 'destacados']).findAll({
        limit: limite,
        order: [['createdAt', 'DESC']]
    });
};

module.exports = Producto;
