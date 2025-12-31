const { Producto, Categoria } = require('../models');
const { Op } = require('sequelize');

// Obtener todos los productos (con filtros)
const getProductos = async (req, res) => {
    try {
        const {
            categoria,
            condicion,
            precioMin,
            precioMax,
            buscar,
            destacados,
            orden = 'recientes',
            pagina = 1,
            limite = 20
        } = req.query;

        const where = { estado: 'activo' };

        // Filtro por categoría (ID o slug)
        if (categoria) {
            if (isNaN(categoria)) {
                // Es un slug, buscar categoría primero
                const cat = await Categoria.findOne({ where: { slug: categoria } });
                if (cat) where.categoriaId = cat.id;
            } else {
                where.categoriaId = categoria;
            }
        }

        // Filtro por condición
        if (condicion) {
            where.condicion = condicion;
        }

        // Filtro por rango de precio
        if (precioMin || precioMax) {
            where.precio = {};
            if (precioMin) where.precio[Op.gte] = parseFloat(precioMin);
            if (precioMax) where.precio[Op.lte] = parseFloat(precioMax);
        }

        // Búsqueda por texto
        if (buscar) {
            where[Op.or] = [
                { nombre: { [Op.like]: `%${buscar}%` } },
                { descripcion: { [Op.like]: `%${buscar}%` } }
            ];
        }

        // Solo destacados
        if (destacados === 'true') {
            where.destacado = true;
        }

        // Ordenamiento
        let order = [['createdAt', 'DESC']]; // Por defecto: más recientes
        switch (orden) {
            case 'precio-asc':
                order = [['precio', 'ASC']];
                break;
            case 'precio-desc':
                order = [['precio', 'DESC']];
                break;
            case 'nombre':
                order = [['nombre', 'ASC']];
                break;
        }

        const offset = (parseInt(pagina) - 1) * parseInt(limite);

        const { count, rows: productos } = await Producto.findAndCountAll({
            where,
            include: [{
                model: Categoria,
                as: 'categoria',
                attributes: ['id', 'nombre', 'slug', 'icono']
            }],
            order,
            limit: parseInt(limite),
            offset
        });

        res.json({
            productos,
            total: count,
            pagina: parseInt(pagina),
            totalPaginas: Math.ceil(count / parseInt(limite))
        });
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).json({ message: 'Error al obtener los productos' });
    }
};

// Obtener producto por ID o slug
const getProducto = async (req, res) => {
    try {
        const { id } = req.params;

        const producto = await Producto.findOne({
            where: isNaN(id) ? { slug: id, estado: 'activo' } : { id, estado: 'activo' },
            include: [{
                model: Categoria,
                as: 'categoria',
                attributes: ['id', 'nombre', 'slug', 'icono']
            }]
        });

        if (!producto) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        res.json(producto);
    } catch (error) {
        console.error('Error al obtener producto:', error);
        res.status(500).json({ message: 'Error al obtener el producto' });
    }
};

// Obtener productos destacados
const getProductosDestacados = async (req, res) => {
    try {
        const { limite = 8 } = req.query;

        const productos = await Producto.findAll({
            where: { estado: 'activo', destacado: true },
            include: [{
                model: Categoria,
                as: 'categoria',
                attributes: ['id', 'nombre', 'slug']
            }],
            order: [['createdAt', 'DESC']],
            limit: parseInt(limite)
        });

        res.json(productos);
    } catch (error) {
        console.error('Error al obtener productos destacados:', error);
        res.status(500).json({ message: 'Error al obtener productos destacados' });
    }
};

// Crear producto (Admin)
const createProducto = async (req, res) => {
    try {
        const {
            nombre,
            descripcion,
            categoriaId,
            precio,
            precioOriginal,
            imagen,
            imagenes,
            condicion,
            talla,
            stock,
            estado,
            destacado
        } = req.body;

        // Verificar que la categoría existe
        const categoria = await Categoria.findByPk(categoriaId);
        if (!categoria) {
            return res.status(400).json({ message: 'La categoría no existe' });
        }

        const producto = await Producto.create({
            nombre,
            descripcion,
            categoriaId,
            precio,
            precioOriginal,
            imagen,
            imagenes: imagenes || [],
            condicion: condicion || 'Bueno',
            talla,
            stock: stock || 1,
            estado: estado || 'activo',
            destacado: destacado || false
        });

        // Recargar con la categoría
        await producto.reload({
            include: [{ model: Categoria, as: 'categoria' }]
        });

        res.status(201).json(producto);
    } catch (error) {
        console.error('Error al crear producto:', error);
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                message: error.errors.map(e => e.message).join(', ')
            });
        }
        res.status(500).json({ message: 'Error al crear el producto' });
    }
};

// Actualizar producto (Admin)
const updateProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const producto = await Producto.findByPk(id);
        if (!producto) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        // Si se cambia la categoría, verificar que existe
        if (updates.categoriaId) {
            const categoria = await Categoria.findByPk(updates.categoriaId);
            if (!categoria) {
                return res.status(400).json({ message: 'La categoría no existe' });
            }
        }

        await producto.update(updates);

        // Recargar con la categoría
        await producto.reload({
            include: [{ model: Categoria, as: 'categoria' }]
        });

        res.json(producto);
    } catch (error) {
        console.error('Error al actualizar producto:', error);
        res.status(500).json({ message: 'Error al actualizar el producto' });
    }
};

// Eliminar producto (Admin) - Soft delete
const deleteProducto = async (req, res) => {
    try {
        const { id } = req.params;

        const producto = await Producto.findByPk(id);
        if (!producto) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        await producto.destroy(); // Soft delete gracias a paranoid: true

        res.json({ message: 'Producto eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar producto:', error);
        res.status(500).json({ message: 'Error al eliminar el producto' });
    }
};

// Obtener todos los productos para Admin (incluye inactivos)
const getProductosAdmin = async (req, res) => {
    try {
        const {
            categoria,
            estado,
            buscar,
            pagina = 1,
            limite = 20
        } = req.query;

        const where = {};

        if (categoria) {
            where.categoriaId = categoria;
        }

        if (estado) {
            where.estado = estado;
        }

        if (buscar) {
            where[Op.or] = [
                { nombre: { [Op.like]: `%${buscar}%` } },
                { descripcion: { [Op.like]: `%${buscar}%` } }
            ];
        }

        const offset = (parseInt(pagina) - 1) * parseInt(limite);

        const { count, rows: productos } = await Producto.findAndCountAll({
            where,
            include: [{
                model: Categoria,
                as: 'categoria',
                attributes: ['id', 'nombre', 'slug']
            }],
            order: [['createdAt', 'DESC']],
            limit: parseInt(limite),
            offset,
            paranoid: false // Incluir productos eliminados
        });

        res.json({
            productos,
            total: count,
            pagina: parseInt(pagina),
            totalPaginas: Math.ceil(count / parseInt(limite))
        });
    } catch (error) {
        console.error('Error al obtener productos (admin):', error);
        res.status(500).json({ message: 'Error al obtener los productos' });
    }
};

module.exports = {
    getProductos,
    getProducto,
    getProductosDestacados,
    createProducto,
    updateProducto,
    deleteProducto,
    getProductosAdmin
};
