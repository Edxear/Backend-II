# 📐 Convenciones y Buenas Prácticas - Backend II

## Estructura del Proyecto

```
src/
├── config/              # Configuración de la app y servicios externos
│   ├── config.js       # Variables de entorno
│   ├── db.js           # Conexión MongoDB
│   └── passport.js     # Autenticación
├── controllers/        # Lógica de negocio y handlers
│   ├── productController.js
│   └── cartController.js
├── dao/               # Data Access Objects (acceso directo a BD)
│   ├── models/        # Schemas de Mongoose
│   ├── productDBManager.js
│   ├── cartDBManager.js
│   └── userDBManager.js
├── repositories/      # Abstracción de acceso a datos (Repository Pattern)
│   ├── ProductRepository.js
│   ├── CartRepository.js
│   ├── TicketRepository.js
│   └── UserRepository.js
├── routes/            # Definición de endpoints
│   ├── productRouter.js
│   ├── cartRouter.js
│   ├── viewsRouter.js
│   └── sessionsRouter.js
├── services/          # Servicios externos (Email, SMS, etc)
│   └── emailService.js
├── middleware/        # Middlewares (auth, validation, etc)
│   └── auth.js
├── utils/             # Utilidades y helpers
│   ├── customRouter.js  # Router con validación de políticas
│   ├── multerUtil.js    # Configuración de carga de archivos
│   └── constantsUtil.js # Constantes
├── dtos/              # Data Transfer Objects
│   └── UserDTO.js
├── views/             # Templates Handlebars
├── public/            # Archivos estáticos (CSS, JS)
├── websocket.js       # Configuración de Socket.IO
└── app.js             # Entrada principal de la app
```

---

## 🏗️ Arquitectura en Capas

### Capa 1: Presentación (Views/Routes)
- **Responsabilidad:** Definir endpoints y rutas
- **Archivos:** `routes/*.js`
- **Patrón:** Custom Router con validación de políticas
- **Ejemplo:** productRouter, cartRouter, viewsRouter
- ✅ **Regla:** Solo define rutas, sin lógica de negocio

### Capa 2: Controladores (Controllers)
- **Responsabilidad:** Procesar requests, validar datos, llamar servicios
- **Archivos:** `controllers/*.js`
- **Patrón:** Una instancia por entidad
- **Ejemplo:** ProductController, CartController
- ✅ **Regla:** No accede directamente a BD, usa Repositories

### Capa 3: Repositorios (Repositories)
- **Responsabilidad:** Abstracción de acceso a datos
- **Archivos:** `repositories/*.js`
- **Patrón:** Repository Pattern
- **Ejemplo:** ProductRepository, CartRepository
- ✅ **Regla:** Contiene lógica de negocio, delega BD a DAOs

### Capa 4: Acceso a Datos (DAOs)
- **Responsabilidad:** Operaciones directas de BD
- **Archivos:** `dao/*DBManager.js`
- **Patrón:** DAO (Data Access Object)
- **Ejemplo:** productDBManager, cartDBManager
- ✅ **Regla:** Solo consultas/inserts/updates al DB, sin lógica

### Capa 5: Modelos (Models)
- **Responsabilidad:** Schemas de Mongoose
- **Archivos:** `dao/models/*.js`
- **Patrón:** Mongoose Schema
- **Ejemplo:** productModel, cartModel, userModel
- ✅ **Regla:** Define estructura, validaciones básicas

---

## 📝 Convenciones de Naming

### Variables y Funciones
```javascript
// Variables - camelCase
const userId = 123;
const productName = "Laptop";
let isActive = true;

// Funciones - camelCase, verbo al inicio
async function getProductById(id) { ... }
async function createUser(userData) { ... }
async function updateCart(cartId, data) { ... }
async function deleteProduct(productId) { ... }
```

### Clases
```javascript
// PascalCase
class ProductController { ... }
class UserRepository { ... }
class CartDBManager { ... }
```

### Constantes
```javascript
// UPPER_SNAKE_CASE
const JWT_SECRET = process.env.JWT_SECRET;
const DB_NAME = 'integrative_practice';
const MAX_RETRIES = 3;
```

### Archivos
```javascript
// kebab-case para archivos
productRouter.js
userDBManager.js
UserDTO.js          // Exception: DTOs en PascalCase
```

---

## 🔄 Flujo de Datos

### Ejemplo Completo: GET /api/products

```
HTTP GET /api/products
    ↓
productRouter (route definition)
    ↓
ProductController.getAll()
    ├─ Validar query params
    ├─ Llamar productRepository.getAll()
    └─ Responder con res.sendSuccess()
         ↓
ProductRepository.getAll()
    ├─ Aplicar lógica de negocio (validaciones)
    ├─ Llamar productDBManager.getAllProducts()
    └─ Retornar datos procesados
         ↓
productDBManager.getAllProducts()
    ├─ Construir query
    ├─ productModel.paginate() consulta BD
    └─ Procesar resultados de paginación
         ↓
productModel (Mongoose Schema)
    ├─ Validar estructura
    └─ Ejecutar en MongoDB
         ↓
MongoDB Retorna documentos
```

---

## ✅ Patrones de Validación

