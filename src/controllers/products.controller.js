// En este fichero se recibe la petición HTTP y se crea la respuesta
const { getAllProducts } = require('../services/products.service');
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

module.exports = {
    getProducts,
};