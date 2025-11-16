# 🛒 Tienda Online - Ecommerce

Una tienda online completa desarrollada con Node.js, Express, MySQL y JavaScript vanilla.

## 📋 Descripción

Este proyecto es una aplicación de ecommerce completa que incluye:
- **Backend**: API REST con Node.js y Express
- **Frontend**: Interfaz web con HTML, CSS y JavaScript vanilla
- **Base de datos**: MySQL para almacenar productos, pedidos y usuarios
- **Carrito de compras**: Funcionalidad completa con localStorage
- **Checkout**: Sistema de pedidos con actualización de stock automática
- **Autenticación**: Sistema de usuarios con registro, login y roles de administrador
- **Panel de administración**: Gestión completa de productos y pedidos
- **Paginación**: Sistema de paginación para mejorar el rendimiento
- **Notificaciones**: Sistema de notificaciones toast para mejor UX

## 🛠️ Tecnologías Utilizadas

### Backend
- **Node.js**: Entorno de ejecución de JavaScript
- **Express**: Framework web para Node.js
- **MySQL2**: Cliente MySQL para Node.js con soporte para promesas
- **dotenv**: Gestión de variables de entorno
- **express-validator**: Validación de datos de entrada
- **cors**: Middleware para habilitar CORS
- **bcrypt**: Hash de contraseñas para seguridad

### Frontend
- **HTML5**: Estructura semántica de las páginas
- **CSS3**: Estilos y diseño responsive (Grid y Flexbox)
- **JavaScript (ES6+)**: Lógica del frontend y consumo de API
- **localStorage**: Almacenamiento local para carrito y sesión de usuario

### Base de Datos
- **MySQL**: Sistema de gestión de bases de datos relacional
- **Foreign Keys**: Relaciones entre tablas para integridad referencial
- **Transacciones**: Para operaciones atómicas (creación de pedidos)

## 📦 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** (versión 18 o superior)
- **npm** (viene incluido con Node.js)
- **MySQL** (o XAMPP que incluye MySQL)
- **Git** (opcional, para clonar el repositorio)

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/Uxio3/Ecommerce.git
cd Ecommerce
```

### 2. Instalar dependencias

```bash
npm install
```

Esto instalará todas las dependencias necesarias:
- express
- mysql2
- dotenv
- cors
- express-validator
- bcrypt

### 3. Configurar la base de datos

#### Opción A: Usando MySQL directamente

1. Abre MySQL Workbench o tu cliente MySQL preferido
2. Crea una nueva base de datos:
   ```sql
   CREATE DATABASE ecommerce_db;
   ```

#### Opción B: Usando XAMPP

1. Inicia XAMPP y activa MySQL
2. Abre phpMyAdmin (http://localhost/phpmyadmin)
3. Crea una nueva base de datos llamada `ecommerce_db`

### 4. Crear las tablas

Ejecuta este SQL en tu cliente MySQL:

```sql
USE ecommerce_db;

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de productos
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    img_url VARCHAR(500),
    deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de pedidos
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    total DECIMAL(10, 2) NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    user_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Tabla de items del pedido
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Crear índice para mejorar consultas
CREATE INDEX idx_products_deleted ON products(deleted);

-- Insertar productos de ejemplo
INSERT INTO products (name, description, price, stock, img_url) VALUES
('Laptop HP', 'Laptop HP 15.6 pulgadas, 8GB RAM, 256GB SSD', 599.99, 10, 'images/placeholder.svg'),
('Mouse Logitech', 'Mouse inalámbrico Logitech MX Master 3', 89.99, 25, 'images/placeholder.svg'),
('Teclado Mecánico', 'Teclado mecánico RGB con switches azules', 129.99, 15, 'images/placeholder.svg'),
('Monitor Samsung', 'Monitor Samsung 27 pulgadas 4K UHD', 349.99, 8, 'images/placeholder.svg'),
('Auriculares Sony', 'Auriculares inalámbricos Sony WH-1000XM4', 279.99, 12, 'images/placeholder.svg');
```

**Nota**: Para crear un usuario administrador, primero regístrate normalmente y luego actualiza manualmente el campo `is_admin` a `TRUE` en la base de datos.

### 5. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:

```env
# Configuración del servidor
PORT=3000

