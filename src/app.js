const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const app = express();

// Middlewares
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Rutas
app.use('/api/auth', require('./routes/authRoutes'));
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
