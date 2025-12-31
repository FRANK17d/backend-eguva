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
        };

        // Solo enviar notification_url si es una URL pública válida (no localhost)
        if (process.env.BACKEND_URL && !process.env.BACKEND_URL.includes('localhost')) {
            body.notification_url = `${process.env.BACKEND_URL}/api/payments/webhook`;
        }

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

exports.processPayment = async (req, res) => {
    try {
        const { payment, pedidoId } = req.body;
        const { Payment } = require('mercadopago');
        const paymentClient = new Payment(client);

        const pedido = await Pedido.findByPk(pedidoId);
        if (!pedido) {
            return res.status(404).json({ mensaje: 'Pedido no encontrado' });
        }

        const body = {
            transaction_amount: payment.transaction_amount,
            token: payment.token,
            description: `Pedido #${pedido.id} - Eguva`,
            installments: payment.installments,
            payment_method_id: payment.payment_method_id,
            issuer_id: payment.issuer_id,
            payer: {
                email: payment.payer.email,
                identification: payment.payer.identification,
            },
            external_reference: pedido.id.toString(),
        };

        // Solo enviar notification_url si es una URL pública válida (no localhost)
        if (process.env.BACKEND_URL && !process.env.BACKEND_URL.includes('localhost')) {
            body.notification_url = `${process.env.BACKEND_URL}/api/payments/webhook`;
        }

        // Si es Yape, añadir campos específicos si son necesarios (Mercado Pago SDK los maneja por el token/payment_method_id)

        const response = await paymentClient.create({ body });

        // Actualizar pedido y DESCONTAR STOCK según el estado del pago
        if (response.status === 'approved') {
            const pedidoActualizar = await Pedido.findByPk(pedidoId, {
                include: [{
                    model: require('../models/DetallePedido'),
                    as: 'detalles'
                }]
            });

            if (pedidoActualizar && pedidoActualizar.estado !== 'Pagado') {
                // Descontar stock ahora que el pago es real
                for (const detalle of pedidoActualizar.detalles) {
                    const producto = await Producto.findByPk(detalle.productoId);
                    if (producto) {
                        producto.stock = Math.max(0, producto.stock - detalle.cantidad);
                        await producto.save();
                    }
                }

                pedidoActualizar.estado = 'Pagado';
                pedidoActualizar.paymentId = response.id.toString();
                await pedidoActualizar.save();
            }
        }

        res.json({
            status: response.status,
            status_detail: response.status_detail,
            id: response.id
        });

    } catch (error) {
        console.error('Error al procesar pago con Checkout API:', error);
        res.status(500).json({
            mensaje: 'Error al procesar el pago',
            error: error.message
        });
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
