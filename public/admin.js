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
const productsTab = document.getElementById('products-tab');

// Variable para almacenar todos los pedidos (sin ordenar)
let allOrders = [];

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
                <span class="order-status ${statusClass}">${statusText}</span>
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
    
    return orderCard;
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
        const response = await fetch(`${API_URL}/orders/admin/all`);
        
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
    // Ocultar todas las pestañas
    ordersTab.style.display = 'none';
    productsTab.style.display = 'none';
    
    // Remover clase active de todos los botones
    adminTabs.forEach(tab => tab.classList.remove('active'));
    
    // Mostrar la pestaña seleccionada
    if (tabName === 'orders') {
        ordersTab.style.display = 'block';
        document.querySelector('[data-tab="orders"]').classList.add('active');
    } else if (tabName === 'products') {
        productsTab.style.display = 'block';
        document.querySelector('[data-tab="products"]').classList.add('active');
    }
}

// Event listeners
if (sortSelect) {
    sortSelect.addEventListener('change', handleSortChange);
}

if (searchOrdersInput) {
    searchOrdersInput.addEventListener('input', updateOrdersView);
}

adminTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const tabName = tab.getAttribute('data-tab');
        switchTab(tabName);
    });
});

// Cargar pedidos cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    loadAllOrders();
});