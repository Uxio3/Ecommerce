// API base URL
const API_URL = 'http://localhost:3000/api';

// Ruta del placeholder local
const PLACEHOLDER_IMAGE = 'images/placeholder.svg';

// Elementos del DOM
const ordersContainer = document.getElementById('orders-container');
const loading = document.getElementById('loading');
const errorDiv = document.getElementById('error');
const noOrders = document.getElementById('no-orders');
const sortSelect = document.getElementById('sort-select');
const searchOrdersInput = document.getElementById('search-orders-input');
const adminTabs = document.querySelectorAll('.admin-tab');
const ordersTab = document.getElementById('orders-tab');
// Elementos del DOM para productos
const productsTab = document.getElementById('products-tab');
const addProductBtn = document.getElementById('add-product-btn');
const searchProductsInput = document.getElementById('search-products-input');
const productsContainer = document.getElementById('products-container');
const productsLoading = document.getElementById('products-loading');
const noProducts = document.getElementById('no-products');
const productsError = document.getElementById('products-error');
const showDeletedFilter = document.getElementById('show-deleted-filter');

// Variable para almacenar todos los productos
let allProducts = [];

// Función helper para obtener el header de autenticación
function getAuthHeaders() {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const headers = {
        'Content-Type': 'application/json'
    };
    
    if (user && user.id) {
        headers['x-user-id'] = user.id.toString();
    }
    
    return headers;
}

// Función para verificar si el usuario es administrador
function checkAdminAccess() {
    const user = getCurrentUser();
    
    // Si no hay usuario logueado, redirigir a login
    if (!user) {
        alert('Debes iniciar sesión para acceder al panel de administración');
        window.location.href = 'login.html';
        return false;
    }
    
    // Si el usuario no es admin, redirigir a la página principal
    if (!user.is_admin) {
        alert('No tienes permisos para acceder al panel de administración');
        window.location.href = 'index.html';
        return false;
    }
    
    return true;
}

// Función para formatear el precio
function formatPrice(price) {
    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR'
    }).format(price);
}

// Función para formatear la fecha
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Función para crear una tarjeta de pedido (versión admin con info de usuario)
function createOrderCard(order) {
    const orderCard = document.createElement('div');
    orderCard.className = 'order-card';
    orderCard.setAttribute('data-order-id', order.id);
    
    const statusClass = order.status === 'pending' ? 'status-pending' : 
                       order.status === 'completed' ? 'status-completed' : 'status-cancelled';
    const statusText = order.status === 'pending' ? 'Pendiente' : 
                      order.status === 'completed' ? 'Completado' : 'Cancelado';
    
    // Información del usuario (si existe)
    const userInfo = order.user_id ? 
        `<div class="order-user-info">
            <strong>Cliente:</strong> ${order.user_name} (${order.user_email})
        </div>` : 
        `<div class="order-user-info">
            <strong>Cliente:</strong> <span style="color: #999;">Pedido sin usuario</span>
        </div>`;
    
    orderCard.innerHTML = `
        <div class="order-header">
            <div>
                <h3>Pedido #${order.id}</h3>
                <p class="order-date">${formatDate(order.created_at)}</p>
                ${userInfo}
            </div>
            <div class="order-info">
                <div class="order-status-controls">
                    <label for="status-select-${order.id}">Estado:</label>
                    <select id="status-select-${order.id}" class="status-select" data-order-id="${order.id}">
                        <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pendiente</option>
                        <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Completado</option>
                        <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelado</option>
                    </select>
                    <span class="order-status ${statusClass}">${statusText}</span>
                </div>
                <span class="order-total">Total: ${formatPrice(order.total)}</span>
            </div>
        </div>
        <div class="order-items">
            <h4>Productos:</h4>
            <div class="order-items-list">
                ${order.items.map(item => `
                    <div class="order-item">
                        <img src="${item.product_image || PLACEHOLDER_IMAGE}" 
                             alt="${item.product_name}" 
                             class="order-item-image"
                             onerror="this.onerror=null; this.src='${PLACEHOLDER_IMAGE}'">
                        <div class="order-item-info">
                            <div class="order-item-name">${item.product_name}</div>
                            <div class="order-item-details">
                                Cantidad: ${item.quantity} × ${formatPrice(item.unit_price)} = ${formatPrice(item.unit_price * item.quantity)}
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    // Agregar event listener al selector de estado
    const statusSelect = orderCard.querySelector(`#status-select-${order.id}`);
    if (statusSelect) {
        // Guardar el valor original
        statusSelect.setAttribute('data-original-value', order.status);
        
        statusSelect.addEventListener('change', (e) => {
            handleStatusChange(order.id, e.target.value);
        });
    }
    
    return orderCard;
}