### En Controllers
```javascript
// Validar datos de entrada
if (!email || !password) {
    return res.sendUserError('Email and password are required', 400);
}

// Validar tipos
if (!Array.isArray(products)) {
    return res.sendUserError('Products must be an array', 400);
}
```

### En Repositories
```javascript
// Lógica de negocio
if (product.stock < quantity) {
    throw new Error('Insufficient stock');
}

// Validar relaciones
const product = await this.productRepo.getById(productId);
if (!product) {
    throw new Error('Product not found');
}
```

### En DAOs
```javascript
// Validar en BD
const product = await productModel.findOne({_id: pid});
if (!product) {
    throw new Error(`El producto ${pid} no existe!`);
}
```

---

## 🔐 Seguridad

### Autenticación
- **Tipo:** JWT en cookies firmadas
- **Expiración:** 24 horas
- **Cookie:** `currentUser` (httpOnly, signed)

### Autorización
- **Nivel Ruta:** CustomRouter con políticas
- **Nivel Middleware:** authMiddleware valida JWT
- **Nivel Endpoint:** Validación de roles

### Validación de Entrada
```javascript
// Siempre validar entrada del usuario
const { email, password } = req.body;
if (!email || !password) {
    return res.sendUserError('Invalid input', 400);
}
```

---

## 📦 Response Format

### Éxito 200
```javascript
{
    "status": "success",
    "payload": { /* datos */ }
}
```

### Creado 201
```javascript
{
    "status": "success",
    "payload": {
        "message": "Created successfully",
        "user": { /* datos */ }
    }
}
```

### Error 4xx/5xx
```javascript
{
    "status": "error",
    "error": "Error message"
}
```

---

## ⚙️ Configuración

### Variables de Entorno (.env)
```env
# Server
PORT=8083
NODE_ENV=development

# Database
MONGODB_URI=mongodb://127.0.0.1:27017
DB_NAME=integrative_practice

# JWT
JWT_SECRET=your_jwt_secret_key_change_this_in_production
JWT_EXPIRE=24h

# Session
SESSION_SECRET=s3cr3t0
COOKIE_SECRET=s3cr3t0

# Email
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_SERVICE=gmail

# Twilio (Optional)
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_SMS_NUMBER=your_number
```

---

## 🧪 Testing - Patterns

### Para un Controller
```javascript
// test/controllers/productController.test.js
describe('ProductController', () => {
    let controller;
    let mockRepository;
    
    beforeEach(() => {
        mockRepository = {
            getAll: jest.fn()
        };
        controller = new ProductController();
        controller.productRepo = mockRepository;
    });
    
    test('getAll should return products', async () => {
        const mockReq = { query: {} };
        const mockRes = {
            sendSuccess: jest.fn()
        };
        
        await controller.getAll(mockReq, mockRes);
        expect(mockRes.sendSuccess).toHaveBeenCalled();
    });
});
```

---

## 📊 Checklist para Crear una Nueva Feature

- [ ] **Route:** Crear en `routes/*.js`
- [ ] **Controller:** Crear en `controllers/*.js` con validaciones
- [ ] **Repository:** Crear en `repositories/*.js` con lógica de negocio
- [ ] **DAO:** Crear en `dao/*DBManager.js` con queries
- [ ] **Model:** Crear/actualizar en `dao/models/*.js` con schema
- [ ] **Tests:** Crear tests para cada capa
- [ ] **Error Handling:** Implementar try-catch
- [ ] **Logging:** Agregar console.error en errores
- [ ] **Documentation:** Comentar lógica compleja

---

## 🚀 Deploy Checklist

- [ ] Variables de entorno configuradas en producción
- [ ] MongoDB atlas URI correcta
- [ ] JWT_SECRET cambiar a valor fuerte
- [ ] NODE_ENV=production
- [ ] CORS configurado
- [ ] Rate limiting implementado
- [ ] Logs centralizados
- [ ] Backups configurados
- [ ] Monitoreo de errores activo

---

## 📞 Endpoints Principales

```
# Productos
GET    /api/products           - Listar productos (paginado)
GET    /api/products/:pid      - Obtener producto
POST   /api/products           - Crear (admin)
PUT    /api/products/:pid      - Actualizar (admin)
DELETE /api/products/:pid      - Eliminar (admin)

# Carrito
GET    /api/carts/:cid         - Obtener carrito
POST   /api/carts              - Crear carrito
POST   /api/carts/:cid/product/:pid  - Agregar producto
DELETE /api/carts/:cid/product/:pid  - Eliminar producto
PUT    /api/carts/:cid/product/:pid  - Actualizar cantidad
POST   /api/carts/:cid/purchase      - Comprar
DELETE /api/carts/:cid         - Vaciar carrito

# Usuarios
POST   /api/users/register     - Registrar usuario
POST   /api/users/login        - Login
GET    /api/sessions/current   - Usuario actual
POST   /api/users/logout       - Logout
```

---

## 🔗 Referencias

- **Mongoose:** https://mongoosedocs.com/
- **Express:** https://expressjs.com/
- **JWT:** https://jwt.io/
- **Repository Pattern:** https://docs.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/infrastructure-persistence-layer-design

---

**Última actualización:** 15 de Abril de 2026
