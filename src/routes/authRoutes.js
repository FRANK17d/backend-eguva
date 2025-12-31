const { Router } = require('express');
const router = Router();
const { login, register, requestPasswordReset, resetPassword } = require('../controllers/authController');
const validate = require('../middlewares/validateMiddleware');
const { loginSchema, registerSchema, forgotPasswordSchema, resetPasswordSchema } = require('../schemas/authSchemas');
const passport = require('../config/passport');
const jwt = require('jsonwebtoken');

router.post('/login', validate(loginSchema), login);
router.post('/register', validate(registerSchema), register);

// Rutas de recuperación de contraseña
router.post('/forgot-password', validate(forgotPasswordSchema), requestPasswordReset);
router.put('/reset-password/:token', validate(resetPasswordSchema), resetPassword);

// Rutas de Google OAuth
router.get('/google',
    passport.authenticate('google', {
        scope: ['profile', 'email'],
        session: false
    })
);

router.get('/google/callback',
    passport.authenticate('google', {
        session: false,
        failureRedirect: `${process.env.FRONTEND_URL}/iniciar-sesión`
    }),
    (req, res) => {
        // Generar JWT para el usuario autenticado
        const token = jwt.sign(
            { id: req.user.id, rol: req.user.rol },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Redirigir al frontend con el token
        res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
    }
);

module.exports = router;