// Función para manejar el cambio de estado de un pedido
async function handleStatusChange(orderId, newStatus) {
    try {
        // Deshabilitar el selector mientras se procesa
        const statusSelect = document.getElementById(`status-select-${orderId}`);
        const originalValue = statusSelect.getAttribute('data-original-value') || statusSelect.value;
        statusSelect.disabled = true;
        
        // Hacer petición PUT al backend
        const response = await fetch(`${API_URL}/orders/${orderId}/status`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ status: newStatus })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al actualizar el estado');
        }
        
        const data = await response.json();
        
        if (data.success) {
            // Actualizar el pedido en allOrders
            const orderIndex = allOrders.findIndex(o => o.id === orderId);
            if (orderIndex !== -1) {
                allOrders[orderIndex].status = newStatus;
                allOrders[orderIndex].updated_at = data.order.updated_at;
            }
            
            // Actualizar la vista
            updateOrdersView();
            
            // Habilitar el selector
            statusSelect.disabled = false;
            statusSelect.setAttribute('data-original-value', newStatus);
            
            // Mostrar mensaje de éxito
            alert(`✅ Estado del pedido #${orderId} actualizado a "${newStatus}"`);
        }
        
    } catch (error) {
        console.error('Error al actualizar el estado:', error);
        alert(`❌ Error: ${error.message}`);
        
        // Restaurar el valor original y habilitar el selector
        const statusSelect = document.getElementById(`status-select-${orderId}`);
        if (statusSelect) {
            statusSelect.value = statusSelect.getAttribute('data-original-value') || 'pending';
            statusSelect.disabled = false;
        }
    }
}

