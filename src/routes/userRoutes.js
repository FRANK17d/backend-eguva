const { Router } = require('express');
const router = Router();
const { getProfile } = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/perfil', protect, getProfile);

module.exports = router;
