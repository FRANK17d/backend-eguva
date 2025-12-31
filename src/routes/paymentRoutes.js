const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/create-preference', protect, paymentController.createPreference);
router.post('/process-payment', protect, paymentController.processPayment);
router.post('/webhook', paymentController.webhook);

module.exports = router;
