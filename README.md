# 🛒 Tienda Online - Ecommerce

Una tienda online básica desarrollada con Node.js, Express, MySQL y JavaScript vanilla.

## 📋 Descripción

Este proyecto es una aplicación de ecommerce completa que incluye:
- **Backend**: API REST con Node.js y Express
- **Frontend**: Interfaz web con HTML, CSS y JavaScript vanilla
- **Base de datos**: MySQL para almacenar productos y pedidos
- **Carrito de compras**: Funcionalidad completa con localStorage
- **Checkout**: Sistema de pedidos con actualización de stock automática

## 🛠️ Tecnologías Utilizadas

### Backend
- **Node.js**: Entorno de ejecución de JavaScript
- **Express**: Framework web para Node.js
- **MySQL2**: Cliente MySQL para Node.js
- **dotenv**: Gestión de variables de entorno
- **express-validator**: Validación de datos
- **cors**: Middleware para habilitar CORS

### Frontend
- **HTML5**: Estructura de la página
- **CSS3**: Estilos y diseño responsive
- **JavaScript (ES6+)**: Lógica del frontend y consumo de API

### Base de Datos
- **MySQL**: Sistema de gestión de bases de datos relacional

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

-- Tabla de productos
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    img_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de pedidos
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    total DECIMAL(10, 2) NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
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

-- Insertar productos de ejemplo
INSERT INTO products (name, description, price, stock, img_url) VALUES
('Laptop HP', 'Laptop HP 15.6 pulgadas, 8GB RAM, 256GB SSD', 599.99, 10, 'images/placeholder.svg'),
('Mouse Logitech', 'Mouse inalámbrico Logitech MX Master 3', 89.99, 25, 'images/placeholder.svg'),
('Teclado Mecánico', 'Teclado mecánico RGB con switches azules', 129.99, 15, 'images/placeholder.svg'),
('Monitor Samsung', 'Monitor Samsung 27 pulgadas 4K UHD', 349.99, 8, 'images/placeholder.svg'),
('Auriculares Sony', 'Auriculares inalámbricos Sony WH-1000XM4', 279.99, 12, 'images/placeholder.svg');
```

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

Deberías ver:

npm installr a la aplicación

Abre tu navegador y ve a:

- **Frontend**: http://localhost:3000
- **API de productos**: http://localhost:3000/api/products
- **API de productos por ID**: http://localhost:3000/api/products/1

## 📁 Estructura del Proyecto
Ecommerce/
├── src/
│   ├── app.js                    # Configuración de Express
│   ├── server.js                 # Punto de entrada del servidor
│   ├── config/
│   │   └── database.js           # Configuración de MySQL
│   ├── controllers/
│   │   ├── products.controller.js
│   │   └── orders.controller.js
│   ├── services/
│   │   ├── products.service.js
│   │   └── orders.service.js
│   ├── routes/
│   │   ├── products.routes.js
│   │   └── orders.routes.js
│   └── middlewares/
│       ├── validation.middleware.js
│       └── order.validation.js
├── public/
│   ├── index.html                # Página principal
│   ├── product-details.html      # Página de detalles
│   ├── script.js                 # JavaScript principal
│   ├── product-details.js        # JavaScript de detalles
│   ├── style.css                 # Estilos CSS
│   └── images/
│       └── placeholder.svg       # Imagen placeholder
├── .env                          # Variables de entorno (no se sube a Git)
├── .gitignore                    # Archivos ignorados por Git
├── package.json                  # Dependencias del proyecto
└── README.md                     # Este archivo