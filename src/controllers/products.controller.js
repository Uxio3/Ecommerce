// En este fichero se recibe la petición HTTP y se crea la respuesta
const { 
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getAllProductsIncludingDeleted,
    restoreProduct,
    getProductsPaginated,
    getAllProductsIncludingDeletedPaginated
} = require('../services/products.service');

// Obtiene los productos y responde con JSON o error
async function getProducts(req, res) {
    try {
        // Verificar si hay parámetros de paginación
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        
        // Si hay parámetros de paginación, usar la versión paginada
        if (req.query.page || req.query.limit) {
            const { getProductsPaginated } = require('../services/products.service');
            const result = await getProductsPaginated(page, limit);
            return res.json(result);
        }
        
        // Si no hay paginación, devolver todos los productos (compatibilidad hacia atrás)
        const products = await getAllProducts();
        res.json(products);
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).json({ error: 'Error al obtener productos' });
    }
}

// Obtiene un producto específico por su ID
async function  getProduct(req, res) {
    try {
        const id = parseInt(req.params.id);
        const product = await getProductById(id);

        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ error: 'Producto no encontrado' });
        }

    } catch (error) {
        console.error('Error al obtener producto:', error);
        res.status(500).json({ error: 'Erroral obtener el producto' });
    }
}

// Crea un nuevo producto con los datos enviados en el body de la petición.
async function  createProductController(req, res) {
    try {
        const productData = req.body;
        const newProduct = await createProduct(productData);
        res.status(201).json(newProduct); // 201 = creado
    } catch (error) {
        console.error('Error al crear el producto:', error);
        res.status(500).json({ error: 'Error al crear el producto' })
    }
}

// Actualiza un producto existente con los datos enviados en el body
async function updateProductController(req, res) {
    try {
        const id = parseInt(req.params.id);
        const productData = req.body;
        const updatedProduct = await updateProduct(id, productData);

        if (updatedProduct) {
            res.json(updatedProduct);
        } else {
            res.status(404).json({ error: 'Producto no encontrado' });
        }

    } catch (error) {
        console.error('Error al actualizar el producto:', error);
        res.status(500).json({ error: 'Error al actualizar el producto' });
    }
}

// Elimina un producto por su ID
async function deleteProductController(req, res) {
    try {
        const id = parseInt(req.params.id);
        const deleted = await deleteProduct(id);
        
        if (deleted) {
            res.status(204).send(); // 204 = No Content (éxito sin cuerpo de respuesta)
        } else {
            res.status(404).json({ error: 'Producto no encontrado' });
        }
    } catch (error) {
        console.error('Error al eliminar el producto:', error);
        // Si es un error de foreign key, dar un mensaje más específico
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            res.status(409).json({ error: 'No se puede eliminar el producto porque tiene pedidos asociados' });
        } else {
            res.status(500).json({ error: 'Error al eliminar el producto' });
        }
    }
}

// Obtiene todos los productos incluyendo eliminados (solo para admin)
async function getAllProductsIncludingDeletedController(req, res) {
    try {
        const { getAllProductsIncludingDeleted } = require('../services/products.service');
        const products = await getAllProductsIncludingDeleted();
        res.json(products);
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).json({ error: 'Error al obtener productos' });
    }
}

// Obtiene todos los productos incluyendo eliminados con paginación (solo para admin)
async function getAllProductsIncludingDeletedPaginatedController(req, res) {
    try {
        const { getAllProductsIncludingDeletedPaginated } = require('../services/products.service');
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const result = await getAllProductsIncludingDeletedPaginated(page, limit);
        res.json(result);
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).json({ error: 'Error al obtener productos' });
    }
}

// Reactiva un producto eliminado
async function restoreProductController(req, res) {
    try {
        const { restoreProduct } = require('../services/products.service');
        const id = parseInt(req.params.id);
        const restored = await restoreProduct(id);
        
        if (restored) {
            res.status(200).json({ success: true, message: 'Producto reactivado correctamente' });
        } else {
            res.status(404).json({ error: 'Producto no encontrado' });
        }
    } catch (error) {
        console.error('Error al reactivar el producto:', error);
        res.status(500).json({ error: 'Error al reactivar el producto' });
    }
}

module.exports = {
    getProducts,
    getProduct,
    createProductController,
    updateProductController,
    deleteProductController,
    getAllProductsIncludingDeletedController,
    getAllProductsIncludingDeletedPaginatedController,
    restoreProductController
};