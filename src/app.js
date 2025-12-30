const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const passport = require('./config/passport');

const app = express();

// Middlewares
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(passport.initialize());

// Rutas
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/products', require('./routes/productRoutes'));

// Ruta básica
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to Eguva API',
        status: 'Server is running',
        version: '1.0.0'
    });
});

module.exports = app;
