const { Categoria, Producto } = require('../models');

// Obtener todas las categorías activas
const getCategorias = async (req, res) => {
    try {
        const categorias = await Categoria.scope('activas').findAll();
        res.json(categorias);
    } catch (error) {
        console.error('Error al obtener categorías:', error);
        res.status(500).json({ message: 'Error al obtener las categorías' });
    }
};

// Obtener categoría por ID o slug
const getCategoria = async (req, res) => {
    try {
        const { id } = req.params;

        // Buscar por ID o slug
        const categoria = await Categoria.findOne({
            where: isNaN(id) ? { slug: id } : { id },
            include: [{
                model: Producto,
                as: 'productos',
                where: { estado: 'activo' },
                required: false,
                limit: 20
            }]
        });

        if (!categoria) {
            return res.status(404).json({ message: 'Categoría no encontrada' });
        }

        res.json(categoria);
    } catch (error) {
        console.error('Error al obtener categoría:', error);
        res.status(500).json({ message: 'Error al obtener la categoría' });
    }
};

// Crear categoría (Admin)
const createCategoria = async (req, res) => {
    try {
        const { nombre, descripcion, imagen, icono, orden } = req.body;

        const categoria = await Categoria.create({
            nombre,
            descripcion,
            imagen,
            icono,
            orden: orden || 0
        });

        res.status(201).json(categoria);
    } catch (error) {
        console.error('Error al crear categoría:', error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ message: 'Ya existe una categoría con ese nombre' });
        }
        res.status(500).json({ message: 'Error al crear la categoría' });
    }
};

// Actualizar categoría (Admin)
const updateCategoria = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion, imagen, icono, orden, activo } = req.body;

        const categoria = await Categoria.findByPk(id);
        if (!categoria) {
            return res.status(404).json({ message: 'Categoría no encontrada' });
        }

        await categoria.update({
            nombre: nombre || categoria.nombre,
            descripcion: descripcion !== undefined ? descripcion : categoria.descripcion,
            imagen: imagen !== undefined ? imagen : categoria.imagen,
            icono: icono || categoria.icono,
            orden: orden !== undefined ? orden : categoria.orden,
            activo: activo !== undefined ? activo : categoria.activo
        });

        res.json(categoria);
    } catch (error) {
        console.error('Error al actualizar categoría:', error);
        res.status(500).json({ message: 'Error al actualizar la categoría' });
    }
};

// Eliminar categoría (Admin)
const deleteCategoria = async (req, res) => {
    try {
        const { id } = req.params;

        const categoria = await Categoria.findByPk(id);
        if (!categoria) {
            return res.status(404).json({ message: 'Categoría no encontrada' });
        }

        // Verificar si tiene productos asociados
        const productosCount = await Producto.count({ where: { categoriaId: id } });
        if (productosCount > 0) {
            return res.status(400).json({
                message: `No se puede eliminar. Hay ${productosCount} producto(s) en esta categoría`
            });
        }

        await categoria.destroy();
        res.json({ message: 'Categoría eliminada correctamente' });
    } catch (error) {
        console.error('Error al eliminar categoría:', error);
        res.status(500).json({ message: 'Error al eliminar la categoría' });
    }
};

module.exports = {
    getCategorias,
    getCategoria,
    createCategoria,
    updateCategoria,
    deleteCategoria
};
