# Guía Técnica - Sistema Contable Pro Ecuador 2024

## Arquitectura del Sistema

### Stack Tecnológico
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js + Express + TypeScript  
- **Base de Datos**: PostgreSQL + Drizzle ORM
- **Autenticación**: JWT + 2FA
- **Seguridad**: AES-256 + OWASP Top 10
- **Performance**: Cache inteligente + Rate limiting

### Servicios Principales

#### 1. SRI Service (`/server/services/sriService.ts`)
Integración completa con servicios del SRI Ecuador:

```typescript
// Validación RUC/CI en tiempo real
const validation = await sriService.validateRucCi(ruc);

// Generación XML comprobantes electrónicos
const xml = sriService.generateElectronicVoucherXML(invoiceData);

// Cálculo automático retenciones 2024
const retention = sriService.calculateRetentions({
  baseAmount: 1000,
  type: 'renta',
  concept: 'servicios'
});
```

#### 2. Security Service (`/server/services/securityService.ts`)
Seguridad avanzada con cumplimiento OWASP:

```typescript
// Encriptación AES-256
const encrypted = securityService.encryptSensitiveData(data);

// Autenticación 2FA
const tokens = securityService.generateSecureJWT(userData);

// Prevención fuerza bruta
const check = securityService.checkBruteForceAttempt(email);
```

#### 3. Performance Service (`/server/services/performanceService.ts`)
Optimización para 1000+ transacciones/minuto:

```typescript
// Cache inteligente
performanceService.setCache(key, data, timeout);

// Métricas en tiempo real
const metrics = performanceService.getPerformanceMetrics();

// Rate limiting
const limit = performanceService.checkRateLimit(clientId);
```

## API Endpoints

### Autenticación Avanzada
```http
POST /api/auth/login-2fa
Content-Type: application/json

{
  "email": "user@empresa.com",
  "password": "securepass123"
}

Response:
{
  "user": {...},
  "accessToken": "...",
  "refreshToken": "...",
  "twoFactorToken": "...",
  "requiresTwoFactor": true
}
```

### Validación RUC SRI
```http
POST /api/sri/validate-ruc
Authorization: Bearer <token>
Content-Type: application/json

{
  "ruc": "0912345678001"
}

Response:
{
  "valid": true,
  "data": {
    "ruc": "0912345678001",
    "razonSocial": "EMPRESA EJEMPLO S.A.",
    "estado": "ACTIVO",
    "tipoContribuyente": "SOCIEDAD"
  }
}
```

### Generación XML Electrónico
```http
POST /api/sri/generate-xml
Authorization: Bearer <token>
Content-Type: application/json

{
  "tipoComprobante": "01",
  "secuencial": "123456789",
  "fechaEmision": "2024-07-05",
  "razonSocialEmisor": "MI EMPRESA S.A.",
  "rucEmisor": "0912345678001",
  "items": [...]
}

Response:
{
  "success": true,
  "xml": "<?xml version=\"1.0\"...",
  "claveAcceso": "0507202401091234567800...",
  "timestamp": "2024-07-05T12:00:00.000Z"
}
```

### Cálculo Avanzado Retenciones
```http
POST /api/sri/calculate-advanced-retentions
Authorization: Bearer <token>
Content-Type: application/json

{
  "baseAmount": 1000,
  "type": "renta",
  "concept": "servicios",
  "supplierType": "sociedad"
}

Response:
{
  "success": true,
  "calculation": {
    "percentage": 3.5,
    "retentionAmount": 35.00,
    "concept": "servicios",
    "legalBase": "Art. 45 LORTI"
  },
  "taxYear": 2024
}
```

## Configuración de Desarrollo

### Variables de Entorno
```env
# Base de datos
DATABASE_URL=postgresql://user:pass@host:port/db

# Seguridad
ENCRYPTION_KEY=your-32-char-encryption-key
JWT_SECRET=your-jwt-secret-key

# SRI (Desarrollo)
SRI_ENVIRONMENT=1
SRI_API_URL=https://celcer.sri.gob.ec

# Performance
CACHE_TIMEOUT=300000
RATE_LIMIT_WINDOW=60000
```

### Instalación y Setup
```bash
# Instalar dependencias
npm install

# Configurar base de datos
npm run db:migrate

# Inicializar datos
npm run db:seed

# Desarrollo
npm run dev

# Producción
npm run build
npm start
```

## Tasas Fiscales Ecuador 2024

### IVA
- **General**: 15%
- **Reducido**: 5%
- **Exento**: 0%

### Retenciones en la Fuente (Actualizado Julio 2024)
- **Bienes**: 1.75%
- **Servicios**: 3.5%
- **Arrendamientos**: 10%
- **Honorarios**: 10%

### Retenciones IVA
- **Bienes**: 30%
- **Servicios**: 70%
- **Servicios Profesionales**: 100%

### Tabla Progresiva Impuesto Renta 2024
```typescript
const TRAMOS = [
  { desde: 0, hasta: 11722, porcentaje: 0, deduccion: 0 },
  { desde: 11722, hasta: 14930, porcentaje: 5, deduccion: 586 },
  { desde: 14930, hasta: 19385, porcentaje: 10, deduccion: 1332 },
  // ... más tramos
];
```

## Optimizaciones de Performance

### 1. Cache Strategy
```typescript
// Cache por tipo de consulta
const cacheKeys = {
  clients: 'clients_company_{id}',
  products: 'products_company_{id}',
  taxRates: 'tax_rates_2024'
};

// TTL dinámico
const cacheTTL = {
  static: 24 * 60 * 60 * 1000, // 24 horas
  dynamic: 5 * 60 * 1000,      // 5 minutos
  realtime: 30 * 1000          // 30 segundos
};
```

