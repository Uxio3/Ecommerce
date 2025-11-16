// API base URL
const API_URL = 'http://localhost:3000/api';

// Ruta del placeholder local
const PLACEHOLDER_IMAGE = 'images/placeholder.svg';

// Elementos del DOM
const ordersContainer = document.getElementById('orders-container');
const loading = document.getElementById('loading');
const errorDiv = document.getElementById('error');
const noOrders = document.getElementById('no-orders');
const userSection = document.getElementById('user-section');
const userNotLogged = document.getElementById('user-not-logged');
const userLogged = document.getElementById('user-logged');
const userNameDisplay = document.getElementById('user-name-display');
const logoutBtn = document.getElementById('logout-btn');
const sortContainer = document.getElementById('sort-container');
const sortSelect = document.getElementById('sort-select');

// Variable para almacenar todos los pedidos (sin ordenar)
let allOrders = [];

// Función para obtener el usuario actual desde localStorage
function getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
}

// Función para actualizar la UI según el estado del usuario
function updateUserUI() {
    // Mostrar/ocultar enlace de admin en el footer
    const adminLinkFooter = document.getElementById('admin-link-footer');
    if (adminLinkFooter) {
        const user = getCurrentUser();
        if (user && user.is_admin) {
            adminLinkFooter.style.display = 'block';
        } else {
            adminLinkFooter.style.display = 'none';
        }
    }
}

// Función para cerrar sesión
function handleLogout() {
    localStorage.removeItem('user');
    updateUserUI();
    alert('Sesión cerrada correctamente');
    window.location.href = 'index.html';
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

// Función para crear una tarjeta de pedido
function createOrderCard(order) {
    const orderCard = document.createElement('div');
    orderCard.className = 'order-card';
    
    const statusClass = order.status === 'pending' ? 'status-pending' : 
                       order.status === 'completed' ? 'status-completed' : 'status-cancelled';
    const statusText = order.status === 'pending' ? 'Pendiente' : 
                      order.status === 'completed' ? 'Completado' : 'Cancelado';
    
    orderCard.innerHTML = `
        <div class="order-header">
            <div>
                <h3>Pedido #${order.id}</h3>
                <p class="order-date">${formatDate(order.created_at)}</p>
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
    const sortedOrders = [...orders]; // Crear una copia del array
    
    if (sortBy === 'newest') {
        // Ordenar por fecha descendente (más recientes primero)
        sortedOrders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (sortBy === 'oldest') {
        // Ordenar por fecha ascendente (más antiguos primero)
        sortedOrders.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    }
    
    return sortedOrders;
}

// Función para mostrar los pedidos ordenados
function displayOrders(orders) {
    ordersContainer.innerHTML = ''; // Limpiar contenedor
    
    // Crear una tarjeta para cada pedido
    orders.forEach(order => {
        const orderCard = createOrderCard(order);
        ordersContainer.appendChild(orderCard);
    });
}

// Función para cargar los pedidos del usuario
async function loadUserOrders() {
    const user = getCurrentUser();
    
    // Si no hay usuario, mostrar mensaje
    if (!user) {
        loading.style.display = 'none';
        userNotLogged.style.display = 'flex';
        return;
    }
    
    try {
        // Hacer petición GET al backend
        const response = await fetch(`${API_URL}/orders/user/${user.id}`);
        
        if (!response.ok) {
            throw new Error('Error al cargar los pedidos');
        }
        
        const data = await response.json();
        
        // Ocultar loading
        loading.style.display = 'none';
        
        if (data.success && data.orders && data.orders.length > 0) {
            // Guardar todos los pedidos
            allOrders = data.orders;
            
            // Mostrar el filtro de ordenamiento
            sortContainer.style.display = 'block';
            
            // Ordenar y mostrar los pedidos (por defecto: más recientes primero)
            const sortedOrders = sortOrders(allOrders, 'newest');
            displayOrders(sortedOrders);
            
            // Mostrar el contenedor
            ordersContainer.style.display = 'block';
        } else {
            // No hay pedidos
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
    const sortBy = sortSelect.value;
    const sortedOrders = sortOrders(allOrders, sortBy);
    displayOrders(sortedOrders);
}

// Event listener para el botón de logout
if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
}

// Event listener para el selector de ordenamiento
if (sortSelect) {
    sortSelect.addEventListener('change', handleSortChange);
}

// Cargar pedidos cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    updateUserUI();
    loadUserOrders();
});