const Usuario = require('./Usuario');
const Producto = require('./Producto');
const Categoria = require('./Categoria');

// Definir asociaciones

// Categoria - Producto (1:N)
Categoria.hasMany(Producto, {
    foreignKey: 'categoriaId',
    as: 'productos'
});

Producto.belongsTo(Categoria, {
    foreignKey: 'categoriaId',
    as: 'categoria'
});

module.exports = {
    Usuario,
    Producto,
    Categoria
};
