const { z } = require('zod');

const registerSchema = z.object({
    nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    correo: z.string().email('Ingresa un correo electrónico válido'),
    contrasena: z.string()
        .min(8, 'La contraseña debe tener al menos 8 caracteres')
        .regex(/[A-Z]/, 'La contraseña debe contener al menos una mayúscula')
        .regex(/[0-9]/, 'La contraseña debe contener al menos un número'),
    rol: z.enum(['usuario', 'administrador']).optional()
});

const loginSchema = z.object({
    correo: z.string().email('Ingresa un correo electrónico válido'),
    contrasena: z.string().min(1, 'La contraseña es requerida')
});

const forgotPasswordSchema = z.object({
    correo: z.string().email('Ingresa un correo electrónico válido')
});

const resetPasswordSchema = z.object({
    contrasena: z.string()
        .min(8, 'La contraseña debe tener al menos 8 caracteres')
        .regex(/[A-Z]/, 'La contraseña debe contener al menos una mayúscula')
        .regex(/[0-9]/, 'La contraseña debe contener al menos un número')
});

module.exports = {
    registerSchema,
    loginSchema,
    forgotPasswordSchema,
    resetPasswordSchema
};
