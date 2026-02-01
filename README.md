# 📖 ¿Por Dónde Empezar?

## 🎯 Primeros Pasos (5 minutos)

1. **Leer**: `QUICK_START.md` ← Empieza aquí
2. **Configurar**: Variables en `.env`
3. **Ejecutar**: `npm start`
4. **Acceder**: `http://localhost:8083/login`

## 📚 Documentación Recomendada

### Para Usuarios:
- 📖 **QUICK_START.md** - Cómo usar la aplicación
- 🧪 **postman_collection.json** - Probar API endpoints

### Para Desarrolladores:
- 📗 **AUTHENTICATION_README.md** - Documentación técnica completa
- 📙 **MONGODB_SETUP.md** - Configuración de MongoDB
- 📋 **PROJECT_STRUCTURE.md** - Estructura del proyecto

### Información Sobre los Cambios:
- 📕 **IMPLEMENTATION_SUMMARY.md** - Qué fue implementado
- ✅ **VERIFICATION_CHECKLIST.md** - Lista de verificación

## 🔍 Ubicación de Código Importante

### Autenticación:
- `src/middleware/auth.js` - Middleware JWT
- `src/routes/sessionsRouter.js` - Rutas de login/logout

### Base de Datos:
- `src/dao/models/userModel.js` - Schema Mongoose
- `src/dao/userDBManager.js` - CRUD de usuarios
- `src/config/db.js` - Conexión MongoDB

### Vistas:
- `src/views/login.handlebars` - Formulario login
- `src/views/current.handlebars` - Perfil usuario

### Configuración:
- `.env` - Variables de entorno
- `src/app.js` - App principal
- `src/routes/viewsRouter.js` - Rutas de vistas

## 🚀 Flujo de Uso

```
http://localhost:8083/login
        ↓
   [Formulario]
   Email: juan@example.com
   Password: pass123
        ↓
  POST /api/users/login
        ↓
   [JWT generado]
   [Cookie creada]
        ↓
http://localhost:8083/current
        ↓
   [Datos del usuario]
   - Nombre: Juan Pérez
   - Email: juan@example.com
   - Rol: user
```

## 🧪 Testing

### Opción 1: Con Navegador
1. Acceder a `http://localhost:8083/login`
2. Hacer clic en "Register here"
3. Llenar formulario y registrarse
4. Login con las credenciales
5. Ver datos en `/current`

### Opción 2: Con Postman/Insomnia
1. Importar `postman_collection.json`
2. Ejecutar requests en orden:
   - Register User
   - Login
   - Get All Users
   - etc.

### Opción 3: Con cURL
```bash
# Registrar
curl -X POST http://localhost:8083/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"first_name":"Test","last_name":"User","email":"test@example.com","password":"123456"}'

# Login
curl -X POST http://localhost:8083/api/users/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email":"test@example.com","password":"123456"}'

# Get current user (con cookies)
curl http://localhost:8083/current -b cookies.txt
```

## 📞 Problemas Comunes

### "Cannot connect to database"
→ Ver **MONGODB_SETUP.md**

### "Login failed!"
→ Verificar email y contraseña
→ Asegurarse que usuario existe en BD

### "Module not found"
→ Ejecutar: `npm install`

## 📊 Estructura de Archivos

```
📂 Backend II
 ├─ 📚 Documentación
 │  ├─ QUICK_START.md          ← Empieza aquí
 │  ├─ AUTHENTICATION_README.md
 │  ├─ MONGODB_SETUP.md
 │  ├─ PROJECT_STRUCTURE.md
 │  └─ IMPLEMENTATION_SUMMARY.md
 │
 ├─ 📝 Código
 │  ├─ src/
 │  │  ├─ app.js
 │  │  ├─ middleware/auth.js
 │  │  ├─ routes/
 │  │  ├─ dao/
 │  │  └─ views/
 │  │
 │  ├─ .env (crear/actualizar)
 │  ├─ package.json
 │  └─ public/
 │
 └─ 🧪 Testing
    ├─ postman_collection.json
    └─ test-auth.sh
```

## 🔑 Variables de Entorno (Copiar a .env)

```env
MONGODB_URI=mongodb+srv://usuario:contraseña@cluster.mongodb.net
DB_NAME=integrative_practice
JWT_SECRET=tu_clave_super_secreta
PORT=8083
```

## ✨ Características Principales

- ✅ Registro de usuarios
- ✅ Login con JWT
- ✅ Contraseñas hasheadas
- ✅ Cookies firmadas
- ✅ Protección de rutas
- ✅ Perfil de usuario
- ✅ Logout

## 🎓 Qué Aprender

Este proyecto enseña:
- Express.js
- MongoDB + Mongoose
- JWT (JSON Web Tokens)
- bcryptjs (hashing)
- Middleware
- Seguridad web básica

1. **Cambiar JWT_SECRET** 
2. **Nunca commitear .env**
3. **Los tokens expiran en 24h**
4. **Las contraseñas nunca se devuelven**
5. **Los emails son únicos**

## ❓ Preguntas Frecuentes

**P: ¿Dónde cambio la contraseña?**
A: Usa el endpoint `PUT /api/users/:id` con nuevo password

**P: ¿Cómo ver usuarios en la BD?**
A: Usa `GET /api/users`

**P: ¿Dónde se guarda la sesión?**
A: En la cookie `currentUser` (JWT)

**P: ¿Puedo usar OAuth?**
A: Sí, verifica `src/config/passport.js`

**P: ¿Cuánto dura el login?**
A: 24 horas (token expira)

