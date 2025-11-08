// URL de la Api
const API_URL = 'http://localhost:3000/api/products';

// Elementos del DOM
const productsContainer = document.getElementById('products-container');
const loading = document.getElementById('loading');
const errorDiv = document.getElementById('error');

// Función para formatear el precio
function formatPrice(price) {
    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR'
    }).format(price);
}

// Función para crear una tarjeta de producto
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';

    const inStock = product.stock > 0;
    const stockClass = inStock ? 'in-stock' : 'out-of-stock';
    const stockText = inStock ? `En stock: ${product.stock} unidades` : 'Sin stock';

    card.innerHTML = `
        <img src="${product.img_url || 'https://via.placeholder.com/300'}"
            alt="${product.name}"
            class="product-image"
            onerror="this.src='https://via.placeholder.com/300'">
        <h2 class="product-name">${product.name}</h2>
        <p class="product-description">${product.description || 'Sin descripción'}</p>
        <div class="product-price">${formatPrice(product.price)}</div>
        <div class="product-stock ${stockClass}">${stockText}</div>
        <button class="add-to-cart" ${!inStock ? 'disabled' : ''}>
            ${inStock ? '🛒 Añadir al carrito' : '❌ Sin stock'}
        </button>
    `;

    return card;
}

// Función para cargar los productos desde la Api
async function loadProducts() {
    try {
        // Mostrar loading
        loading.style.display = 'block';
        productsContainer.style.display = 'none';
        errorDiv.style.display = 'none';

        // Hacer petición a la Api
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error('Error al cargar los productos');
        }

        const products = await response.json();

        // Ocultar loading
        loading.style.display = 'none';
        productsContainer.style.display = 'grid';

        // Limpiar el contenedor
        productsContainer.innerHTML = '';

        // Crear y agregar las tarjetas de productos
        if (products.length === 0) {
            productsContainer.innerHTML = '<p style="color: white; text-align: center; grid-column: 1 / -1;">No hay productos disponibles</p>';
        } else {
            products.forEach(product => {
                const card= createElement(product);
                productsContainer.appendChild(card);
            });
        }
    } catch (error) {
        console.error('Error:', error);

        // Ocultar loading y mostrar error
        loading.style.display = 'none';
        productsContainer.style.display = 'none';
        errorDiv.style.display = 'block';
    }
}

// cargar productos cuando secarga la página
document.addEventListener('DOMContentLoaded', loadProducts);