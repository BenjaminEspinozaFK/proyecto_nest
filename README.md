# Proyecto NestJS + React Auth

Sistema completo de autenticación con JWT usando NestJS como backend y React como frontend.

## 📁 Estructura del Proyecto

```
proyecto_nest/
├── backend/           # API NestJS con autenticación JWT
├── frontend/          # Aplicación React con TypeScript
├── .env              # Variables de entorno compartidas
├── .gitignore        # Archivos ignorados por Git
└── README.md         # Este archivo
```

## 🚀 Cómo ejecutar el proyecto

### Prerrequisitos

- Node.js >= 18
- Docker Desktop
- pnpm (recomendado) o npm

### 1. Configurar el Backend (NestJS)

```bash
cd backend
pnpm install
docker-compose up -d  # Inicia PostgreSQL
pnpm run start:dev    # Servidor en http://localhost:3000
```

### 2. Configurar el Frontend (React)

```bash
cd frontend/auth-frontend
npm install
npm start  # Servidor en http://localhost:3001
```

## 🔐 Características del Sistema

### Backend (NestJS)

- ✅ Autenticación JWT completa
- ✅ Registro y login de usuarios
- ✅ Encriptación de contraseñas con bcrypt
- ✅ Validación de datos con class-validator
- ✅ Base de datos PostgreSQL con Prisma ORM
- ✅ Documentación con Swagger
- ✅ CORS habilitado para frontend

### Frontend (React + TypeScript)

- ✅ Interfaz de login y registro
- ✅ Manejo de estado con Context API
- ✅ Persistencia de tokens en localStorage
- ✅ Componentes TypeScript reutilizables
- ✅ Estilos CSS modernos con gradientes
- ✅ Validación de formularios
- ✅ Dashboard de usuario logueado

## 📊 API Endpoints

### Autenticación

- `POST /auth/login` - Iniciar sesión
- `POST /auth/register` - Registrar usuario

### Usuarios

- `GET /user` - Obtener todos los usuarios
- `GET /user/:id` - Obtener usuario por ID
- `POST /user` - Crear usuario
- `PUT /user/:id` - Actualizar usuario
- `DELETE /user/:id` - Eliminar usuario

### Administradores

- `GET /admin` - Obtener todos los admins
- `GET /admin/:id` - Obtener admin por ID
- `POST /admin` - Crear admin
- `PUT /admin/:id` - Actualizar admin
- `DELETE /admin/:id` - Eliminar admin

## 🧪 Cómo probar

1. **Abrir http://localhost:3001**
2. **Registrar un nuevo usuario** con:
   - Nombre (mínimo 2 caracteres)
   - Email válido
   - Edad (número)
   - Contraseña (mínimo 6 caracteres)
3. **Iniciar sesión** con email y contraseña
4. **Ver dashboard** con información del usuario
5. **Cerrar sesión** para volver al login

## 📱 Tecnologías Utilizadas

### Backend

- **NestJS** - Framework de Node.js
- **Prisma** - ORM para base de datos
- **PostgreSQL** - Base de datos
- **JWT** - Autenticación con tokens
- **bcryptjs** - Encriptación de contraseñas
- **class-validator** - Validación de datos
- **Swagger** - Documentación API

### Frontend

- **React** - Librería de UI
- **TypeScript** - Tipado estático
- **Axios** - Cliente HTTP
- **Context API** - Manejo de estado
- **CSS3** - Estilos modernos

## 🔄 Estado del Proyecto

- ✅ Backend completamente funcional
- ✅ Frontend con interfaz moderna
- ✅ Autenticación JWT working
- ✅ Base de datos configurada
- ✅ CORS configurado
- ✅ Validaciones implementadas
- ✅ Manejo de errores
- ✅ Persistencia de sesión

## 📝 Próximos pasos

- [ ] Implementar rutas protegidas con Guards
- [ ] Agregar tests unitarios
- [ ] Implementar refresh tokens
- [ ] Agregar roles de usuario (Admin/User)
- [ ] Mejorar diseño responsive
- [ ] Agregar notificaciones toast
- [ ] Implementar recuperación de contraseña
