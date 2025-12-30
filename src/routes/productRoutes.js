const { Router } = require('express');
const router = Router();
const { getProducts, getProductById, createProduct } = require('../controllers/productController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', protect, admin, createProduct);

module.exports = router;
