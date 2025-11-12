// URL de la API
const API_URL = 'http://localhost:3000/api/products';

// Ruta del placeholder local
const PLACEHOLDER_IMAGE = 'images/placeholder.svg';

// Elementos del DOM
const loading = document.getElementById('loading');
const productDetails = document.getElementById('product-details');
const errorDiv = document.getElementById('error');

// Elementos del carrito
const cartToggle = document.getElementById('cart-toggle');
const cartPanel = document.getElementById('cart-panel');
const closeCart = document.getElementById('close-cart');
const cartItems = document.getElementById('cart-items');
const cartCount = document.getElementById('cart-count');
const cartTotal = document.getElementById('cart-total');
const checkoutBtn = document.getElementById('checkout-btn');
const cartOverlay = document.getElementById('cart-overlay');

// Carrito (se carga desde localStorage)
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Función para formatear el precio
function formatPrice(price) {
    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR'
    }).format(price);
}

// Función para obtener el ID del producto de la URL
function getProductIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
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

// Función para añadir un producto al carrito
function addToCart(product) {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: parseFloat(product.price),
            img_url: product.img_url || PLACEHOLDER_IMAGE,
            quantity: 1
        });
    }
    
    saveCart();
    updateCartUI();
    alert(`✅ ${product.name} añadido al carrito`);
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

// Función para cargar los detalles del producto
async function loadProductDetails() {
    try {
        // Obtener el ID del producto de la URL
        const productId = getProductIdFromURL();
        
        if (!productId) {
            throw new Error('ID de producto no encontrado en la URL');
        }

        // Mostrar loading
        loading.style.display = 'block';
        productDetails.style.display = 'none';
        errorDiv.style.display = 'none';

        // Hacer petición a la API
        const response = await fetch(`${API_URL}/${productId}`);

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Producto no encontrado');
            }
            throw new Error('Error al cargar el producto');
        }

        const product = await response.json();

        // Ocultar loading
        loading.style.display = 'none';
        productDetails.style.display = 'block';

        // Mostrar los detalles del producto
        displayProductDetails(product);

    } catch (error) {
        console.error('Error:', error);
        
        // Ocultar loading y mostrar error
        loading.style.display = 'none';
        productDetails.style.display = 'none';
        errorDiv.style.display = 'block';
        errorDiv.innerHTML = `❌ ${error.message}`;
    }
}

// Función para mostrar los detalles del producto
function displayProductDetails(product) {
    const inStock = product.stock > 0;
    const stockClass = inStock ? 'in-stock' : 'out-of-stock';
    const stockText = inStock ? `En stock: ${product.stock} unidades` : 'Sin stock';
    const imageSrc = product.img_url ? product.img_url : PLACEHOLDER_IMAGE;

    productDetails.innerHTML = `
        <div class="product-details-container">
            <div class="product-details-image">
                <img src="${imageSrc}"
                     alt="${product.name}"
                     class="product-details-img"
                     onerror="this.onerror=null; this.src='${PLACEHOLDER_IMAGE}'">
            </div>
            <div class="product-details-info">
                <h1 class="product-details-name">${product.name}</h1>
                <div class="product-details-price">${formatPrice(product.price)}</div>
                <div class="product-details-stock ${stockClass}">${stockText}</div>
                <div class="product-details-description">
                    <h3>Descripción</h3>
                    <p>${product.description || 'Sin descripción disponible'}</p>
                </div>
                <button class="product-details-add-to-cart" ${!inStock ? 'disabled' : ''} id="add-to-cart-btn">
                    ${inStock ? '🛒 Añadir al carrito' : '❌ Sin stock'}
                </button>
            </div>
        </div>
    `;

    // Añadir evento al botón "Añadir al carrito"
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    if (inStock) {
        addToCartBtn.addEventListener('click', () => addToCart(product));
    }
}

// Eventos del carrito
cartToggle.addEventListener('click', () => {
    openCart();
});

closeCart.addEventListener('click', () => {
    closeCartPanel();
});

cartOverlay.addEventListener('click', () => {
    closeCartPanel();
});

checkoutBtn.addEventListener('click', async () => {
    if (cart.length === 0) {
        alert('❌ Tu carrito está vacío');
        return;
    }
    
    checkoutBtn.disabled = true;
    checkoutBtn.textContent = 'Procesando...';
    
    try {
        const items = cart.map(item => ({
            productId: item.id,
            quantity: item.quantity
        }));
        
        const response = await fetch('http://localhost:3000/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ items })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al crear el pedido');
        }
        
        const result = await response.json();
        
        alert(`✅ Pedido creado correctamente!\n\nID del pedido: ${result.order.id}\nTotal: ${formatPrice(result.order.total)}`);
        
        cart = [];
        saveCart();
        updateCartUI();
        closeCartPanel();
        
        // Recargar los productos para actualizar el stock
        window.location.reload();
        
    } catch (error) {
        console.error('Error al crear el pedido:', error);
        alert(`❌ Error: ${error.message}`);
    } finally {
        checkoutBtn.disabled = false;
        checkoutBtn.textContent = 'Finalizar Compra';
    }
});

// Cargar detalles del producto y actualizar carrito cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    loadProductDetails();
    updateCartUI(); // Cargar el carrito desde localStorage
});