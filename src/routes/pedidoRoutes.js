const { Router } = require('express');
const router = Router();
const {
    crearPedido,
    getMisPedidos,
    getAdminPedidos,
    actualizarEstadoPedido,
    getPedidoById
} = require('../controllers/pedidoController');
const { protect, admin } = require('../middlewares/authMiddleware');

// Rutas para usuarios autenticados
router.post('/', protect, crearPedido);
router.get('/mis-pedidos', protect, getMisPedidos);
router.get('/:id', protect, getPedidoById);

// Rutas para administradores
router.get('/admin/lista', protect, admin, getAdminPedidos);
router.put('/admin/:id/estado', protect, admin, actualizarEstadoPedido);

module.exports = router;
