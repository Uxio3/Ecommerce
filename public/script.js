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
const priceFilter = document.getElementById('price-filter');
const stockFilter = document.getElementById('stock-filter');
const clearFiltersBtn = document.getElementById('clear-filters');
// Elementos del DOM para el usuario
const userSection = document.getElementById('user-section');
const userNotLogged = document.getElementById('user-not-logged');
const userLogged = document.getElementById('user-logged');
const userNameDisplay = document.getElementById('user-name-display');
const logoutBtn = document.getElementById('logout-btn');

// Función para obtener el usuario actual desde localStorage
function getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
}

// Función para actualizar la UI según el estado del usuario
function updateUserUI() {
    const user = getCurrentUser();
    const adminLink = document.getElementById('admin-link');
    
    if (user) {
        // Usuario logueado: mostrar nombre y botones
        userNameDisplay.textContent = user.name;
        userNotLogged.style.display = 'none';
        userLogged.style.display = 'flex';
        
        // Mostrar enlace de administración solo si el usuario es admin
        if (adminLink) {
            if (user.is_admin) {
                adminLink.style.display = 'inline-block';
            } else {
                adminLink.style.display = 'none';
            }
        }
    } else {
        // Usuario no logueado: mostrar botones de login y registro
        userNotLogged.style.display = 'flex';
        userLogged.style.display = 'none';
        
        // Ocultar enlace de administración
        if (adminLink) {
            adminLink.style.display = 'none';
        }
    }
}

// Función para cerrar sesión
function handleLogout() {
    // Eliminar el usuario de localStorage
    localStorage.removeItem('user');
    
    // Actualizar la UI
    updateUserUI();
    
    // Opcional: mostrar mensaje de confirmación
    alert('Sesión cerrada correctamente');
}

// Event listener para el botón de logout
if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
}

// Actualizar la UI cuando se carga la página
updateUserUI();

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
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => {
        window.location.href = `product-details.html?id=${product.id}`;
    });

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
        addToCartBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Evita que al hacer click en el botón active el click de la tarjeta
            addToCart(product);
        });
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

async function loadProducts() {
    try {
        // Mostrar loading
        loading.style.display = 'block';
        productsContainer.style.display = 'none'; // Ocultar mientras carga
        errorDiv.style.display = 'none';

        // Hacer petición a la Api
        const response = await fetch('http://localhost:3000/api/products');
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const products = await response.json();
        allProducts = products;

        // Ocultar loading y mostrar contenedor
        loading.style.display = 'none';
        productsContainer.style.display = 'grid'; // ✅ Mostrar el contenedor

        // Mostrar productos (con filtros aplicados)
        displayProducts(products);

    } catch (error) {
        console.error('Error:', error);
        
        // Ocultar loading y mostrar error
        loading.style.display = 'none';
        productsContainer.style.display = 'none';
        errorDiv.style.display = 'block';
    }
}

// Función para mostrar productos
function displayProducts(products) {
    if (!productsContainer) {
        console.error('Error: productsContainer no encontrado');
        return;
    }
    
    productsContainer.innerHTML = '';
    
    if (!products || products.length === 0) {
        return;
    }
    
    products.forEach(product => {
        const card = createProductCard(product); // ✅ Cambiar de createAdminProductCard a createProductCard
        productsContainer.appendChild(card);
    });
}

// Función para filtrar productos según la búsqueda y filtros
function filterProducts() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const priceFilterValue = priceFilter.value; // Ej: "0-50", "50-100", etc.
    const stockFilterValue = stockFilter.value; // Ej: "in-stock", "out-of-stock"
    
    // Empezar con todos los productos
    let filteredProducts = [...allProducts];
    
    // Aplicar filtro de búsqueda (nombre o descripción)
    if (searchTerm !== '') {
        filteredProducts = filteredProducts.filter(product => {
            const nameMatch = product.name.toLowerCase().includes(searchTerm);
            const descriptionMatch = product.description 
                ? product.description.toLowerCase().includes(searchTerm)
                : false;
            return nameMatch || descriptionMatch;
        });
    }
    
    // Aplicar filtro de precio
    if (priceFilterValue !== '') {
        filteredProducts = filteredProducts.filter(product => {
            const price = parseFloat(product.price);
            
            switch (priceFilterValue) {
                case '0-50':
                    return price < 50;
                case '50-100':
                    return price >= 50 && price < 100;
                case '100-200':
                    return price >= 100 && price < 200;
                case '200+':
                    return price >= 200;
                default:
                    return true;
            }
        });
    }
    
    // Aplicar filtro de stock
    if (stockFilterValue !== '') {
        filteredProducts = filteredProducts.filter(product => {
            if (stockFilterValue === 'in-stock') {
                return product.stock > 0;
            } else if (stockFilterValue === 'out-of-stock') {
                return product.stock === 0;
            }
            return true;
        });
    }
    
    // Mostrar los productos filtrados
    displayProducts(filteredProducts);
}

// Función para limpiar todos los filtros
function clearFilters() {
    searchInput.value = '';
    priceFilter.value = '';
    stockFilter.value = '';
    filterProducts(); // Aplicar filtros (que mostrará todos los productos)
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
        // El backend espera: { items: [{ productId: 1, quantity: 2 }, ...], userId: 1 }
        const items = cart.map(item => ({
            productId: item.id,
            quantity: item.quantity
        }));
        
        // Obtener el usuario actual (si está logueado)
        const user = getCurrentUser();
        const userId = user ? user.id : null;
        
        // Preparar el body de la petición
        const requestBody = { items };
        if (userId) {
            requestBody.userId = userId;
        }
        
        // Enviar la petición POST al backend
        const response = await fetch('http://localhost:3000/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json' // Indicar que enviamos JSON
            },
            body: JSON.stringify(requestBody) // Convertir el objeto a JSON
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

// Eventos para los filtros
priceFilter.addEventListener('change', filterProducts);
stockFilter.addEventListener('change', filterProducts);
clearFiltersBtn.addEventListener('click', clearFilters);