// Función para ordenar los pedidos
function sortOrders(orders, sortBy) {
    const sortedOrders = [...orders];
    
    if (sortBy === 'newest') {
        sortedOrders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (sortBy === 'oldest') {
        sortedOrders.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    }
    
    return sortedOrders;
}

// Función para filtrar pedidos por búsqueda
function filterOrders(orders, searchTerm) {
    if (!searchTerm || searchTerm.trim() === '') {
        return orders;
    }
    
    const term = searchTerm.toLowerCase().trim();
    
    return orders.filter(order => {
        // Buscar por ID de pedido
        if (order.id.toString().includes(term)) {
            return true;
        }
        
        // Buscar por nombre de usuario
        if (order.user_name && order.user_name.toLowerCase().includes(term)) {
            return true;
        }
        
        // Buscar por email de usuario
        if (order.user_email && order.user_email.toLowerCase().includes(term)) {
            return true;
        }
        
        // Buscar por nombre de producto en los items
        if (order.items && order.items.some(item => 
            item.product_name && item.product_name.toLowerCase().includes(term)
        )) {
            return true;
        }
        
        return false;
    });
}

// Función para mostrar los pedidos ordenados
function displayOrders(orders) {
    ordersContainer.innerHTML = '';
    
    if (orders.length === 0) {
        ordersContainer.innerHTML = '<div class="error"><p>No se encontraron pedidos que coincidan con la búsqueda.</p></div>';
        ordersContainer.style.display = 'block';
        return;
    }
    
    orders.forEach(order => {
        const orderCard = createOrderCard(order);
        ordersContainer.appendChild(orderCard);
    });
}

// Función para actualizar la vista (búsqueda + ordenamiento)
function updateOrdersView() {
    const searchTerm = searchOrdersInput ? searchOrdersInput.value : '';
    const sortBy = sortSelect ? sortSelect.value : 'newest';
    
    // Filtrar pedidos
    let filteredOrders = filterOrders(allOrders, searchTerm);
    
    // Ordenar pedidos
    const sortedOrders = sortOrders(filteredOrders, sortBy);
    
    // Mostrar pedidos
    displayOrders(sortedOrders);
}

// Función para cargar todos los pedidos
async function loadAllOrders() {
    try {
        const response = await fetch(`${API_URL}/orders/admin/all`, {
            headers: getAuthHeaders()
        });
        
        if (!response.ok) {
            throw new Error('Error al cargar los pedidos');
        }
        
        const data = await response.json();
        
        loading.style.display = 'none';
        
        if (data.success && data.orders && data.orders.length > 0) {
            allOrders = data.orders;
            
            // Usar updateOrdersView en lugar de displayOrders directamente
            updateOrdersView();
            
            ordersContainer.style.display = 'block';
        } else {
            noOrders.style.display = 'block';
        }
        
    } catch (error) {
        console.error('Error al cargar pedidos:', error);
        loading.style.display = 'none';
        errorDiv.style.display = 'block';
    }
}


// Función para manejar el cambio de ordenamiento
function handleSortChange() {
    updateOrdersView();
}

// Función para cambiar de pestaña
function switchTab(tabName) {
    console.log('Cambiando a pestaña:', tabName);
    
    // Ocultar todas las pestañas usando clases
    if (ordersTab) {
        ordersTab.classList.remove('active');
    }
    
    if (productsTab) {
        productsTab.classList.remove('active');
    }
    
    // Remover clase active de todos los botones
    adminTabs.forEach(tab => tab.classList.remove('active'));
    
    // Mostrar la pestaña seleccionada
    if (tabName === 'orders') {
        if (ordersTab) {
            ordersTab.classList.add('active');
        }
        document.querySelector('[data-tab="orders"]')?.classList.add('active');
        // Cargar pedidos cuando se cambia a esta pestaña
        loadAllOrders();
    } else if (tabName === 'products') {
        if (productsTab) {
            productsTab.classList.add('active');
        }
        document.querySelector('[data-tab="products"]')?.classList.add('active');
        
        // Esperar a que la pestaña esté visible antes de cargar productos
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                loadAllProducts();
            });
        });
    }
    
    console.log('ordersTab tiene active:', ordersTab?.classList.contains('active'));
    console.log('productsTab tiene active:', productsTab?.classList.contains('active'));
}

// Función para obtener el usuario actual desde localStorage
function getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
}

async function loadAllProducts() {
    // Verificar que los elementos del DOM existen
    if (!productsLoading || !productsContainer || !productsError || !noProducts) {
        console.error('Error: Elementos del DOM de productos no encontrados');
        return;
    }
    
    try {
        // Mostrar loading
        setLoading(productsLoading, true);
        productsError.style.display = 'none';
        noProducts.style.display = 'none';
        productsContainer.innerHTML = '';
        
        // Cargar todos los productos (incluyendo eliminados) desde la ruta de admin
        const response = await fetch(`${API_URL}/products/admin/all`, {
            headers: getAuthHeaders()
        });
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const products = await response.json();
        
        // Ocultar loading
        setLoading(productsLoading, false);
        
        if (products && Array.isArray(products) && products.length > 0) {
            // Guardar todos los productos
            allProducts = products;
            
            // Aplicar filtros y mostrar
            updateProductsView();
        } else {
            noProducts.style.display = 'block';
        }
        
    } catch (error) {
        console.error('Error al cargar productos:', error);
        productsLoading.style.display = 'none';
        productsError.style.display = 'block';
        productsError.textContent = `Error: ${error.message}`;
    }
}

