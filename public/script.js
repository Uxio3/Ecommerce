// URL de la Api
const API_URL = 'http://localhost:3000/api/products';

// Ruta del placeholder local (asegúrate de que existe)
const PLACEHOLDER_IMAGE = 'images/placeholder.svg';

// Elementos del DOM
const productsContainer = document.getElementById('products-container');
const loading = document.getElementById('loading');
const errorDiv = document.getElementById('error');
const cartToggle = document.getElementById('cart-toggle');
const cartPanel = document.getElementById('cart-panel');
const closeCart = document.getElementById('close-cart');
const cartItems = document.getElementById('cart-items');
const cartCount = document.getElementById('cart-count');
const cartTotal = document.getElementById('cart-total');
const checkoutBtn = document.getElementById('checkout-btn');
const searchInput = document.getElementById('search-input');

// Carrito (se carga desde localStorage)
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Variable para almacenar todos los productos (sin filtrar)
let allProducts = [];

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
    const imageSrc = product.img_url ? product.img_url : PLACEHOLDER_IMAGE;

    card.innerHTML = `
        <img src="${imageSrc}"
             alt="${product.name}"
             class="product-image"
             onerror="this.onerror=null; this.src='${PLACEHOLDER_IMAGE}'">
        <h2 class="product-name">${product.name}</h2>
        <p class="product-description">${product.description || 'Sin descripción'}</p>
        <div class="product-price">${formatPrice(product.price)}</div>
        <div class="product-stock ${stockClass}">${stockText}</div>
        <button class="add-to-cart" ${!inStock ? 'disabled' : ''} data-product-id="${product.id}">
            ${inStock ? '🛒 Añadir al carrito' : '❌ Sin stock'}
        </button>
    `;

    // Añadir evento al botón "Añadir al carrito"
    const addToCartBtn = card.querySelector('.add-to-cart');
    if (inStock) {
        addToCartBtn.addEventListener('click', () => addToCart(product));
    }

    return card;
}

// Función para añadir un producto al carrito
function addToCart(product) {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
        // Si ya existe, aumentar la cantidad
        existingItem.quantity += 1;
    } else {
        // Si no existe, añadirlo con cantidad 1
        cart.push({
            id: product.id,
            name: product.name,
            price: parseFloat(product.price),
            img_url: product.img_url || PLACEHOLDER_IMAGE,
            quantity: 1
        });
    }
    
    // Guardar en localStorage
    saveCart();
    // Actualizar la UI del carrito
    updateCartUI();
    
    // Feedback visual (opcional - sin abrir el carrito automáticamente)
    // Puedes comentar esta línea si no quieres el alert
    alert(`✅ ${product.name} añadido al carrito`);
}

// Función para guardar el carrito en localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Función para actualizar la UI del carrito
function updateCartUI() {
    // Actualizar contador
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    // Actualizar lista de productos
    cartItems.innerHTML = '';
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p style="text-align: center; color: #666;">Tu carrito está vacío</p>';
        checkoutBtn.disabled = true;
    } else {
        checkoutBtn.disabled = false;
        cart.forEach(item => {
            const cartItem = createCartItem(item);
            cartItems.appendChild(cartItem);
        });
    }
    
    // Actualizar total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = formatPrice(total);
}

// Función para crear un elemento del carrito
function createCartItem(item) {
    const div = document.createElement('div');
    div.className = 'cart-item';
    
    div.innerHTML = `
        <img src="${item.img_url}" alt="${item.name}" class="cart-item-image" onerror="this.onerror=null; this.src='${PLACEHOLDER_IMAGE}'">
        <div class="cart-item-info">
            <div class="cart-item-name">${item.name}</div>
            <div class="cart-item-price">${formatPrice(item.price)}</div>
            <div class="cart-item-controls">
                <button class="quantity-btn" data-action="decrease" data-id="${item.id}">-</button>
                <input type="number" class="quantity-input" value="${item.quantity}" min="1" data-id="${item.id}">
                <button class="quantity-btn" data-action="increase" data-id="${item.id}">+</button>
                <button class="remove-item-btn" data-id="${item.id}">Eliminar</button>
            </div>
        </div>
    `;
    
    // Eventos para los botones
    const decreaseBtn = div.querySelector('[data-action="decrease"]');
    const increaseBtn = div.querySelector('[data-action="increase"]');
    const quantityInput = div.querySelector('.quantity-input');
    const removeBtn = div.querySelector('.remove-item-btn');
    
    decreaseBtn.addEventListener('click', () => updateQuantity(item.id, -1));
    increaseBtn.addEventListener('click', () => updateQuantity(item.id, 1));
    quantityInput.addEventListener('change', (e) => {
        const newQuantity = parseInt(e.target.value);
        if (newQuantity > 0) {
            setQuantity(item.id, newQuantity);
        }
    });
    removeBtn.addEventListener('click', () => removeFromCart(item.id));
    
    return div;
}

