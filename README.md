# Sistema Contable Pro - Aplicación SaaS para Ecuador

Sistema contable completo y profesional diseñado específicamente para el mercado ecuatoriano. Permite gestionar la contabilidad de múltiples empresas con una interfaz moderna y funcionalidades robustas.

## 🚀 Características Principales

- **Multi-empresa**: Gestiona múltiples empresas desde una sola cuenta
- **Dashboard interactivo**: Estadísticas en tiempo real y métricas clave
- **Gestión de clientes**: Base de datos completa con RUC/Cédula
- **Sistema de facturas**: Creación y seguimiento de facturas con diferentes estados
- **Autenticación segura**: Sistema JWT con protección de rutas
- **Interfaz moderna**: Diseño responsivo con componentes ShadCN UI

## 🛠️ Stack Tecnológico

### Frontend
- **React 18** con TypeScript
- **Vite** como bundler y servidor de desarrollo
- **Wouter** para enrutamiento
- **TanStack Query** para gestión de estado del servidor
- **ShadCN UI** + **Tailwind CSS** para la interfaz
- **React Hook Form** + **Zod** para formularios y validación

### Backend
- **Node.js** con **Express.js**
- **TypeScript** con ES modules
- **Drizzle ORM** para base de datos
- **PostgreSQL** con Neon Database
- **JWT** para autenticación

## 📦 Instalación y Configuración

### Prerrequisitos
- Node.js 18+ 
- npm o yarn

### Configuración Local

1. **Clonar el repositorio**
```bash
git clone <url-del-repositorio>
cd sistema-contable-pro
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
Crear archivo `.env` en la raíz del proyecto:
```env
# Base de datos (opcional para desarrollo - usa almacenamiento en memoria por defecto)
DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/nombre_base_datos

# Puerto del servidor (opcional - por defecto 5000)
PORT=5000

# Entorno de desarrollo
NODE_ENV=development
```

4. **Ejecutar en modo desarrollo**
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5000`

## 🏗️ Arquitectura del Proyecto

### Estructura de Directorios
```
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/     # Componentes reutilizables
│   │   ├── contexts/       # Context API para estado global
│   │   ├── hooks/          # Custom hooks
│   │   ├── lib/           # Utilidades y configuraciones
│   │   └── pages/         # Páginas de la aplicación
├── server/                # Backend Express
│   ├── index.ts           # Punto de entrada del servidor
│   ├── routes.ts          # Rutas de la API
│   ├── storage.ts         # Capa de almacenamiento
│   └── vite.ts           # Configuración de Vite
├── shared/                # Código compartido
│   └── schema.ts          # Esquemas de base de datos y validación
└── package.json
```

### Flujo de Datos
1. **Autenticación**: Usuario → Login → JWT Token → LocalStorage
2. **Selección de Empresa**: Context Provider → LocalStorage → API Calls
3. **Operaciones CRUD**: React Query → API Routes → Storage Layer
4. **Actualizaciones UI**: Mutations → Cache Invalidation → Re-render

## 🚀 Despliegue

### Despliegue en Replit
1. La aplicación está optimizada para funcionar en Replit
2. El workflow "Start application" ejecuta `npm run dev`
3. Frontend y backend se sirven desde el mismo puerto (5000)

### Despliegue en Vercel/Netlify
1. **Configurar variables de entorno**:
   - `DATABASE_URL`: URL de la base de datos PostgreSQL
   - `NODE_ENV`: "production"

2. **Build commands**:
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. **Base de datos**:
   - Configurar PostgreSQL en Neon, Supabase o PlanetScale
   - Ejecutar migraciones si es necesario

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Inicia servidor de desarrollo

# Producción
npm run build        # Construye la aplicación para producción
npm start            # Ejecuta la aplicación en producción

# Base de datos (cuando se use PostgreSQL)
npm run db:generate  # Genera migraciones de Drizzle
npm run db:migrate   # Ejecuta migraciones
```

## 📊 Funcionalidades

### Dashboard
- Resumen financiero de la empresa seleccionada
- Estadísticas de clientes activos
- Métricas de facturas (pagadas, pendientes, vencidas)
- Crecimiento mensual y tasa de cobro

### Gestión de Empresas
- Crear múltiples empresas
- Selector de empresa activa
- Información completa (nombre, RUC, dirección)

### Gestión de Clientes
- Registro completo de clientes
- Validación de RUC/Cédula ecuatorianos
- Estados activo/inactivo
- Información de contacto

### Sistema de Facturas
- Creación de facturas con numeración automática
- Estados: Pendiente, Pagada, Vencida
- Vinculación con clientes
- Reportes y filtros

## 🔒 Seguridad

- **Autenticación JWT**: Tokens seguros con expiración
- **Validación de entrada**: Esquemas Zod en frontend y backend
- **Aislamiento de datos**: Cada empresa accede solo a sus datos
- **CORS configurado**: Protección contra requests no autorizados
- **Sanitización**: Validación de todos los inputs del usuario

## 🌐 Localización

- Interfaz completamente en español
- Formatos de fecha ecuatorianos
- Moneda en dólares estadounidenses (USD)
- Validaciones específicas para RUC ecuatoriano

## 🔄 Estado del Proyecto

✅ **Completado**:
- Arquitectura base y configuración
- Sistema de autenticación
- Gestión multi-empresa
- CRUD de clientes
- Dashboard con métricas
- Interfaz responsiva

✅ **Recientemente completado**:
- Sistema completo de facturación con líneas de productos
- Reportes financieros con análisis detallado
- Panel de configuración completo
- Todas las funcionalidades principales implementadas

🚧 **Mejoras futuras**:
- Exportación PDF de facturas y reportes
- Notificaciones por email
- Integración con SRI Ecuador
- Módulo de inventarios

## 🤝 Contribución

1. Fork del proyecto
2. Crear branch para nueva feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit de cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push al branch (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver archivo `LICENSE` para más detalles.

## 📞 Soporte

Para soporte técnico o consultas:
- Crear un issue en GitHub
- Contactar al equipo de desarrollo

---

**Sistema Contable Pro** - Optimizando la gestión contable en Ecuador 🇪🇨