# Configuración de la base de datos MySQL
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=ecommerce_db
```

**Nota**: Ajusta `DB_PASSWORD` si tu MySQL tiene contraseña. Si usas XAMPP sin contraseña, déjalo vacío.

### 6. Crear la imagen placeholder

Crea la carpeta `public/images/` y añade un archivo `placeholder.svg` (o cualquier imagen placeholder).

## ▶️ Ejecutar el Proyecto

### Iniciar el servidor

```bash
npm start
```

O directamente:

```bash
node src/server.js
```

Deberías ver un mensaje indicando que el servidor está corriendo en el puerto 3000.

Abre tu navegador y ve a:

- **Frontend**: http://localhost:3000
- **API de productos**: http://localhost:3000/api/products
- **API de productos por ID**: http://localhost:3000/api/products/1

## 📁 Estructura del Proyecto

```
Ecommerce/
├── src/
│   ├── app.js                    # Configuración de Express (middlewares y rutas)
│   ├── server.js                 # Punto de entrada del servidor
│   ├── config/
│   │   └── database.js           # Configuración de MySQL (connection pool)
│   ├── controllers/
│   │   ├── products.controller.js    # Controladores de productos
│   │   ├── orders.controller.js      # Controladores de pedidos
│   │   └── users.controller.js       # Controladores de usuarios
│   ├── services/
│   │   ├── products.service.js        # Lógica de negocio de productos
│   │   ├── orders.service.js          # Lógica de negocio de pedidos
│   │   └── users.service.js           # Lógica de negocio de usuarios
│   ├── routes/
│   │   ├── products.routes.js         # Rutas de productos
│   │   ├── orders.routes.js           # Rutas de pedidos
│   │   └── users.routes.js            # Rutas de usuarios
│   └── middlewares/
│       ├── auth.middleware.js         # Middleware de autenticación y autorización
│       ├── validation.middleware.js   # Validación de productos
│       ├── order.validation.js        # Validación de pedidos
│       └── user.validation.js         # Validación de usuarios
├── public/
│   ├── index.html                # Página principal (catálogo de productos)
│   ├── admin.html                 # Panel de administración
│   ├── login.html                 # Página de inicio de sesión
│   ├── register.html              # Página de registro
│   ├── orders-history.html        # Historial de pedidos del usuario
│   ├── product-details.html       # Página de detalles de producto
│   ├── script.js                  # JavaScript principal (index.html)
│   ├── admin.js                   # JavaScript del panel de administración
│   ├── auth.js                    # JavaScript de autenticación
│   ├── orders-history.js          # JavaScript del historial de pedidos
│   ├── product-details.js          # JavaScript de detalles de producto
│   ├── toast.js                   # Sistema de notificaciones toast
│   ├── style.css                  # Estilos CSS globales
│   └── images/
│       └── placeholder.svg         # Imagen placeholder
├── .env                           # Variables de entorno (no se sube a Git)
├── .gitignore                     # Archivos ignorados por Git
├── package.json                   # Dependencias del proyecto
└── README.md                      # Este archivo
```

## 📚 Historia del Desarrollo

Este proyecto fue desarrollado paso a paso desde cero, siguiendo una metodología de aprendizaje guiada. A continuación se documentan todos los pasos seguidos:

### Fase 1: Configuración Inicial y Estructura del Proyecto

#### 1.1. Inicialización del Proyecto
- Creación del repositorio Git y conexión con GitHub
- Inicialización de Node.js con `npm init -y`
- Configuración de `.gitignore` para excluir `node_modules`, `.env`, etc.

#### 1.2. Estructura de Carpetas
Se creó una estructura modular siguiendo el patrón MVC:
- `src/` - Código del backend
  - `config/` - Configuración (base de datos)
  - `routes/` - Definición de rutas
  - `controllers/` - Controladores (manejo de peticiones HTTP)
  - `services/` - Servicios (lógica de negocio y acceso a BD)
  - `middlewares/` - Middlewares (validación, autenticación)
- `public/` - Archivos estáticos del frontend

#### 1.3. Instalación de Dependencias
```bash
npm install express mysql2 dotenv cors express-validator bcrypt
```

**Dependencias y su propósito:**
- `express`: Framework web para crear el servidor y rutas
- `mysql2`: Cliente MySQL con soporte para promesas (async/await)
- `dotenv`: Carga variables de entorno desde archivo `.env`
- `cors`: Permite peticiones desde el frontend (mismo origen o diferentes)
- `express-validator`: Valida y sanitiza datos de entrada
- `bcrypt`: Hash de contraseñas para seguridad

### Fase 2: Base de Datos

#### 2.1. Configuración de MySQL
- Creación de la base de datos `ecommerce_db`
- Configuración de conexión usando connection pool (mejor rendimiento)
- Variables de entorno en `.env` para configuración

#### 2.2. Creación de Tablas
Se crearon las siguientes tablas:

**Tabla `products`:**
- `id`: Identificador único (AUTO_INCREMENT)
- `name`: Nombre del producto
- `description`: Descripción del producto
- `price`: Precio (DECIMAL)
- `stock`: Cantidad en stock
- `img_url`: URL de la imagen
- `deleted`: Flag para soft delete (agregado después)
- `deleted_at`: Fecha de eliminación (agregado después)
- `created_at`, `updated_at`: Timestamps automáticos

**Tabla `orders`:**
- `id`: Identificador único
- `total`: Total del pedido
- `status`: Estado (pending, completed, cancelled)
- `user_id`: ID del usuario (NULL si es pedido sin usuario)
- `created_at`, `updated_at`: Timestamps

**Tabla `order_items`:**
- `id`: Identificador único
- `order_id`: Referencia al pedido
- `product_id`: Referencia al producto
- `quantity`: Cantidad del producto
- `unit_price`: Precio unitario al momento del pedido

**Tabla `users`:**
- `id`: Identificador único
- `name`: Nombre del usuario
- `email`: Email (único)
- `password_hash`: Contraseña hasheada con bcrypt
- `is_admin`: Flag para usuarios administradores
- `created_at`: Timestamp de creación

#### 2.3. Relaciones (Foreign Keys)
- `order_items.order_id` → `orders.id` (ON DELETE CASCADE)
- `order_items.product_id` → `products.id`
- `orders.user_id` → `users.id` (ON DELETE SET NULL)

### Fase 3: Backend - API REST

#### 3.1. Servidor Express
- Configuración de `server.js` (punto de entrada)
- Configuración de `app.js` (middlewares y rutas)
- Middlewares globales: CORS, JSON parser, archivos estáticos
- Puerto configurable desde `.env` (default: 3000)

#### 3.2. Sistema de Productos
**Servicio (`products.service.js`):**
- `getAllProducts()`: Obtiene todos los productos activos
- `getProductsPaginated(page, limit)`: Obtiene productos con paginación
- `getProductById(id)`: Obtiene un producto por ID
- `createProduct(productData)`: Crea un nuevo producto
- `updateProduct(id, productData)`: Actualiza un producto
- `deleteProduct(id)`: Soft delete (marca como eliminado)
- `getAllProductsIncludingDeleted()`: Obtiene todos (admin)
- `getAllProductsIncludingDeletedPaginated(page, limit)`: Paginado (admin)
- `restoreProduct(id)`: Reactiva un producto eliminado

**Controlador (`products.controller.js`):**
- `getProducts`: Maneja GET /api/products (con soporte de paginación)
- `getProduct`: Maneja GET /api/products/:id
- `createProductController`: Maneja POST /api/products
- `updateProductController`: Maneja PUT /api/products/:id
- `deleteProductController`: Maneja DELETE /api/products/:id
- `getAllProductsIncludingDeletedController`: Maneja GET /api/products/admin/all
- `getAllProductsIncludingDeletedPaginatedController`: Maneja GET /api/products/admin/all/paginated
- `restoreProductController`: Maneja PUT /api/products/:id/restore

**Rutas (`products.routes.js`):**
- `GET /api/products` - Lista productos (público, con paginación opcional)
- `GET /api/products/:id` - Obtiene un producto (público)
- `POST /api/products` - Crea producto (requiere admin)
- `PUT /api/products/:id` - Actualiza producto (requiere admin)
- `DELETE /api/products/:id` - Elimina producto (requiere admin, soft delete)
- `GET /api/products/admin/all` - Lista todos incluyendo eliminados (requiere admin)
- `GET /api/products/admin/all/paginated` - Lista paginada (requiere admin)
- `PUT /api/products/:id/restore` - Reactiva producto (requiere admin)

**Validación:**
- Nombre: obligatorio, mínimo 3 caracteres
- Descripción: opcional, si existe mínimo 10 caracteres
- Precio: obligatorio, número positivo mayor que 0
- Stock: obligatorio, número entero mayor o igual a 0
- Imagen URL: opcional, acepta URLs completas o rutas relativas

#### 3.3. Sistema de Pedidos
**Servicio (`orders.service.js`):**
- `createOrder(items, userId)`: Crea un pedido con transacción SQL
- `getUserOrders(userId)`: Obtiene pedidos de un usuario
- `getAllOrders()`: Obtiene todos los pedidos (admin)
- `updateOrderStatus(orderId, status)`: Actualiza el estado de un pedido

**Controlador (`orders.controller.js`):**
- `createOrderController`: Maneja POST /api/orders
- `getUserOrdersController`: Maneja GET /api/orders/user/:userId (requiere auth)
- `getAllOrdersController`: Maneja GET /api/orders/admin/all (requiere admin)
- `updateOrderStatusController`: Maneja PUT /api/orders/:id/status (requiere admin)

**Rutas (`orders.routes.js`):**
- `POST /api/orders` - Crea un pedido (público, puede incluir userId)
- `GET /api/orders/user/:userId` - Pedidos de un usuario (requiere auth, solo propios)
- `GET /api/orders/admin/all` - Todos los pedidos (requiere admin)
- `PUT /api/orders/:id/status` - Actualiza estado (requiere admin)

**Características:**
- Uso de transacciones SQL para garantizar consistencia
- Actualización automática de stock al crear pedido
- Almacenamiento de precio unitario al momento del pedido
- Soporte para pedidos con y sin usuario asociado

#### 3.4. Sistema de Usuarios
**Servicio (`users.service.js`):**
- `createUser(userData)`: Crea usuario con contraseña hasheada
- `getUserByEmail(email)`: Busca usuario por email
- `getUserById(id)`: Busca usuario por ID
- `verifyPassword(password, hash)`: Verifica contraseña con bcrypt

**Controlador (`users.controller.js`):**
- `registerController`: Maneja POST /api/users/register
- `loginController`: Maneja POST /api/users/login

**Rutas (`users.routes.js`):**
- `POST /api/users/register` - Registra nuevo usuario
- `POST /api/users/login` - Inicia sesión

**Validación:**
- Nombre: obligatorio, mínimo 3 caracteres
- Email: obligatorio, formato válido, único
- Contraseña: obligatorio, mínimo 6 caracteres

**Seguridad:**
- Contraseñas hasheadas con bcrypt (10 rounds)
- No se devuelve el hash en respuestas
- Campo `is_admin` para control de acceso

### Fase 4: Frontend - Interfaz de Usuario

#### 4.1. Página Principal (`index.html`)
**Características:**
- Header con título y descripción
- Sección de usuario (login/logout dinámico)
- Campo de búsqueda de productos
- Filtros por precio y stock
- Grid de productos responsive
- Carrito de compras (panel lateral)
- Paginación de productos
- Footer con información y enlaces

**JavaScript (`script.js`):**
- Carga de productos desde API (con paginación)
- Búsqueda y filtrado en tiempo real
- Gestión del carrito (agregar, quitar, actualizar cantidad)
- Checkout (crear pedido)
- Gestión de sesión de usuario (localStorage)
- Integración con notificaciones toast

#### 4.2. Páginas de Autenticación
**`login.html` y `register.html`:**
- Formularios con validación
- Manejo de errores y mensajes de éxito
- Redirección automática según estado de login
- Almacenamiento de sesión en localStorage

**JavaScript (`auth.js`):**
- Validación de formularios
- Peticiones a API de autenticación
- Manejo de respuestas y errores
- Redirección después de login/registro

#### 4.3. Historial de Pedidos (`orders-history.html`)
**Características:**
- Lista de pedidos del usuario logueado
- Filtro por fecha (más recientes/antiguos)
- Detalles de cada pedido (items, total, estado)
- Información de usuario y enlaces de navegación

**JavaScript (`orders-history.js`):**
- Verificación de usuario logueado
- Carga de pedidos desde API
- Filtrado y ordenamiento
- Renderizado de tarjetas de pedidos

#### 4.4. Panel de Administración (`admin.html`)
**Características:**
- Pestañas: Pedidos y Productos
- Verificación de acceso admin
- Búsqueda y filtros
- Gestión completa de productos y pedidos

**JavaScript (`admin.js`):**
- Verificación de permisos admin
- Carga de todos los pedidos (con información de usuarios)
- Carga de todos los productos (incluyendo eliminados)
- Crear, editar, eliminar y reactivar productos
- Cambiar estado de pedidos
- Filtros y búsqueda
- Integración con notificaciones toast

#### 4.5. Sistema de Notificaciones (`toast.js`)
**Características:**
- Notificaciones toast reutilizables
- 4 tipos: success, error, info, warning
- Auto-cierre configurable
- Cierre manual con botón X
- Animaciones de entrada/salida
- Responsive

### Fase 5: Protección y Seguridad

#### 5.1. Middleware de Autenticación
**`auth.middleware.js`:**
- `requireAuth`: Verifica que el usuario esté autenticado
- `requireAdmin`: Verifica que el usuario sea administrador
- Uso de header `x-user-id` para identificar usuario

#### 5.2. Protección de Rutas
- Rutas de productos: Crear, actualizar, eliminar requieren admin
- Rutas de pedidos: Ver todos los pedidos requiere admin
- Rutas de usuarios: Ver pedidos propios requiere autenticación
- Validación de que usuarios solo vean sus propios pedidos

#### 5.3. Soft Delete
- Productos no se eliminan físicamente
- Campo `deleted` marca productos eliminados
- Campo `deleted_at` almacena fecha de eliminación
- Función de reactivación para recuperar productos
- Filtros para mostrar activos/eliminados/todos

### Fase 6: Mejoras de UI/UX

#### 6.1. Sistema de Notificaciones Toast
- Reemplazo de `alert()` por notificaciones elegantes
- Mejor experiencia de usuario
- No bloquea la interacción

#### 6.2. Paginación
- Implementada en página principal
- Mejora el rendimiento con muchos productos
- Navegación intuitiva

#### 6.3. Tarjetas Uniformes
- Límite de líneas en título (2) y descripción (3)
- Altura máxima de tarjetas
- Mejor distribución visual

#### 6.4. Footer
- Footer en todas las páginas
- Información de contacto y enlaces
- Diseño responsive

## 🔌 Endpoints de la API

### Productos

| Método | Ruta | Descripción | Autenticación |
|--------|------|-------------|---------------|
| GET | `/api/products` | Lista productos (con paginación opcional) | Público |
| GET | `/api/products/:id` | Obtiene un producto | Público |
| POST | `/api/products` | Crea un producto | Admin |
| PUT | `/api/products/:id` | Actualiza un producto | Admin |
| DELETE | `/api/products/:id` | Elimina un producto (soft delete) | Admin |
| GET | `/api/products/admin/all` | Lista todos incluyendo eliminados | Admin |
| GET | `/api/products/admin/all/paginated` | Lista paginada (admin) | Admin |
| PUT | `/api/products/:id/restore` | Reactiva un producto | Admin |

**Parámetros de paginación (query strings):**
- `page`: Número de página (default: 1)
- `limit`: Items por página (default: 12)

**Ejemplo:**
```
GET /api/products?page=1&limit=12
```

### Pedidos

| Método | Ruta | Descripción | Autenticación |
|--------|------|-------------|---------------|
| POST | `/api/orders` | Crea un pedido | Público |
| GET | `/api/orders/user/:userId` | Pedidos de un usuario | Usuario (solo propios) |
| GET | `/api/orders/admin/all` | Todos los pedidos | Admin |
| PUT | `/api/orders/:id/status` | Actualiza estado del pedido | Admin |

**Body para crear pedido:**
```json
{
  "items": [
    {
      "productId": 1,
      "quantity": 2
    }
  ],
  "userId": 1  // Opcional
}
```

**Body para actualizar estado:**
```json
{
  "status": "completed"  // "pending", "completed", "cancelled"
}
```

### Usuarios

| Método | Ruta | Descripción | Autenticación |
|--------|------|-------------|---------------|
| POST | `/api/users/register` | Registra nuevo usuario | Público |
| POST | `/api/users/login` | Inicia sesión | Público |

**Body para registro:**
```json
{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "password": "password123"
}
```

**Body para login:**
```json
{
  "email": "juan@example.com",
  "password": "password123"
}
```

## 🎯 Funcionalidades Implementadas

### Para Usuarios
- ✅ Ver catálogo de productos
- ✅ Buscar y filtrar productos
- ✅ Ver detalles de productos
- ✅ Agregar productos al carrito
- ✅ Gestionar carrito (agregar, quitar, actualizar cantidad)
- ✅ Realizar pedidos (checkout)
- ✅ Registrarse e iniciar sesión
- ✅ Ver historial de pedidos propios
- ✅ Paginación de productos

### Para Administradores
- ✅ Panel de administración completo
- ✅ Ver todos los pedidos
- ✅ Cambiar estado de pedidos
- ✅ Buscar y filtrar pedidos
- ✅ Ver todos los productos (incluyendo eliminados)
- ✅ Crear productos
- ✅ Editar productos
- ✅ Eliminar productos (soft delete)
- ✅ Reactivar productos eliminados
- ✅ Filtrar productos por estado (activos/eliminados/todos)
- ✅ Búsqueda de productos

## 🔒 Seguridad

- ✅ Contraseñas hasheadas con bcrypt
- ✅ Validación de datos en frontend y backend
- ✅ Middleware de autenticación
- ✅ Middleware de autorización (admin)
- ✅ Protección de rutas sensibles
- ✅ Validación de que usuarios solo vean sus propios pedidos
- ✅ Soft delete para mantener integridad de datos

## 📝 Notas de Desarrollo

### Decisiones Técnicas

1. **Arquitectura Modular**: Se eligió una arquitectura modular (MVC) para facilitar el mantenimiento y escalabilidad.

2. **Connection Pool**: Se usa connection pool de MySQL para mejor rendimiento y gestión de conexiones.

3. **Transacciones SQL**: Se usan transacciones para operaciones críticas (crear pedidos) para garantizar consistencia.

4. **Soft Delete**: Se implementó soft delete para productos para mantener el historial de pedidos intacto.

5. **Paginación**: Se implementó paginación para mejorar el rendimiento cuando hay muchos productos.

6. **localStorage**: Se usa localStorage para el carrito y sesión de usuario (simple pero funcional).

7. **Validación en Capas**: Validación tanto en frontend (UX) como backend (seguridad).

8. **Header de Autenticación**: Se usa header `x-user-id` para identificar usuarios en peticiones (sistema simple, en producción usar JWT).

### Problemas Encontrados y Soluciones

1. **Error de Foreign Key al eliminar productos**: 
   - **Problema**: No se podían eliminar productos con pedidos asociados
   - **Solución**: Implementación de soft delete (campo `deleted`)

2. **Problemas de CSS Grid/Flexbox**: 
   - **Problema**: Tarjetas desalineadas y espacios vacíos
   - **Solución**: Uso de `auto-fit` con `minmax(280px, 1fr)` y límites de altura

3. **Problemas de autenticación**: 
   - **Problema**: Rutas de admin accesibles sin autenticación
   - **Solución**: Implementación de middleware de autenticación y autorización

4. **Problemas de alineación del footer**: 
   - **Problema**: Footer más ancho que el contenido
   - **Solución**: Mover el footer dentro del `.container` en HTML

5. **Problemas con imágenes placeholder**: 
   - **Problema**: Errores infinitos al cargar imágenes externas
   - **Solución**: Creación de imagen placeholder local y manejo de errores

## 🚧 Mejoras Futuras

- [ ] Paginación en panel de admin (productos y pedidos)
- [ ] Subida de imágenes de productos
- [ ] Categorías de productos
- [ ] Sistema de reviews/comentarios
- [ ] Pasarela de pago
- [ ] Sistema de envíos
- [ ] Emails de confirmación
- [ ] Dashboard con estadísticas
- [ ] Exportación de pedidos a CSV/PDF
- [ ] Modo oscuro
- [ ] Tests automatizados
- [ ] Documentación API con Swagger
- [ ] JWT tokens para autenticación más segura
- [ ] Rate limiting
- [ ] Sanitización avanzada de inputs

## 📊 Estado del Proyecto

**Completado**: ~85-90% de las funcionalidades core de una tienda online

El proyecto incluye todas las funcionalidades básicas necesarias para una tienda online funcional. Las mejoras futuras son opcionales y pueden agregarse según necesidades específicas.

## 👤 Autor

Desarrollado como proyecto de aprendizaje guiado.

## 📄 Licencia

ISC

---

**Última actualización**: Noviembre 2025
