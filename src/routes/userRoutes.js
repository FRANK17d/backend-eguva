const { Router } = require('express');
const router = Router();
const { getProfile, getUsers } = require('../controllers/userController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.get('/perfil', protect, getProfile);
router.get('/lista', protect, admin, getUsers);

module.exports = router;