// Función para crear una tarjeta de producto (versión admin)
function createAdminProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.setAttribute('data-product-id', product.id);
    
    // Si el producto está eliminado, agregar clase especial
    if (product.deleted === 1 || product.deleted === true) {
        card.classList.add('product-deleted');
    }
    
    const inStock = product.stock > 0;
    const stockClass = inStock ? 'in-stock' : 'out-of-stock';
    const stockText = inStock ? `En stock: ${product.stock} unidades` : 'Sin stock';
    
    // Determinar qué botones mostrar
    const isDeleted = product.deleted === 1 || product.deleted === true;
    
    card.innerHTML = `
        <img src="${product.img_url || PLACEHOLDER_IMAGE}" 
             alt="${product.name}" 
             class="product-image"
             onerror="this.onerror=null; this.src='${PLACEHOLDER_IMAGE}'">
        <div class="product-name">${product.name}</div>
        <div class="product-description">${product.description || 'Sin descripción'}</div>
        <div class="product-price">${formatPrice(product.price)}</div>
        <div class="product-stock ${stockClass}">${stockText}</div>
        ${isDeleted ? '<div class="product-deleted-badge">🗑️ Eliminado</div>' : ''}
        <div class="admin-product-actions">
            ${isDeleted 
                ? `<button class="btn btn-primary btn-small restore-product-btn" data-product-id="${product.id}">♻️ Reactivar</button>`
                : `<button class="btn btn-primary btn-small edit-product-btn" data-product-id="${product.id}">✏️ Editar</button>
                   <button class="btn btn-secondary btn-small delete-product-btn" data-product-id="${product.id}">🗑️ Eliminar</button>`
            }
        </div>
    `;
    
    // Agregar event listeners
    const editBtn = card.querySelector('.edit-product-btn');
    const deleteBtn = card.querySelector('.delete-product-btn');
    const restoreBtn = card.querySelector('.restore-product-btn');
    
    if (editBtn) {
        editBtn.addEventListener('click', () => handleEditProduct(product.id));
    }
    
    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => handleDeleteProduct(product.id));
    }
    
    if (restoreBtn) {
        restoreBtn.addEventListener('click', () => handleRestoreProduct(product.id));
    }
    
    return card;
}

// Función para mostrar productos
function displayProducts(products) {
    console.log('displayProducts llamada con:', products);
    
    if (!productsContainer) {
        console.error('Error: productsContainer no encontrado');
        return;
    }
    
    productsContainer.innerHTML = '';
    
    if (!products || products.length === 0) {
        console.log('No hay productos para mostrar');
        return;
    }
    
    console.log('Creando tarjetas para', products.length, 'productos');
    
    // Crear y agregar tarjetas
    products.forEach((product) => {
        const card = createAdminProductCard(product);
        productsContainer.appendChild(card);
    });
    
    console.log('Productos mostrados correctamente');
}

// Función para filtrar productos
function filterProducts(products, searchTerm) {
    if (!searchTerm || searchTerm.trim() === '') {
        return products;
    }
    
    const term = searchTerm.toLowerCase().trim();
    
    return products.filter(product => {
        return (product.name && product.name.toLowerCase().includes(term)) ||
               (product.description && product.description.toLowerCase().includes(term));
    });
}

// Función para actualizar la vista de productos (aplicar filtros)
function updateProductsView() {
    if (!allProducts || allProducts.length === 0) {
        return;
    }
    
    let filteredProducts = [...allProducts];
    
    // Aplicar filtro de búsqueda
    const searchTerm = searchProductsInput ? searchProductsInput.value.toLowerCase().trim() : '';
    if (searchTerm !== '') {
        filteredProducts = filteredProducts.filter(product => {
            const nameMatch = product.name.toLowerCase().includes(searchTerm);
            const descriptionMatch = product.description 
                ? product.description.toLowerCase().includes(searchTerm)
                : false;
            return nameMatch || descriptionMatch;
        });
    }
    
    // Aplicar filtro de productos eliminados
    if (showDeletedFilter) {
        const filterValue = showDeletedFilter.value;
        if (filterValue === 'active') {
            filteredProducts = filteredProducts.filter(p => !p.deleted || p.deleted === 0);
        } else if (filterValue === 'deleted') {
            filteredProducts = filteredProducts.filter(p => p.deleted === 1 || p.deleted === true);
        }
        // Si es 'all', no filtramos
    }
    
    // Mostrar productos filtrados
    displayProducts(filteredProducts);
}

