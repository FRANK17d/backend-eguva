const { Pedido, DetallePedido, Producto, Usuario } = require('../models');
const { sequelize } = require('../config/db');

// Crear un nuevo pedido
const crearPedido = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { items, direccionEnvio, ciudad, telefono, metodoPago, notas } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ mensaje: 'No hay productos en el pedido' });
        }

        let subtotal = 0;
        const detalles = [];

        // Validar stock y calcular subtotal
        for (const item of items) {
            const producto = await Producto.findByPk(item.productoId);
            if (!producto) {
                await t.rollback();
                return res.status(404).json({ mensaje: `Producto con ID ${item.productoId} no encontrado` });
            }

            if (producto.stock < item.cantidad) {
                await t.rollback();
                return res.status(400).json({ mensaje: `Stock insuficiente para ${producto.nombre}` });
            }

            subtotal += producto.precio * item.cantidad;
            detalles.push({
                productoId: producto.id,
                cantidad: item.cantidad,
                precio: producto.precio
            });

            // Descontar stock
            producto.stock -= item.cantidad;
            await producto.save({ transaction: t });
        }

        // Obtener configuración de envío
        const { Configuracion } = require('../models');
        const configs = await Configuracion.findAll({
            where: { clave: ['shipping_cost', 'free_shipping_threshold'] }
        });

        const configMap = {};
        configs.forEach(c => configMap[c.clave] = parseFloat(c.valor));

        const freeShippingThreshold = configMap['free_shipping_threshold'] || 70.00;
        const baseShippingCost = configMap['shipping_cost'] || 15.00;

        const costoEnvio = subtotal >= freeShippingThreshold ? 0 : baseShippingCost;
        const total = subtotal + costoEnvio;

        // Crear el pedido
        const pedido = await Pedido.create({
            usuarioId: req.user.id,
            subtotal, // Si quieres guardar también el subtotal podrías añadir el campo, pero Pedido.total es el final
            total,
            costoEnvio,
            direccionEnvio,
            ciudad,
            telefono,
            metodoPago,
            notas,
            estado: 'Pendiente'
        }, { transaction: t });

        // Crear los detalles
        await Promise.all(detalles.map(detalle =>
            DetallePedido.create({
                ...detalle,
                pedidoId: pedido.id
            }, { transaction: t })
        ));

        await t.commit();
        res.status(201).json(pedido);
    } catch (error) {
        await t.rollback();
        console.error('Error al crear pedido:', error);
        res.status(500).json({ mensaje: 'Error al procesar el pedido' });
    }
};

// Obtener pedidos del usuario autenticado
const getMisPedidos = async (req, res) => {
    try {
        const pedidos = await Pedido.findAll({
            where: { usuarioId: req.user.id },
            order: [['createdAt', 'DESC']],
            include: [
                {
                    model: DetallePedido,
                    as: 'detalles',
                    include: [{ model: Producto, as: 'producto' }]
                }
            ]
        });
        res.json(pedidos);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener pedidos' });
    }
};

// Obtener todos los pedidos (Admin)
const getAdminPedidos = async (req, res) => {
    try {
        const pagina = parseInt(req.query.pagina) || 1;
        const limite = parseInt(req.query.limite) || 10;
        const offset = (pagina - 1) * limite;

        const { count, rows: pedidos } = await Pedido.findAndCountAll({
            include: [
                { model: Usuario, as: 'usuario', attributes: ['nombre', 'correo'] }
            ],
            order: [['createdAt', 'DESC']],
            limit: limite,
            offset: offset
        });

        res.json({
            pedidos,
            total: count,
            paginas: Math.ceil(count / limite),
            paginaActual: pagina
        });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener pedidos' });
    }
};

// Actualizar estado del pedido (Admin)
const actualizarEstadoPedido = async (req, res) => {
    try {
        const { estado } = req.body;
        const pedido = await Pedido.findByPk(req.params.id);

        if (!pedido) {
            return res.status(404).json({ mensaje: 'Pedido no encontrado' });
        }

        pedido.estado = estado;
        await pedido.save();

        res.json(pedido);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al actualizar el estado' });
    }
};

// Obtener detalle de un pedido
const getPedidoById = async (req, res) => {
    try {
        const pedido = await Pedido.findByPk(req.params.id, {
            include: [
                { model: Usuario, as: 'usuario', attributes: ['nombre', 'correo'] },
                {
                    model: DetallePedido,
                    as: 'detalles',
                    include: [{ model: Producto, as: 'producto' }]
                }
            ]
        });

        if (!pedido) {
            return res.status(404).json({ mensaje: 'Pedido no encontrado' });
        }

        // Seguridad: Solo el dueño o un admin pueden verlo
        if (pedido.usuarioId !== req.user.id && req.user.rol !== 'admin') {
            return res.status(403).json({ mensaje: 'No tienes permiso para ver este pedido' });
        }

        res.json(pedido);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener el detalle del pedido' });
    }
};

module.exports = {
    crearPedido,
    getMisPedidos,
    getAdminPedidos,
    actualizarEstadoPedido,
    getPedidoById
};
