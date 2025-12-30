const Producto = require('../models/Producto');

const getAllProducts = async () => {
    return await Producto.findAll();
};

const getProductById = async (id) => {
    return await Producto.findByPk(id);
};

const createProduct = async (productData) => {
    return await Producto.create(productData);
};

const updateProduct = async (id, productData) => {
    const product = await Producto.findByPk(id);
    if (!product) return null;
    return await product.update(productData);
};

const deleteProduct = async (id) => {
    const product = await Producto.findByPk(id);
    if (!product) return null;
    await product.destroy();
    return true;
};

module.exports = {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};
