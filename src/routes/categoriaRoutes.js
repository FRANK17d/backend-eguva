const express = require('express');
const router = express.Router();
const {
    getCategorias,
    getCategoria,
    createCategoria,
    updateCategoria,
    deleteCategoria
} = require('../controllers/categoriaController');
const { protect, admin } = require('../middlewares/authMiddleware');

// Rutas públicas
router.get('/', getCategorias);
router.get('/:id', getCategoria);

// Rutas protegidas (Admin)
router.post('/', protect, admin, createCategoria);
router.put('/:id', protect, admin, updateCategoria);
router.delete('/:id', protect, admin, deleteCategoria);

module.exports = router;
