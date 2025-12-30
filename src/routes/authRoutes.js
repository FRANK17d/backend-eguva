const { Router } = require('express');
const router = Router();
const { login, register } = require('../controllers/authController');
const validate = require('../middlewares/validateMiddleware');
const { loginSchema, registerSchema } = require('../schemas/authSchemas');

router.post('/login', validate(loginSchema), login);
router.post('/register', validate(registerSchema), register);

module.exports = router;
