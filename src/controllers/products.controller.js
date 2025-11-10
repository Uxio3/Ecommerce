// En este fichero se recibe la petición HTTP y se crea la respuesta
const { 
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
} = require('../services/products.service');

// Obtiene los productos y responde con JSON o error
async function getProducts(req, res) {
    try {
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
        res.status(500).json({ error: 'Error al eliminar el producto' });
    }
}

module.exports = {
    getProducts,
    getProduct,
    createProductController,
    updateProductController,
    deleteProductController,
};