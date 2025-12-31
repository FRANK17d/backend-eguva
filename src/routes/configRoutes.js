const express = require('express');
const router = express.Router();
const configController = require('../controllers/configController');
const { protect, admin } = require('../middlewares/authMiddleware');

// Rutas públicas (para el carrito)
router.get('/public', configController.getPublicConfigs);

// Rutas de administración
router.get('/', protect, admin, configController.getConfigs);
router.put('/', protect, admin, configController.updateConfig);

module.exports = router;
