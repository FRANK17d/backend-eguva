const express = require('express');
const router = express.Router();
const {
    getProductos,
    getProducto,
    getProductosDestacados,
    createProducto,
    updateProducto,
    deleteProducto,
    getProductosAdmin
} = require('../controllers/productoController');
const { protect, admin } = require('../middlewares/authMiddleware');

// Rutas públicas
router.get('/', getProductos);
router.get('/destacados', getProductosDestacados);
router.get('/:id', getProducto);

// Rutas protegidas (Admin)
router.get('/admin/lista', protect, admin, getProductosAdmin);
router.post('/', protect, admin, createProducto);
router.put('/:id', protect, admin, updateProducto);
router.delete('/:id', protect, admin, deleteProducto);

module.exports = router;