// Función para actualizar la cantidad de un producto
function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            saveCart();
            updateCartUI();
        }
    }
}

// Función para establecer una cantidad específica
function setQuantity(productId, quantity) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity = quantity;
        saveCart();
        updateCartUI();
    }
}

// Función para eliminar un producto del carrito
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartUI();
}

// Función para cargar los productos desde la API
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

        // Guardar todos los productos (sin filtrar)
        allProducts = products;

        // Ocultar loading
        loading.style.display = 'none';
        productsContainer.style.display = 'grid';

        // Mostrar productos (con filtros aplicados)
        displayProducts(products); // ✅ Solo esta línea, elimina el código duplicado de abajo

    } catch (error) {
        console.error('Error:', error);
        
        // Ocultar loading y mostrar error
        loading.style.display = 'none';
        productsContainer.style.display = 'none';
        errorDiv.style.display = 'block';
    }
}

// Función para mostrar productos en el grid
function displayProducts(products) {
    // Limpiar el contenedor
    productsContainer.innerHTML = '';

    // Crear y agregar las tarjetas de productos
    if (products.length === 0) {
        productsContainer.innerHTML = '<p style="color: white; text-align: center; grid-column: 1 / -1;">No se encontraron productos</p>';
    } else {
        products.forEach(product => {
            const card = createProductCard(product);
            productsContainer.appendChild(card);
        });
    }
}

// Función para filtrar productos según la búsqueda
function filterProducts() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    // Si no hay término de búsqueda, mostrar todos los productos
    if (searchTerm === '') {
        displayProducts(allProducts);
        return;
    }
    
    // Filtrar productos que coincidan con el término de búsqueda
    const filteredProducts = allProducts.filter(product => {
        // Buscar en el nombre
        const nameMatch = product.name.toLowerCase().includes(searchTerm);
        // Buscar en la descripción
        const descriptionMatch = product.description 
            ? product.description.toLowerCase().includes(searchTerm)
            : false;
        
        return nameMatch || descriptionMatch;
    });
    
    // Mostrar los productos filtrados
    displayProducts(filteredProducts);
}

// Función para abrir el carrito
function openCart() {
    cartPanel.classList.add('open');
    cartOverlay.classList.add('show');
}

// Función para cerrar el carrito
function closeCartPanel() {
    cartPanel.classList.remove('open');
    cartOverlay.classList.remove('show');
}

// Elementos del DOM (añade esta línea si no está)
const cartOverlay = document.getElementById('cart-overlay');

// Eventos del carrito
cartToggle.addEventListener('click', () => {
    openCart();
});

closeCart.addEventListener('click', () => {
    closeCartPanel();
});

// Cerrar el carrito al hacer clic en el overlay
cartOverlay.addEventListener('click', () => {
    closeCartPanel();
});

// Evento del botón "Finalizar Compra"
checkoutBtn.addEventListener('click', async () => {
    // Verificar que el carrito no esté vacío
    if (cart.length === 0) {
        alert('❌ Tu carrito está vacío');
        return;
    }
    
    // Deshabilitar el botón mientras se procesa el pedido
    checkoutBtn.disabled = true;
    checkoutBtn.textContent = 'Procesando...';
    
    try {
        // Transformar el carrito al formato que espera el backend
        // El backend espera: { items: [{ productId: 1, quantity: 2 }, ...] }
        const items = cart.map(item => ({
            productId: item.id,
            quantity: item.quantity
        }));
        
        // Enviar la petición POST al backend
        const response = await fetch('http://localhost:3000/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json' // Indicar que enviamos JSON
            },
            body: JSON.stringify({ items }) // Convertir el objeto a JSON
        });
        
        // Verificar si la respuesta fue exitosa
        if (!response.ok) {
            // Si hay error, obtener el mensaje del backend
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al crear el pedido');
        }
        
        // Si todo salió bien, obtener los datos del pedido creado
        const result = await response.json();
        
        // Mostrar mensaje de éxito
        alert(`✅ Pedido creado correctamente!\n\nID del pedido: ${result.order.id}\nTotal: ${formatPrice(result.order.total)}`);
        
        // Vaciar el carrito
        cart = [];
        saveCart();
        updateCartUI();
        closeCartPanel();
        
        // Recargar los productos para actualizar el stock
        loadProducts();
        
    } catch (error) {
        // Si hay un error, mostrarlo al usuario
        console.error('Error al crear el pedido:', error);
        alert(`❌ Error: ${error.message}`);
    } finally {
        // Rehabilitar el botón siempre (incluso si hubo error)
        checkoutBtn.disabled = false;
        checkoutBtn.textContent = 'Finalizar Compra';
    }
});

// Cargar productos cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    updateCartUI(); // Cargar el carrito desde localStorage
});

// Evento para el campo de búsqueda
searchInput.addEventListener('input', filterProducts);