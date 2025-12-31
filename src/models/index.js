const Usuario = require('./Usuario');
const Producto = require('./Producto');
const Categoria = require('./Categoria');
const Pedido = require('./Pedido');
const DetallePedido = require('./DetallePedido');
const Configuracion = require('./Configuracion');

// Definir asociaciones

// Categoria - Producto (1:N)
Categoria.hasMany(Producto, { foreignKey: 'categoriaId', as: 'productos' });
Producto.belongsTo(Categoria, { foreignKey: 'categoriaId', as: 'categoria' });

// Usuario - Pedido (1:N)
Usuario.hasMany(Pedido, { foreignKey: 'usuarioId', as: 'pedidos' });
Pedido.belongsTo(Usuario, { foreignKey: 'usuarioId', as: 'usuario' });

// Pedido - DetallePedido (1:N)
Pedido.hasMany(DetallePedido, { foreignKey: 'pedidoId', as: 'detalles' });
DetallePedido.belongsTo(Pedido, { foreignKey: 'pedidoId', as: 'pedido' });

// Producto - DetallePedido (1:N)
Producto.hasMany(DetallePedido, { foreignKey: 'productoId', as: 'detalles' });
DetallePedido.belongsTo(Producto, { foreignKey: 'productoId', as: 'producto' });

module.exports = {
    Usuario,
    Producto,
    Categoria,
    Pedido,
    DetallePedido,
    Configuracion
};
