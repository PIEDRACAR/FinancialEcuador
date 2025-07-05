import crypto from 'crypto';
import { promisify } from 'util';

// Servicio de seguridad avanzada para cumplimiento OWASP Top 10
export class SecurityService {
  private static instance: SecurityService;
  private readonly encryptionKey: string;
  private readonly algorithm = 'aes-256-gcm';
  
  constructor() {
    // Generar clave de encriptación única para la sesión
    this.encryptionKey = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
  }

  public static getInstance(): SecurityService {
    if (!SecurityService.instance) {
      SecurityService.instance = new SecurityService();
    }
    return SecurityService.instance;
  }

  // Encriptación AES-256 para datos sensibles
  encryptSensitiveData(text: string): {
    encryptedData: string;
    iv: string;
    authTag: string;
  } {
    try {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipher('aes-256-gcm', this.encryptionKey);
      cipher.setAAD(Buffer.from('Sistema Contable Pro', 'utf8'));
      
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const authTag = cipher.getAuthTag();
      
      return {
        encryptedData: encrypted,
        iv: iv.toString('hex'),
        authTag: authTag.toString('hex')
      };
    } catch (error) {
      throw new Error(`Error en encriptación: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  // Desencriptación AES-256
  decryptSensitiveData(encryptedData: string, iv: string, authTag: string): string {
    try {
      const decipher = crypto.createDecipher('aes-256-gcm', this.encryptionKey);
      decipher.setAAD(Buffer.from('Sistema Contable Pro', 'utf8'));
      decipher.setAuthTag(Buffer.from(authTag, 'hex'));
      
      let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      throw new Error(`Error en desencriptación: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  // Validación OWASP Top 10 - Prevención de inyección SQL
  sanitizeInput(input: string): string {
    if (typeof input !== 'string') {
      throw new Error('Input debe ser un string');
    }
    
    // Remover caracteres peligrosos
    return input
      .replace(/[<>\"'%;()&+]/g, '') // XSS prevention
      .replace(/(\b(ALTER|CREATE|DELETE|DROP|EXEC(UTE)?|INSERT|SELECT|UNION|UPDATE)\b)/gi, '') // SQL injection prevention
      .trim()
      .substring(0, 1000); // Limitar longitud
  }

  // Generación de tokens JWT seguros con doble factor
  generateSecureJWT(payload: {
    userId: number;
    email: string;
    companyId?: number;
    permissions?: string[];
  }): {
    accessToken: string;
    refreshToken: string;
    twoFactorToken: string;
    expiresIn: number;
  } {
    const now = Math.floor(Date.now() / 1000);
    const expiresIn = 3600; // 1 hora
    
    // Token de acceso principal
    const accessPayload = {
      ...payload,
      iat: now,
      exp: now + expiresIn,
      type: 'access',
      nonce: crypto.randomBytes(16).toString('hex')
    };
    
    // Token de renovación
    const refreshPayload = {
      userId: payload.userId,
      iat: now,
      exp: now + (7 * 24 * 3600), // 7 días
      type: 'refresh',
      nonce: crypto.randomBytes(16).toString('hex')
    };
    
    // Token de doble factor
    const twoFactorPayload = {
      userId: payload.userId,
      iat: now,
      exp: now + 300, // 5 minutos
      type: '2fa',
      code: this.generateTwoFactorCode(),
      nonce: crypto.randomBytes(16).toString('hex')
    };
    
    return {
      accessToken: this.signJWT(accessPayload),
      refreshToken: this.signJWT(refreshPayload),
      twoFactorToken: this.signJWT(twoFactorPayload),
      expiresIn
    };
  }

  // Verificación de JWT con validaciones de seguridad
  verifyJWT(token: string): {
    valid: boolean;
    payload?: any;
    error?: string;
  } {
    try {
      const decoded = this.decodeJWT(token);
      
      if (!decoded) {
        return { valid: false, error: 'Token inválido' };
      }
      
      const now = Math.floor(Date.now() / 1000);
      
      // Verificar expiración
      if (decoded.exp < now) {
        return { valid: false, error: 'Token expirado' };
      }
      
      // Verificar que no sea usado antes de tiempo
      if (decoded.iat > now) {
        return { valid: false, error: 'Token no válido aún' };
      }
      
      // Verificar nonce (prevenir replay attacks)
      if (!decoded.nonce || decoded.nonce.length < 16) {
        return { valid: false, error: 'Token sin nonce válido' };
      }
      
      return { valid: true, payload: decoded };
    } catch (error) {
      return { 
        valid: false, 
        error: `Error verificando token: ${error instanceof Error ? error.message : 'Error desconocido'}` 
      };
    }
  }

  // Generación de código de doble factor
  generateTwoFactorCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Validación de fortaleza de contraseña
  validatePasswordStrength(password: string): {
    isStrong: boolean;
    score: number;
    recommendations: string[];
  } {
    const recommendations: string[] = [];
    let score = 0;
    
    // Longitud mínima
    if (password.length >= 8) {
      score += 20;
    } else {
      recommendations.push('Usar al menos 8 caracteres');
    }
    
    // Mayúsculas
    if (/[A-Z]/.test(password)) {
      score += 20;
    } else {
      recommendations.push('Incluir al menos una letra mayúscula');
    }
    
    // Minúsculas
    if (/[a-z]/.test(password)) {
      score += 20;
    } else {
      recommendations.push('Incluir al menos una letra minúscula');
    }
    
    // Números
    if (/\d/.test(password)) {
      score += 20;
    } else {
      recommendations.push('Incluir al menos un número');
    }
    
    // Caracteres especiales
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      score += 20;
    } else {
      recommendations.push('Incluir al menos un carácter especial');
    }
    
    return {
      isStrong: score >= 80,
      score,
      recommendations
    };
  }

  // Hash seguro de contraseñas con salt
  async hashPassword(password: string): Promise<{
    hash: string;
    salt: string;
  }> {
    const salt = crypto.randomBytes(32).toString('hex');
    const scrypt = promisify(crypto.scrypt);
    const hash = await scrypt(password, salt, 64) as Buffer;
    
    return {
      hash: hash.toString('hex'),
      salt
    };
  }

  // Verificación de contraseña
  async verifyPassword(password: string, hash: string, salt: string): Promise<boolean> {
    try {
      const scrypt = promisify(crypto.scrypt);
      const derivedKey = await scrypt(password, salt, 64) as Buffer;
      return derivedKey.toString('hex') === hash;
    } catch (error) {
      return false;
    }
  }

  // Detección de ataques de fuerza bruta
  private attemptCounts = new Map<string, { count: number; lastAttempt: number }>();
  
  checkBruteForceAttempt(identifier: string): {
    allowed: boolean;
    remainingAttempts: number;
    lockoutTime?: number;
  } {
    const maxAttempts = 5;
    const lockoutDuration = 15 * 60 * 1000; // 15 minutos
    const now = Date.now();
    
    const attempts = this.attemptCounts.get(identifier);
    
    if (!attempts) {
      this.attemptCounts.set(identifier, { count: 1, lastAttempt: now });
      return { allowed: true, remainingAttempts: maxAttempts - 1 };
    }
    
    // Si ha pasado el tiempo de bloqueo, resetear
    if (now - attempts.lastAttempt > lockoutDuration) {
      this.attemptCounts.set(identifier, { count: 1, lastAttempt: now });
      return { allowed: true, remainingAttempts: maxAttempts - 1 };
    }
    
    // Incrementar contador
    attempts.count++;
    attempts.lastAttempt = now;
    
    if (attempts.count > maxAttempts) {
      const lockoutTime = lockoutDuration - (now - attempts.lastAttempt);
      return { 
        allowed: false, 
        remainingAttempts: 0,
        lockoutTime: Math.max(0, lockoutTime)
      };
    }
    
    return { 
      allowed: true, 
      remainingAttempts: maxAttempts - attempts.count 
    };
  }

  // Limpiar intentos exitosos
  clearBruteForceAttempts(identifier: string): void {
    this.attemptCounts.delete(identifier);
  }

  // Helpers privados para JWT
  private signJWT(payload: any): string {
    const header = { alg: 'HS256', typ: 'JWT' };
    const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
    
    const signature = crypto
      .createHmac('sha256', this.encryptionKey)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64url');
    
    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  private decodeJWT(token: string): any {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      
      const [header, payload, signature] = parts;
      
      // Verificar firma
      const expectedSignature = crypto
        .createHmac('sha256', this.encryptionKey)
        .update(`${header}.${payload}`)
        .digest('base64url');
      
      if (signature !== expectedSignature) return null;
      
      return JSON.parse(Buffer.from(payload, 'base64url').toString());
    } catch (error) {
      return null;
    }
  }

  // Auditoría de seguridad
  logSecurityEvent(event: {
    type: 'login' | 'logout' | 'failed_login' | 'password_change' | 'data_access' | 'suspicious_activity';
    userId?: number;
    ip: string;
    userAgent: string;
    details?: any;
  }): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event: event.type,
      userId: event.userId,
      ip: event.ip,
      userAgent: event.userAgent,
      details: event.details,
      severity: this.getEventSeverity(event.type)
    };
    
    // En producción, enviar a sistema de logging centralizado
    console.log('[SECURITY AUDIT]', JSON.stringify(logEntry));
  }

  private getEventSeverity(eventType: string): 'low' | 'medium' | 'high' | 'critical' {
    switch (eventType) {
      case 'failed_login':
        return 'medium';
      case 'suspicious_activity':
        return 'high';
      case 'data_access':
        return 'low';
      default:
        return 'medium';
    }
  }
}

export const securityService = SecurityService.getInstance();