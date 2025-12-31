const { MercadoPagoConfig, Preference } = require('mercadopago');
const { Pedido, DetallePedido, Producto } = require('../models');

// Configuración de Mercado Pago
// Deberás añadir MERCADOPAGO_ACCESS_TOKEN a tu .env
const client = new MercadoPagoConfig({
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || 'TEST-4122490520633890-123023-5e7b1739763773ba50cba3c85856715f-141893335' // Token de prueba por defecto
});

exports.createPreference = async (req, res) => {
    try {
        const { pedidoId } = req.body;

        const pedido = await Pedido.findByPk(pedidoId, {
            include: [{
                model: DetallePedido,
                as: 'detalles',
                include: [{ model: Producto, as: 'producto' }]
            }]
        });

        if (!pedido) {
            return res.status(404).json({ mensaje: 'Pedido no encontrado' });
        }

        const preference = new Preference(client);

        const items = pedido.detalles.map(item => ({
            id: item.producto.id.toString(),
            title: item.producto.nombre,
            quantity: item.cantidad,
            unit_price: parseFloat(item.precio),
            currency_id: 'PEN'
        }));

        // Añadir el costo de envío como un item si existe
        if (parseFloat(pedido.costoEnvio) > 0) {
            items.push({
                id: 'shipping',
                title: 'Costo de Envío',
                quantity: 1,
                unit_price: parseFloat(pedido.costoEnvio),
                currency_id: 'PEN'
            });
        }

        const body = {
            items,
            back_urls: {
                success: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/pago/exitoso`,
                failure: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/pago/fallido`,
                pending: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/pago/pendiente`,
            },
            auto_return: 'approved',
            external_reference: pedido.id.toString(),
            notification_url: `${process.env.BACKEND_URL}/api/payments/webhook`,
        };

        const response = await preference.create({ body });

        // Guardar el preference ID en el pedido
        pedido.mercadopago_preference_id = response.id;
        await pedido.save();

        res.json({
            id: response.id,
            init_point: response.init_point // URL para redirigir al usuario
        });

    } catch (error) {
        console.error('Error al crear preferencia de Mercado Pago:', error);
        res.status(500).json({ mensaje: 'Error al iniciar el proceso de pago' });
    }
};

exports.webhook = async (req, res) => {
    // Aquí recibiremos la notificación de Mercado Pago cuando el pago se complete
    const { query } = req;
    const topic = query.topic || query.type;

    try {
        if (topic === 'payment') {
            const paymentId = query.id || query['data.id'];
            // Aquí se debería consultar el estado del pago a Mercado Pago con el paymentId
            // y actualizar el estado del pedido a 'Pagado'
            console.log('Pago recibido:', paymentId);
        }
        res.sendStatus(200);
    } catch (error) {
        console.error('Error en webhook de Mercado Pago:', error);
        res.sendStatus(500);
    }
};
