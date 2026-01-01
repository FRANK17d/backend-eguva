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

        // Construir body según el método de pago (Yape tiene estructura diferente)
        const isYape = payment.payment_method_id === 'yape';

        // Asegurar que el monto sea un número válido con máximo 2 decimales
        const amount = parseFloat(Number(payment.transaction_amount).toFixed(2));

        if (isNaN(amount) || amount <= 0) {
            return res.status(400).json({
                mensaje: 'Monto inválido',
                detalles: 'El monto debe ser mayor a 0'
            });
        }

        const body = {
            transaction_amount: amount,
            token: payment.token,
            description: `Pedido #${pedido.id} - Eguva`,
            installments: payment.installments || 1,
            payment_method_id: payment.payment_method_id,
            payer: {
                email: payment.payer.email,
            },
            external_reference: pedido.id.toString(),
        };

        // Solo añadir issuer_id e identification si NO es Yape (Yape no los necesita)
        if (!isYape) {
            if (payment.issuer_id) body.issuer_id = payment.issuer_id;
            if (payment.payer.identification) body.payer.identification = payment.payer.identification;
        }

        const backendUrl = (process.env.BACKEND_URL || '').trim().replace(/\/$/, '');
        if (backendUrl.startsWith('http') && !backendUrl.includes('localhost')) {
            body.notification_url = `${backendUrl}/api/payments/webhook`;
        }

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
            id: response.id,
            mensaje: response.status === 'rejected' ? obtenerMensajeRechazo(response.status_detail) : null
        });

    } catch (error) {
        // Extraer mensaje detallado si existe en el error de Mercado Pago
        const mpError = error.cause?.[0]?.description || error.message || '';

        res.status(500).json({
            mensaje: 'Error al procesar el pago',
            detalles: obtenerMensajeError(mpError)
        });
    }
};

// Función para obtener mensaje amigable según el error
function obtenerMensajeError(error) {
    const errorLower = error.toLowerCase();
    if (errorLower.includes('insufficient') || errorLower.includes('amount')) {
        return 'Saldo insuficiente o monto inválido';
    }
    if (errorLower.includes('expired')) {
        return 'El código ha expirado. Genera uno nuevo.';
    }
    if (errorLower.includes('invalid') && errorLower.includes('token')) {
        return 'Token inválido. Intenta de nuevo.';
    }
    if (errorLower.includes('limit')) {
        return 'El monto supera el límite permitido';
    }
    return 'Error al procesar el pago. Intenta de nuevo.';
}

// Función para mensaje de rechazo
function obtenerMensajeRechazo(statusDetail) {
    if (!statusDetail) return 'El pago fue rechazado';

    const detail = statusDetail.toLowerCase();
    if (detail.includes('insufficient_amount')) {
        return 'Saldo insuficiente en tu cuenta';
    }
    if (detail.includes('cc_rejected_bad_filled')) {
        return 'Datos de tarjeta incorrectos';
    }
    if (detail.includes('cc_rejected_high_risk')) {
        return 'El pago fue rechazado por seguridad';
    }
    if (detail.includes('cc_rejected_blacklist')) {
        return 'No se puede procesar este pago';
    }
    if (detail.includes('cc_rejected_call_for_authorize')) {
        return 'Debes autorizar el pago con tu banco';
    }
    if (detail.includes('cc_rejected_card_disabled')) {
        return 'Tu tarjeta está deshabilitada';
    }
    if (detail.includes('cc_rejected_max_attempts')) {
        return 'Has superado el límite de intentos';
    }
    return 'El pago fue rechazado. Verifica los datos o intenta con otro medio.';
}

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
