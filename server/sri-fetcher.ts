import { SRICompanyData } from './sri-service';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface CacheEntry {
  data: SRICompanyData;
  timestamp: number;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

export class SRIFetcher {
  private static readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas
  private static readonly RATE_LIMIT_WINDOW = 60 * 1000; // 1 minuto
  private static readonly MAX_REQUESTS_PER_MINUTE = 5;
  private static readonly CACHE_FILE = path.join(__dirname, 'sri-cache.json');
  private static readonly RATE_LIMIT_FILE = path.join(__dirname, 'sri-rate-limit.json');
  private static readonly REQUEST_TIMEOUT = 10000; // 10 segundos
  
  private static cache: Map<string, CacheEntry> = new Map();
  private static rateLimits: Map<string, RateLimitEntry> = new Map();

  // Endpoints oficiales del SRI Ecuador
  private static readonly SRI_ENDPOINTS = [
    'https://srienlinea.sri.gob.ec/movil-servicios-internet/rest/ConsolidadoContribuyente/obtenerPorNumerosRuc',
    'https://srienlinea.sri.gob.ec/sri-catastro-sujeto-servicio-internet/rest/ConsolidadoContribuyente/obtenerPorNumeroRuc',
    'https://declaraciones.sri.gob.ec/facturacion-internet/rest/ConsolidadoContribuyente/obtenerPorNumeroRuc'
  ];

  /**
   * Inicializar cache y rate limits desde archivos
   */
  private static initializeFromFiles(): void {
    try {
      if (fs.existsSync(this.CACHE_FILE)) {
        const cacheData = JSON.parse(fs.readFileSync(this.CACHE_FILE, 'utf8'));
        this.cache = new Map(Object.entries(cacheData));
      }
      
      if (fs.existsSync(this.RATE_LIMIT_FILE)) {
        const rateLimitData = JSON.parse(fs.readFileSync(this.RATE_LIMIT_FILE, 'utf8'));
        this.rateLimits = new Map(Object.entries(rateLimitData));
      }
    } catch (error) {
      console.log('[SRI-FETCHER] Error inicializando archivos:', error);
    }
  }

  /**
   * Guardar cache y rate limits en archivos
   */
  private static saveToFiles(): void {
    try {
      fs.writeFileSync(this.CACHE_FILE, JSON.stringify(Object.fromEntries(this.cache)));
      fs.writeFileSync(this.RATE_LIMIT_FILE, JSON.stringify(Object.fromEntries(this.rateLimits)));
    } catch (error) {
      console.log('[SRI-FETCHER] Error guardando archivos:', error);
    }
  }

  /**
   * Verificar rate limit para IP (método público)
   */
  static checkRateLimit(ip: string): boolean {
    const now = Date.now();
    const entry = this.rateLimits.get(ip);
    
    if (!entry || now > entry.resetTime) {
      this.rateLimits.set(ip, { count: 1, resetTime: now + this.RATE_LIMIT_WINDOW });
      return true;
    }
    
    if (entry.count >= this.MAX_REQUESTS_PER_MINUTE) {
      return false;
    }
    
    entry.count++;
    return true;
  }

  /**
   * Obtener datos del cache si están disponibles y vigentes
   */
  private static getCachedData(ruc: string): SRICompanyData | null {
    const entry = this.cache.get(ruc);
    if (!entry) return null;
    
    const now = Date.now();
    if (now - entry.timestamp > this.CACHE_DURATION) {
      this.cache.delete(ruc);
      return null;
    }
    
    return entry.data;
  }

  /**
   * Guardar datos en cache (método público)
   */
  static setCachedData(ruc: string, data: SRICompanyData): void {
    this.cache.set(ruc, {
      data,
      timestamp: Date.now()
    });
    this.saveToFiles();
  }

  /**
   * Fetching directo del SRI Ecuador
   */
  static async fetchSRI(ruc: string, clientIP: string = '127.0.0.1', forceRefresh: boolean = false): Promise<SRICompanyData | null> {
    // Inicializar datos desde archivos
    this.initializeFromFiles();
    
    // Verificar rate limit
    if (!this.checkRateLimit(clientIP)) {
      console.log(`[SRI-FETCHER] Rate limit excedido para IP: ${clientIP}`);
      throw new Error('Rate limit excedido. Máximo 5 consultas por minuto.');
    }
    
    // Verificar cache si no se fuerza refresh
    if (!forceRefresh) {
      const cachedData = this.getCachedData(ruc);
      if (cachedData) {
        console.log(`[SRI-FETCHER] Datos obtenidos del cache: ${ruc}`);
        return cachedData;
      }
    }
    
    console.log(`[SRI-FETCHER] Iniciando consulta HTTP para RUC: ${ruc}`);
    
    // Intentar con múltiples endpoints
    for (const [index, endpoint] of this.SRI_ENDPOINTS.entries()) {
      try {
        console.log(`[SRI-FETCHER] Probando endpoint ${index + 1}/${this.SRI_ENDPOINTS.length}: ${endpoint}`);
        
        const result = await this.tryFetchEndpoint(endpoint, ruc);
        if (result) {
          console.log(`[SRI-FETCHER] Consulta exitosa en endpoint ${index + 1} para RUC: ${ruc}`);
          this.setCachedData(ruc, result);
          this.saveToFiles();
          return result;
        }
      } catch (error) {
        console.log(`[SRI-FETCHER] Error en endpoint ${index + 1}:`, error);
      }
    }

    console.log(`[SRI-FETCHER] Todos los endpoints fallaron para RUC: ${ruc}`);
    return null;
  }

  /**
   * Intentar fetch en un endpoint específico
   */
  private static async tryFetchEndpoint(endpoint: string, ruc: string): Promise<SRICompanyData | null> {
    try {
      // Diferentes formatos de URL según el endpoint
      const urls = [
        `${endpoint}?ruc=${ruc}`,
        `${endpoint}?numeroRuc=${ruc}`,
        `${endpoint}/${ruc}`,
        `${endpoint}/consultar/${ruc}`
      ];

      for (const url of urls) {
        try {
          console.log(`[SRI-FETCHER] Probando URL: ${url}`);
          
          // Configurar headers para simular navegador real
          const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Referer': 'https://srienlinea.sri.gob.ec/',
            'Origin': 'https://srienlinea.sri.gob.ec',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          };

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), this.REQUEST_TIMEOUT);

          const response = await fetch(url, {
            method: 'GET',
            headers,
            signal: controller.signal,
            mode: 'cors'
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            console.log(`[SRI-FETCHER] HTTP ${response.status} ${response.statusText} para ${url}`);
            continue;
          }

          const contentType = response.headers.get('content-type');
          let data: any;

          if (contentType?.includes('application/json')) {
            data = await response.json();
          } else {
            const text = await response.text();
            
            // Intentar extraer JSON del HTML si es necesario
            try {
              data = JSON.parse(text);
            } catch {
              // Buscar JSON embebido en HTML
              const jsonMatch = text.match(/\{[^{}]*"razonSocial"[^{}]*\}/);
              if (jsonMatch) {
                data = JSON.parse(jsonMatch[0]);
              } else {
                console.log(`[SRI-FETCHER] Respuesta no contiene JSON válido`);
                continue;
              }
            }
          }

          // Verificar que la respuesta contiene datos válidos
          if (data && (data.razonSocial || data.nombreComercial || data.ruc)) {
            console.log(`[SRI-FETCHER] Datos válidos encontrados en ${url}`);
            return this.transformSRIResponse(data, ruc);
          }

        } catch (error) {
          console.log(`[SRI-FETCHER] Error en URL ${url}:`, error);
        }
      }

      return null;
      
    } catch (error) {
      console.log(`[SRI-FETCHER] Error general en endpoint ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Transformar respuesta del SRI a formato interno
   */
  private static transformSRIResponse(data: any, ruc: string): SRICompanyData {
    return {
      ruc: ruc,
      razonSocial: data.razonSocial || data.denominacion || data.nombre || 'NO DISPONIBLE',
      nombreComercial: data.nombreComercial || data.nombreFantasia || undefined,
      tipoContribuyente: data.tipoContribuyente || data.tipo || 'NO ESPECIFICADO',
      estado: data.estado || data.estadoContribuyente || 'DESCONOCIDO',
      claseContribuyente: data.claseContribuyente || data.clase || 'NO ESPECIFICADA',
      fechaInicioActividades: data.fechaInicioActividades || data.fechaInicio || 'NO DISPONIBLE',
      fechaActualizacion: new Date().toISOString().split('T')[0],
      actividadEconomica: {
        principal: {
          codigo: data.actividadEconomica?.principal?.codigo || data.actividadPrincipal?.codigo || 'NO DISPONIBLE',
          descripcion: data.actividadEconomica?.principal?.descripcion || data.actividadPrincipal?.descripcion || 'NO DISPONIBLE'
        },
        secundarias: data.actividadEconomica?.secundarias || data.actividadesSecundarias || []
      },
      direccion: {
        provincia: data.direccion?.provincia || data.provincia || 'NO DISPONIBLE',
        canton: data.direccion?.canton || data.canton || 'NO DISPONIBLE',
        parroquia: data.direccion?.parroquia || data.parroquia || 'NO DISPONIBLE',
        direccionCompleta: data.direccion?.direccionCompleta || data.direccion || 'NO DISPONIBLE'
      },
      obligaciones: {
        llevarContabilidad: data.obligaciones?.llevarContabilidad || data.llevarContabilidad || false,
        agenteRetencion: data.obligaciones?.agenteRetencion || data.agenteRetencion || false,
        regimen: data.obligaciones?.regimen || data.regimen || 'NO ESPECIFICADO'
      },
      representanteLegal: data.representanteLegal ? {
        cedula: data.representanteLegal.cedula || 'NO DISPONIBLE',
        nombres: data.representanteLegal.nombres || 'NO DISPONIBLE',
        apellidos: data.representanteLegal.apellidos || 'NO DISPONIBLE'
      } : undefined,
      establecimientos: data.establecimientos || [],
      contacto: data.contacto || {}
    };
  }

  /**
   * Limpiar cache expirado
   */
  static cleanExpiredCache(): void {
    const now = Date.now();
    for (const [ruc, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.CACHE_DURATION) {
        this.cache.delete(ruc);
      }
    }
    this.saveToFiles();
  }

  /**
   * Obtener estadísticas del fetcher
   */
  static getStats(): object {
    return {
      cacheSize: this.cache.size,
      rateLimitEntries: this.rateLimits.size,
      lastCleanup: new Date().toISOString(),
      endpoints: this.SRI_ENDPOINTS.length
    };
  }
}