// Función para manejar la edición de producto
async function handleEditProduct(productId) {
    try {
        // Cargar los datos del producto
        const response = await fetch(`${API_URL}/products/${productId}`, {
            headers: getAuthHeaders()
        });
        
        if (!response.ok) {
            throw new Error('Error al cargar el producto');
        }
        
        const product = await response.json();
        
        // Llenar el formulario con los datos del producto
        document.getElementById('product-name').value = product.name || '';
        document.getElementById('product-description').value = product.description || '';
        document.getElementById('product-price').value = product.price || '';
        document.getElementById('product-stock').value = product.stock || '';
        document.getElementById('product-img-url').value = product.img_url || '';
        
        // Cambiar el título del modal
        document.getElementById('modal-title').textContent = 'Editar Producto';
        
        // Guardar el ID del producto en el formulario
        document.getElementById('product-form').setAttribute('data-product-id', productId);
        
        // Mostrar el modal
        document.getElementById('product-modal').style.display = 'flex';
        
    } catch (error) {
        console.error('Error al cargar el producto:', error);
        toast.error(`Error: ${error.message}`);
    }
}

// Función para reactivar un producto eliminado
async function handleRestoreProduct(productId) {
    if (!confirm(`¿Estás seguro de que quieres reactivar este producto?`)) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/products/${productId}/restore`, {
            method: 'PUT',
            headers: getAuthHeaders()
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al reactivar el producto');
        }
        
        // Recargar los productos
        await loadAllProducts();
        
        toast.success('Producto reactivado correctamente');
        
    } catch (error) {
        console.error('Error al reactivar producto:', error);
        alert(`❌ Error: ${error.message}`);
    }
}

// Función para manejar la eliminación de producto
async function handleDeleteProduct(productId) {
    if (!confirm(`¿Estás seguro de que quieres eliminar este producto?`)) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/products/${productId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al eliminar el producto');
        }
        
        // Recargar los productos
        await loadAllProducts();
        
        toast.success('Producto eliminado correctamente');
        
    } catch (error) {
        console.error('Error al eliminar producto:', error);
        toast.error(`Error: ${error.message}`);
    }
}

// Función para manejar el agregar producto
function handleAddProduct() {
    // Limpiar el formulario
    document.getElementById('product-form').reset();
    document.getElementById('product-form').removeAttribute('data-product-id');
    document.getElementById('form-error').style.display = 'none';
    
    // Cambiar el título del modal
    document.getElementById('modal-title').textContent = 'Agregar Producto';
    
    // Mostrar el modal
    document.getElementById('product-modal').style.display = 'flex';
}

// Función para cerrar el modal
function closeModal() {
    document.getElementById('product-modal').style.display = 'none';
    document.getElementById('product-form').reset();
    document.getElementById('form-error').style.display = 'none';
    document.getElementById('product-form').removeAttribute('data-product-id');
}

// Función para manejar el envío del formulario
async function handleProductFormSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const productId = form.getAttribute('data-product-id');
    const isEditing = !!productId;
    
    // Obtener los datos del formulario
    const productData = {
        name: document.getElementById('product-name').value.trim(),
        description: document.getElementById('product-description').value.trim(),
        price: parseFloat(document.getElementById('product-price').value),
        stock: parseInt(document.getElementById('product-stock').value),
        img_url: document.getElementById('product-img-url').value.trim() || 'images/placeholder.svg'
    };
    
    // Validación básica
    if (!productData.name || productData.price < 0 || productData.stock < 0) {
        const errorDiv = document.getElementById('form-error');
        errorDiv.textContent = 'Por favor, completa todos los campos correctamente.';
        errorDiv.style.display = 'block';
        return;
    }
    
    // Ocultar error anterior
    document.getElementById('form-error').style.display = 'none';
    
    // Deshabilitar el botón de guardar
    const saveBtn = document.getElementById('save-btn');
    saveBtn.disabled = true;
    saveBtn.textContent = 'Guardando...';
    
    try {
        const url = isEditing 
            ? `${API_URL}/products/${productId}`
            : `${API_URL}/products`;
        
        const method = isEditing ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: getAuthHeaders(),
            body: JSON.stringify(productData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            
            // Crear un error con los detalles de validación
            const error = new Error(errorData.error || 'Error al guardar el producto');
            if (errorData.details) {
                error.details = errorData.details;
            }
            throw error;
        }
        
        const savedProduct = await response.json();
        
        // Cerrar el modal
        closeModal();
        
        // Recargar los productos
        await loadAllProducts();
        
        // Mostrar mensaje de éxito
        toast.success(`Producto ${isEditing ? 'actualizado' : 'creado'} correctamente`);
        
    } catch (error) {
        console.error('Error al guardar el producto:', error);
        const errorDiv = document.getElementById('form-error');
        
        // Si el error tiene detalles de validación, mostrarlos
        if (error.details && Array.isArray(error.details)) {
            const errorMessages = error.details.map(err => err.msg).join('<br>');
            errorDiv.innerHTML = errorMessages;
        } else {
            toast.error(error.message || 'Error al guardar el producto');
        }
        
        errorDiv.style.display = 'block';
    } finally {
        // Rehabilitar el botón
        saveBtn.disabled = false;
        saveBtn.textContent = 'Guardar';
    }
}

// Función para mostrar/ocultar loading con animación
function setLoading(element, isLoading) {
    if (!element) return;
    
    if (isLoading) {
        element.style.display = 'block';
        element.style.opacity = '0';
        setTimeout(() => {
            element.style.transition = 'opacity 0.3s ease';
            element.style.opacity = '1';
        }, 10);
    } else {
        element.style.transition = 'opacity 0.3s ease';
        element.style.opacity = '0';
        setTimeout(() => {
            element.style.display = 'none';
        }, 300);
    }
}

// Event listeners
if (sortSelect) {
    sortSelect.addEventListener('change', handleSortChange);
}

if (searchOrdersInput) {
    searchOrdersInput.addEventListener('input', updateOrdersView);
}

// Event listeners para productos
if (addProductBtn) {
    addProductBtn.addEventListener('click', handleAddProduct);
}

if (searchProductsInput) {
    searchProductsInput.addEventListener('input', updateProductsView);
}

adminTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const tabName = tab.getAttribute('data-tab');
        switchTab(tabName);
    });
});

// Cargar pedidos cuando se carga la página (solo si estamos en la pestaña de pedidos)
document.addEventListener('DOMContentLoaded', () => {
    // Verificar acceso de administrador antes de cargar
    if (checkAdminAccess()) {
        // Solo cargar pedidos si la pestaña de pedidos está activa
        if (ordersTab && ordersTab.classList.contains('active')) {
            loadAllOrders();
        }
    }
});

// Event listeners para el modal
const productModal = document.getElementById('product-modal');
const closeModalBtn = document.getElementById('close-modal');
const cancelBtn = document.getElementById('cancel-btn');
const productForm = document.getElementById('product-form');

if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeModal);
}

if (cancelBtn) {
    cancelBtn.addEventListener('click', closeModal);
}

// Cerrar modal al hacer clic fuera de él
if (productModal) {
    productModal.addEventListener('click', (e) => {
        if (e.target === productModal) {
            closeModal();
        }
    });
}

// Manejar el envío del formulario
if (productForm) {
    productForm.addEventListener('submit', handleProductFormSubmit);
}

// Cerrar modal con la tecla Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && productModal && productModal.style.display === 'flex') {
        closeModal();
    }
});

// Event listener para el filtro de productos eliminados
if (showDeletedFilter) {
    showDeletedFilter.addEventListener('change', updateProductsView);
}