### 2. Database Optimization
```sql
-- Índices críticos
CREATE INDEX idx_invoices_company_date ON invoices(company_id, date);
CREATE INDEX idx_clients_company_ruc ON clients(company_id, ruc);
CREATE INDEX idx_products_company_code ON products(company_id, code);

-- Particionado por fecha
CREATE TABLE invoices_2024 PARTITION OF invoices 
FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');
```

### 3. Rate Limiting
```typescript
const rateLimits = {
  auth: { requests: 5, window: 60000 },      // 5/min login
  api: { requests: 100, window: 60000 },     // 100/min general
  reports: { requests: 10, window: 60000 },  // 10/min reportes
  export: { requests: 20, window: 300000 }   // 20/5min exportación
};
```

## Seguridad OWASP Top 10

### 1. Injection Prevention
```typescript
// Sanitización automática
const sanitized = securityService.sanitizeInput(userInput);

// Queries parametrizadas con Drizzle
const result = await db.select()
  .from(clients)
  .where(eq(clients.companyId, companyId));
```

### 2. Authentication & Session Management
```typescript
// JWT con expiración corta
const tokenConfig = {
  accessToken: 3600,    // 1 hora
  refreshToken: 604800, // 7 días
  twoFactor: 300       // 5 minutos
};

// Session invalidation
securityService.invalidateSession(userId);
```

### 3. Sensitive Data Exposure
```typescript
// Encriptación automática campos sensibles
const encryptedData = {
  ruc: securityService.encryptSensitiveData(ruc),
  account: securityService.encryptSensitiveData(accountNumber)
};
```

## Monitoreo y Métricas

### Performance Metrics
```http
GET /api/admin/performance-metrics
Authorization: Bearer <admin-token>

Response:
{
  "performance": {
    "routes": [
      {
        "route": "GET /api/invoices",
        "avgResponseTime": 245,
        "requestCount": 1547,
        "slowRequests": 12
      }
    ]
  },
  "resources": {
    "memoryUsage": {
      "heapUsed": "156.34 MB",
      "heapTotal": "187.21 MB"
    },
    "uptime": "145.67 minutes"
  }
}
```

### Health Check
```http
GET /api/system/health

Response:
{
  "status": "healthy",
  "version": "2024.07.05",
  "compliance": "SRI Ecuador 2024",
  "features": {
    "rucValidation": "active",
    "xmlGeneration": "active",
    "advancedSecurity": "active",
    "performanceOptimization": "active"
  },
  "performance": {
    "avgResponseTime": "< 500ms",
    "throughput": "1000+ transactions/minute"
  }
}
```

## Deployment y Producción

### Docker Configuration
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

### Nginx Configuration
```nginx
upstream backend {
    server app1:5000;
    server app2:5000;
    server app3:5000;
}

server {
    listen 443 ssl http2;
    server_name sistema.empresa.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location /api {
        proxy_pass http://backend;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Database Migration
```bash
# Backup antes de migración
pg_dump -h localhost -U user dbname > backup_$(date +%Y%m%d).sql

# Ejecutar migraciones
npm run db:migrate

# Verificar integridad
npm run db:verify
```

## Testing

### Unit Tests
```typescript
// Pruebas de servicios SRI
describe('SRIService', () => {
  test('debe validar RUC correctamente', async () => {
    const result = await sriService.validateRucCi('0912345678001');
    expect(result.valid).toBe(true);
  });
  
  test('debe calcular retenciones correctamente', () => {
    const result = sriService.calculateRetentions({
      baseAmount: 1000,
      type: 'renta',
      concept: 'servicios'
    });
    expect(result.percentage).toBe(3.5);
    expect(result.retentionAmount).toBe(35);
  });
});
```

### Performance Tests (JMeter)
```xml
<!-- Test Plan para 1000 transacciones/minuto -->
<TestPlan>
  <ThreadGroup>
    <stringProp name="ThreadGroup.num_threads">50</stringProp>
    <stringProp name="ThreadGroup.ramp_time">60</stringProp>
    <stringProp name="ThreadGroup.duration">300</stringProp>
  </ThreadGroup>
  
  <HTTPSampler>
    <stringProp name="HTTPSampler.domain">api.sistema.com</stringProp>
    <stringProp name="HTTPSampler.path">/api/invoices</stringProp>
    <stringProp name="HTTPSampler.method">POST</stringProp>
  </HTTPSampler>
  
  <ResponseAssertion>
    <stringProp name="Assertion.test_field">Assertion.response_time</stringProp>
    <stringProp name="Assertion.custom_message">Response time > 500ms</stringProp>
    <stringProp name="Assertion.test_type">1</stringProp>
    <collectionProp name="Asserion.test_strings">
      <stringProp>500</stringProp>
    </collectionProp>
  </ResponseAssertion>
</TestPlan>
```

## Troubleshooting

### Problemas Comunes

#### 1. Error de Validación RUC
```
Error: "RUC/CI no válido según algoritmo de verificación"

Solución:
1. Verificar formato (10 dígitos CI, 13 dígitos RUC)
2. Validar dígito verificador
3. Confirmar provincia válida (01-24)
```

#### 2. Performance Lenta
```
Warning: "API response time > 500ms"

Diagnóstico:
1. Revisar métricas: GET /api/admin/performance-metrics
2. Verificar cache hit rate
3. Analizar queries lentas en logs
4. Optimizar índices de base de datos
```

#### 3. Error Generación XML
```
Error: "Campo requerido: razonSocialEmisor"

Solución:
1. Verificar datos completos de empresa
2. Validar RUC emisor
3. Confirmar productos con IVA configurado
```

---

**Sistema Contable Pro Ecuador 2024**  
*Documentación Técnica - Versión 2024.07.05*

Para soporte técnico: dev@sistemacontablepro.ec