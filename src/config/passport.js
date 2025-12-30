const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const Usuario = require('../models/Usuario');

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: `${process.env.BACKEND_URL || 'http://localhost:4000'}/api/auth/google/callback`,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Buscar si el usuario ya existe
                let user = await Usuario.findOne({
                    where: { correo: profile.emails[0].value }
                });

                if (user) {
                    // Usuario existe, retornarlo
                    return done(null, user);
                }

                // Usuario no existe, crearlo
                user = await Usuario.create({
                    nombre: profile.displayName,
                    correo: profile.emails[0].value,
                    contrasena: 'google-auth', // No se usa contraseña con Google
                    rol: 'usuario'
                });

                done(null, user);
            } catch (error) {
                done(error, null);
            }
        }
    )
);

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await Usuario.findByPk(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

module.exports = passport;
