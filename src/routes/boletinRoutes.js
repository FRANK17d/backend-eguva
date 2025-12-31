const { Router } = require('express');
const router = Router();
const { suscribir, listarSuscritos } = require('../controllers/boletinController');
const { protect, admin } = require('../middlewares/authMiddleware');

// Ruta pública para suscripción
router.post('/suscribir', suscribir);

// Ruta privada para admin
router.get('/lista', protect, admin, listarSuscritos);

module.exports = router;
