# 🚀 Proyecto NestJS + React - Sistema de Gestión de Usuarios con IA

[![CI/CD Pipeline](https://github.com/benjita2002djsjsda/proyecto_nest/actions/workflows/ci.yml/badge.svg)](https://github.com/benjita2002djsjsda/proyecto_nest/actions/workflows/ci.yml)
[![Deploy](https://github.com/benjita2002djsjsda/proyecto_nest/actions/workflows/deploy.yml/badge.svg)](https://github.com/benjita2002djsjsda/proyecto_nest/actions/workflows/deploy.yml)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Sistema completo de gestión de usuarios con autenticación JWT, panel de administración con IA (Ollama), estadísticas en tiempo real, y gestión de perfiles. Backend en NestJS + PostgreSQL y Frontend en React + TypeScript + Material-UI.

## ✨ Características Principales

- 🔐 **Autenticación JWT completa** con roles (Admin/User)
- 🤖 **Chat con IA (Ollama)** para gestión de usuarios mediante lenguaje natural
- 📊 **Dashboard de Estadísticas** con métricas en tiempo real
- 👤 **Gestión de Perfiles** con edición y cambio de contraseña
- 📧 **Sistema de Emails** con notificaciones automáticas
- 🔄 **Password Reset** con tokens seguros
- 📸 **Subida de Avatares** para usuarios y admins
- 🎨 **UI Moderna** con Material-UI v7 y diseño responsive
- 🔍 **Búsqueda Avanzada** de usuarios (por email, nombre, insensible a mayúsculas)
- 📝 **CRUD Completo** de usuarios y administradores

## 📁 Estructura del Proyecto

```
proyecto_nest/
├── backend/                      # API NestJS
│   ├── src/
│   │   ├── admin/               # Módulo de administradores
│   │   │   ├── admin.controller.ts
│   │   │   ├── admin.service.ts  # Incluye integración con Ollama
│   │   │   └── dto/
│   │   ├── auth/                # Módulo de autenticación
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── jwt.strategy.ts
│   │   │   ├── roles.guard.ts
│   │   │   └── dto/
│   │   ├── email/               # Servicio de emails
│   │   │   ├── email.service.ts
│   │   │   └── templates/
│   │   ├── user/                # Módulo de usuarios
│   │   │   ├── user.controller.ts
│   │   │   ├── user.service.ts
│   │   │   └── dto/
│   │   └── prisma.service.ts
│   ├── prisma/
│   │   ├── schema.prisma        # Esquema de base de datos
│   │   ├── seed.ts              # Datos iniciales
│   │   └── migrations/          # Migraciones de DB
│   ├── uploads/avatars/         # Avatares de usuarios
│   └── docker-compose.yml       # PostgreSQL en Docker
├── frontend/auth-frontend/      # Aplicación React
│   ├── src/
│   │   ├── components/
│   │   │   ├── AdminDashboard.tsx    # Dashboard con tabs
│   │   │   ├── admin/
│   │   │   │   ├── Stats.tsx         # Estadísticas del sistema
│   │   │   │   ├── Profile.tsx       # Perfil del admin
│   │   │   │   ├── Chat.tsx          # Chat con IA
│   │   │   │   └── EditUserModal.tsx
│   │   │   ├── Login.tsx
│   │   │   └── Register.tsx
│   │   ├── services/
│   │   │   ├── api.ts
│   │   │   └── adminService.ts
│   │   └── types/
│   └── public/
├── mcp-server/                  # Servidor MCP (opcional)
└── README.md                    # Este archivo
```

## 🚀 Cómo ejecutar el proyecto

### Prerrequisitos

- **Node.js** >= 18
- **Docker Desktop** (para PostgreSQL)
- **pnpm** (recomendado) o npm
- **Ollama** (para el chat con IA)
- **GPU NVIDIA** (opcional, para acelerar Ollama)

### 1. Instalar Ollama (Chat con IA)

```bash
# Linux/Mac
curl -fsSL https://ollama.com/install.sh | sh

# Descargar modelo
ollama pull llama3:8b

# Iniciar servidor (se mantiene en memoria)
ollama serve
```

### 2. Configurar el Backend (NestJS)

```bash
cd backend

# Instalar dependencias
pnpm install

# Iniciar PostgreSQL en Docker
docker-compose up -d

# Ejecutar migraciones de base de datos
pnpm prisma migrate dev

# Poblar base de datos con datos iniciales
pnpm prisma db seed

# Iniciar servidor en modo desarrollo
pnpm run start:dev    # Servidor en http://localhost:3001
```

### 3. Configurar el Frontend (React)

```bash
cd frontend/auth-frontend

# Instalar dependencias
pnpm install

# Iniciar servidor de desarrollo
pnpm start  # Servidor en http://localhost:3000
```

### 4. Acceder a la Aplicación

1. **Frontend:** http://localhost:3000
2. **Backend API:** http://localhost:3001
3. **Swagger Docs:** http://localhost:3001/api (si está habilitado)

### 5. Credenciales por Defecto

**Admin:**

- Email: `benjamintwo2002@gmail.com`
- Password: `Admin123`
- Rol: `admin`

**Usuario de prueba:**

- Email: `benjatwo2002@gmail.com`
- Password: `Usuario123`
- Rol: `user`

## 🐛 Troubleshooting

### Backend no inicia

```bash
# Verificar que PostgreSQL esté corriendo
docker ps

# Si no está, iniciar Docker
docker-compose up -d

# Verificar conexión a DB
pnpm prisma studio
```

### Ollama muy lento

```bash
# Verificar uso de GPU
ollama ps

# Debería mostrar algo como: 38%/62% CPU/GPU

# Si usa 100% CPU, verificar drivers NVIDIA
nvidia-smi

# Reiniciar Ollama
pkill ollama
ollama serve
```

### Frontend no conecta con Backend

- Verificar que backend esté en `http://localhost:3001`
- Verificar CORS en `main.ts`
- Revisar archivo `.env` del backend

### Errores de TypeScript en Frontend

```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
pnpm install
```

### Emails no se envían

- Verificar configuración en `.env`
- Usar App Password de Gmail, no contraseña normal
- Revisar logs del backend

## 📚 Documentación Adicional

- [NestJS Docs](https://docs.nestjs.com/)
- [Prisma Docs](https://www.prisma.io/docs)
- [Material-UI Docs](https://mui.com/)
- [Ollama Docs](https://ollama.com/docs)

## 🤝 Contribuir

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 👨‍💻 Autor

**Benjamin**

- Email: benjamintwo2002@gmail.com
- GitHub: [@benjita2002djsjsda](https://github.com/benjita2002djsjsda)

---

⭐ **¡Dale una estrella si te gustó el proyecto!** ⭐

---

## 📸 Screenshots (Opcional - Agregar capturas)

### Dashboard de Estadísticas

![Dashboard](screenshots/dashboard.png)

### Chat con IA

![Chat](screenshots/chat.png)

### Gestión de Usuarios

![Users](screenshots/users.png)

### Perfil de Admin

![Profile](screenshots/profile.png)

## 🔐 Características Detalladas

### 🎯 Backend (NestJS)

#### Autenticación y Seguridad

- ✅ **JWT Authentication** con roles (Admin/User)
- ✅ **Guards personalizados** para proteger rutas
- ✅ **Encriptación bcrypt** para contraseñas
- ✅ **Password Reset** con tokens de expiración
- ✅ **Last Login tracking** automático
- ✅ **Validación de datos** con class-validator

#### Base de Datos (PostgreSQL + Prisma)

- ✅ **Migraciones automáticas**
- ✅ **Seeders** con datos de prueba
- ✅ **Modelos:** User, Admin con relaciones
- ✅ **Campos de auditoría:** createdAt, updatedAt

#### Funcionalidades Admin

- ✅ **CRUD completo** de usuarios y admins
- ✅ **Chat con IA (Ollama)** para gestionar usuarios
  - Agregar usuarios mediante lenguaje natural
  - Buscar por email o nombre (insensible a mayúsculas)
  - Eliminar usuarios por ID
  - Listar todos los usuarios
- ✅ **Estadísticas del sistema:**
  - Total de usuarios y admins
  - Usuarios registrados hoy/semana/mes
  - Últimos usuarios registrados
  - Últimos logins
  - Usuarios agrupados por rol
- ✅ **Gestión de perfiles** (editar datos personales)
- ✅ **Subida de avatares** con almacenamiento local

#### Sistema de Emails

- ✅ **Templates personalizados** (welcome, login notification, password reset)
- ✅ **Configuración SMTP** (Gmail)
- ✅ **Envío asíncrono** de notificaciones

#### Optimizaciones

- ✅ **Integración con Ollama** optimizada para GPU
- ✅ **Búsquedas case-insensitive** con SQL raw
- ✅ **CORS configurado** para desarrollo

### 🎨 Frontend (React + TypeScript + Material-UI v7)

#### Autenticación

- ✅ **Login y registro** con validación
- ✅ **Persistencia de sesión** en localStorage
- ✅ **Rutas protegidas** según rol
- ✅ **Logout** con limpieza de estado

#### Dashboard de Admin

- ✅ **Navegación por Tabs:**
  - 📊 **Estadísticas:** Cards con métricas, tablas de usuarios recientes
  - 👥 **Usuarios:** CRUD completo con modales de edición
  - 💬 **Chat IA:** Interfaz para comandos en lenguaje natural
  - 👤 **Mi Perfil:** Edición de datos personales y contraseña

#### UI/UX

- ✅ **Material-UI v7** con componentes modernos
- ✅ **Diseño responsive** (mobile-first)
- ✅ **Tema oscuro personalizado**
- ✅ **Feedback visual:** Alerts, loading states
- ✅ **Tablas interactivas** con acciones (editar/eliminar)
- ✅ **Renderizado inteligente** de respuestas del chat:
  - Listas de usuarios en tablas
  - Objetos en formato clave-valor
  - Fechas formateadas
- ✅ **Iconos de Material-UI** para mejor UX

## 📊 API Endpoints

### 🔑 Autenticación (`/auth`)

| Método | Endpoint                | Descripción                   | Auth |
| ------ | ----------------------- | ----------------------------- | ---- |
| POST   | `/auth/login`           | Iniciar sesión (User/Admin)   | No   |
| POST   | `/auth/register`        | Registrar nuevo usuario       | No   |
| POST   | `/auth/forgot-password` | Solicitar reset de contraseña | No   |
| POST   | `/auth/reset-password`  | Resetear contraseña con token | No   |
| GET    | `/auth/me`              | Obtener usuario autenticado   | JWT  |

### 👥 Usuarios (`/users`)

| Método | Endpoint           | Descripción               | Auth |
| ------ | ------------------ | ------------------------- | ---- |
| GET    | `/users`           | Listar todos los usuarios | JWT  |
| GET    | `/users/:id`       | Obtener usuario por ID    | JWT  |
| GET    | `/users/me`        | Obtener perfil propio     | JWT  |
| POST   | `/users`           | Crear nuevo usuario       | JWT  |
| PUT    | `/users/:id`       | Actualizar usuario        | JWT  |
| DELETE | `/users/:id`       | Eliminar usuario          | JWT  |
| POST   | `/users/me/avatar` | Subir avatar del usuario  | JWT  |

### 🛡️ Administradores (`/admins`)

| Método | Endpoint            | Descripción              | Auth      |
| ------ | ------------------- | ------------------------ | --------- |
| GET    | `/admins`           | Listar todos los admins  | Admin JWT |
| GET    | `/admins/:id`       | Obtener admin por ID     | Admin JWT |
| GET    | `/admins/me`        | Obtener perfil propio    | Admin JWT |
| POST   | `/admins`           | Crear nuevo admin        | Admin JWT |
| PUT    | `/admins/:id`       | Actualizar admin         | Admin JWT |
| PUT    | `/admins/me`        | Actualizar perfil propio | Admin JWT |
| DELETE | `/admins/:id`       | Eliminar admin           | Admin JWT |
| POST   | `/admins/me/avatar` | Subir avatar del admin   | Admin JWT |

#### Gestión de Usuarios (Admin)

| Método | Endpoint                      | Descripción                | Auth      |
| ------ | ----------------------------- | -------------------------- | --------- |
| GET    | `/admins/users`               | Listar todos los usuarios  | Admin JWT |
| GET    | `/admins/users/search?email=` | Buscar usuario por email   | Admin JWT |
| POST   | `/admins/users`               | Crear usuario (como admin) | Admin JWT |
| PUT    | `/admins/users/:id`           | Actualizar usuario         | Admin JWT |
| DELETE | `/admins/users/:id`           | Eliminar usuario           | Admin JWT |

#### Estadísticas y Chat IA

| Método | Endpoint        | Descripción                      | Auth      |
| ------ | --------------- | -------------------------------- | --------- |
| GET    | `/admins/stats` | Obtener estadísticas del sistema | Admin JWT |
| POST   | `/admins/chat`  | Enviar comando al chat IA        | Admin JWT |

**Ejemplo de uso del Chat:**

```json
POST /admins/chat
{
  "message": "Agrega un usuario llamado Juan Pérez con email juan@example.com, edad 30 y password 123456"
}
```

Comandos soportados:

- `"Listame todos mis usuarios"`
- `"Busca el usuario con email juan@example.com"`
- `"Muéstrame al usuario de nombre Juan Pérez"`
- `"Elimina el usuario con ID abc123"`
- `"Agrega un usuario llamado... con email... edad... y password..."`

## 🧪 Cómo Probar el Sistema

### 1. Como Usuario Normal

1. **Ir a** http://localhost:3000
2. **Registrarse** con:
   - Nombre (mínimo 2 caracteres)
   - Email válido
   - Edad (número)
   - Contraseña (mínimo 6 caracteres)
3. **Iniciar sesión** y ver tu dashboard
4. **Subir avatar** (opcional)
5. **Cerrar sesión**

### 2. Como Administrador

1. **Iniciar sesión** con credenciales de admin:
   - Email: `benjamintwo2002@gmail.com`
   - Password: `Admin123`

2. **Explorar las 4 pestañas:**

   **📊 Estadísticas:**
   - Ver total de usuarios, admins
   - Usuarios registrados hoy/semana
   - Lista de usuarios recientes
   - Últimos logins

   **👥 Usuarios:**
   - Ver tabla de todos los usuarios
   - Editar información de usuarios
   - Eliminar usuarios
   - Crear nuevos usuarios

   **💬 Chat IA:**
   - Escribir: `"Listame todos mis usuarios"`
   - Probar: `"Busca el usuario con email juan.perez@example.com"`
   - Crear: `"Agrega un usuario llamado Test con email test@test.com, edad 25 y password 123456"`
   - Buscar por nombre: `"Muéstrame al usuario Juan Pérez"`

   **👤 Mi Perfil:**
   - Ver información personal
   - Editar nombre, email, edad
   - Cambiar contraseña
   - Ver fecha de registro y último login

### 3. Probar Reset de Contraseña

1. En login, hacer clic en "¿Olvidaste tu contraseña?"
2. Ingresar email
3. Revisar email para link de reset
4. Seguir el link y crear nueva contraseña

### 4. Probar API con cURL

```bash
# Login
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"benjamintwo2002@gmail.com","password":"Admin123","role":"admin"}'

# Obtener estadísticas (reemplazar TOKEN)
curl -X GET http://localhost:3001/admins/stats \
  -H "Authorization: Bearer TOKEN"

# Chat con IA (reemplazar TOKEN)
curl -X POST http://localhost:3001/admins/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"message":"Listame todos mis usuarios"}'
```

## �️ Tecnologías y Stack Completo

### Backend

| Tecnología            | Versión | Uso                            |
| --------------------- | ------- | ------------------------------ |
| **NestJS**            | 11.x    | Framework principal de Node.js |
| **Prisma**            | Latest  | ORM para PostgreSQL            |
| **PostgreSQL**        | 15+     | Base de datos relacional       |
| **JWT**               | -       | Autenticación con tokens       |
| **bcryptjs**          | -       | Hash de contraseñas            |
| **Passport**          | -       | Estrategias de autenticación   |
| **class-validator**   | -       | Validación de DTOs             |
| **class-transformer** | -       | Transformación de objetos      |
| **Axios**             | -       | Cliente HTTP para Ollama       |
| **Multer**            | -       | Subida de archivos             |
| **Nodemailer**        | -       | Envío de emails                |

### Frontend

| Tecnología       | Versión | Uso               |
| ---------------- | ------- | ----------------- |
| **React**        | 18.x    | Librería de UI    |
| **TypeScript**   | 5.x     | Tipado estático   |
| **Material-UI**  | v7      | Componentes de UI |
| **Axios**        | -       | Cliente HTTP      |
| **React Router** | -       | Navegación SPA    |

### Infraestructura y DevOps

| Herramienta  | Uso                       |
| ------------ | ------------------------- |
| **Docker**   | PostgreSQL containerizado |
| **Ollama**   | LLM local (llama3:8b)     |
| **pnpm**     | Gestor de paquetes rápido |
| **ESLint**   | Linting de código         |
| **Prettier** | Formateo de código        |

### IA y Machine Learning

- **Ollama** (llama3:8b) - Modelo de lenguaje local
- **GPU Acceleration** - NVIDIA CUDA para inferencia rápida
- **Optimizaciones:**
  - `num_ctx: 2048` - Contexto reducido
  - `temperature: 0.1` - Respuestas deterministas
  - `num_predict: 128` - Tokens limitados

## ✅ Estado del Proyecto

### Completado (FASE 1 y FASE 2)

- ✅ **Backend API REST completo**
- ✅ **Autenticación JWT** con roles
- ✅ **Guards y protección de rutas**
- ✅ **Sistema de roles** (Admin/User)
- ✅ **Base de datos** con migraciones y seeds
- ✅ **CRUD completo** de usuarios y admins
- ✅ **Password reset** con emails
- ✅ **Subida de avatares**
- ✅ **Chat con IA (Ollama)** integrado
- ✅ **Dashboard de estadísticas**
- ✅ **Gestión de perfiles**
- ✅ **Búsqueda avanzada** (case-insensitive)
- ✅ **Frontend responsive** con Material-UI v7
- ✅ **Sistema de emails** con templates
- ✅ **Validaciones** en frontend y backend
- ✅ **Manejo de errores** completo
- ✅ **Persistencia de sesión**
- ✅ **Optimizaciones de rendimiento** (Ollama GPU)

## 🎯 Próximas Mejoras Sugeridas (FASE 3)

### Alta Prioridad

- [ ] **Logs de Actividad / Audit Trail**
  - Registrar todas las acciones de admins
  - Tabla ActivityLog en base de datos
  - Filtros por fecha, usuario, acción
- [ ] **Exportación de Datos**
  - Exportar usuarios a CSV/Excel
  - Filtros avanzados para exportación
  - Descarga con indicador de progreso

- [ ] **Sistema de Roles y Permisos Granulares**
  - Roles: super_admin, moderator, viewer
  - Tabla de permisos
  - Middleware de autorización avanzado

### Media Prioridad

- [ ] **Notificaciones en Tiempo Real**
  - WebSockets con Socket.io
  - Notificaciones push en navegador
  - Badge con contador de notificaciones

- [ ] **Tests Automatizados**
  - Tests unitarios (Jest)
  - Tests e2e (Supertest)
  - Coverage mínimo 80%

- [ ] **Gráficos y Visualización**
  - Charts.js o Recharts
  - Gráficos de usuarios por mes
  - Dashboard analytics avanzado

### Baja Prioridad

- [ ] **Modo Claro/Oscuro**
  - Toggle de tema
  - Persistir preferencia
- [ ] **Refresh Tokens**
  - Renovación automática de JWT
  - Mayor seguridad

- [ ] **Backups Automáticos**
  - Comando de backup de DB
  - Restauración desde backup

## 🤖 Usar el Chat con IA

El sistema incluye un chat inteligente que permite gestionar usuarios usando lenguaje natural.

### Ejemplos de Comandos

```text
# Listar usuarios
"Listame todos mis usuarios"
"Muéstrame la lista de usuarios"

# Buscar usuarios
"Busca el usuario con email juan@example.com"
"Muéstrame al usuario de nombre Maria González"
"Encuentra a Pedro"

# Agregar usuarios
"Agrega un usuario llamado Luis Díaz con email luis@example.com, edad 28 y password 123456"
"Crea un usuario: nombre Ana Torres, email ana@example.com, edad 25, password 123456"

# Eliminar usuarios
"Elimina el usuario con ID abc123xyz"
"Borra al usuario abc123xyz"
```

### Cómo Funciona

1. **Ollama procesa** el mensaje en lenguaje natural
2. **Extrae la intención** (add_user, find_user, list_users, delete_user)
3. **Ejecuta la acción** correspondiente en el backend
4. **Devuelve el resultado** formateado en el frontend

### Optimización de Velocidad

Si Ollama tarda ~7 segundos en responder, las optimizaciones ya aplicadas son:

- ✅ Reducción de contexto (`num_ctx: 2048`)
- ✅ Temperatura baja (`temperature: 0.1`)
- ✅ Uso de GPU NVIDIA (62% GPU, 38% CPU)
- ✅ Límite de tokens de respuesta (`num_predict: 128`)

**Resultado esperado:** Respuestas en ~1-2 segundos con GPU

## 🚀 CI/CD con GitHub Actions

El proyecto incluye pipelines automatizados de CI/CD:

### Workflows Disponibles

1. **📊 CI Pipeline** (`.github/workflows/ci.yml`)
   - Se ejecuta en cada push/PR a `main` o `develop`
   - **Backend**: Lint, Build, Tests con PostgreSQL
   - **Frontend**: Lint, Build, Tests
   - Genera resumen de resultados

2. **🚀 Deploy** (`.github/workflows/deploy.yml`)
   - Deployment automático en push a `main`
   - Incluye ejemplos para: VPS, Vercel, Railway, Docker
   - Configurable según tu servicio de hosting

3. **🔍 PR Checks** (`.github/workflows/pr-checks.yml`)
   - Analiza solo archivos modificados
   - Comenta resultados en el PR
   - Optimizado para velocidad
