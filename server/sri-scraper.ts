import puppeteer, { Browser, Page } from 'puppeteer';
import puppeteerExtra from 'puppeteer-extra';
import stealthPlugin from 'puppeteer-extra-plugin-stealth';
import UserAgent from 'user-agents';
import { SRICompanyData } from './sri-service';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurar puppeteer con stealth plugin
puppeteerExtra.use(stealthPlugin());

interface CacheEntry {
  data: SRICompanyData;
  timestamp: number;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

export class SRIScraper {
  private static readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas
  private static readonly RATE_LIMIT_WINDOW = 60 * 1000; // 1 minuto
  private static readonly MAX_REQUESTS_PER_MINUTE = 5;
  private static readonly CACHE_FILE = path.join(__dirname, 'sri-cache.json');
  private static readonly RATE_LIMIT_FILE = path.join(__dirname, 'sri-rate-limit.json');
  
  private static cache: Map<string, CacheEntry> = new Map();
  private static rateLimits: Map<string, RateLimitEntry> = new Map();

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
      console.log('[SRI-SCRAPER] Error inicializando archivos:', error);
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
      console.log('[SRI-SCRAPER] Error guardando archivos:', error);
    }
  }

  /**
   * Verificar rate limit para IP
   */
  private static checkRateLimit(ip: string): boolean {
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
   * Guardar datos en cache
   */
  private static setCachedData(ruc: string, data: SRICompanyData): void {
    this.cache.set(ruc, {
      data,
      timestamp: Date.now()
    });
    this.saveToFiles();
  }

  /**
   * Scraping principal del SRI Ecuador
   */
  static async scrapeSRI(ruc: string, clientIP: string = '127.0.0.1', forceRefresh: boolean = false): Promise<SRICompanyData | null> {
    // Inicializar datos desde archivos
    this.initializeFromFiles();
    
    // Verificar rate limit
    if (!this.checkRateLimit(clientIP)) {
      console.log(`[SRI-SCRAPER] Rate limit excedido para IP: ${clientIP}`);
      throw new Error('Rate limit excedido. Máximo 5 consultas por minuto.');
    }
    
    // Verificar cache si no se fuerza refresh
    if (!forceRefresh) {
      const cachedData = this.getCachedData(ruc);
      if (cachedData) {
        console.log(`[SRI-SCRAPER] Datos obtenidos del cache: ${ruc}`);
        return cachedData;
      }
    }
    
    console.log(`[SRI-SCRAPER] Iniciando scraping para RUC: ${ruc}`);
    
    let browser: Browser | null = null;
    try {
      // Configurar browser con stealth mode
      browser = await puppeteerExtra.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu'
        ]
      });

      const page = await browser.newPage();
      
      // Configurar user agent aleatorio
      const userAgent = new UserAgent();
      await page.setUserAgent(userAgent.toString());
      
      // Configurar viewport
      await page.setViewport({ width: 1366, height: 768 });
      
      // Configurar headers adicionales
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Cache-Control': 'max-age=0',
        'Upgrade-Insecure-Requests': '1'
      });

      // Intentar múltiples métodos de consulta
      const methods = [
        () => this.scrapeMethod1(page, ruc),
        () => this.scrapeMethod2(page, ruc),
        () => this.scrapeMethod3(page, ruc)
      ];

      for (const method of methods) {
        try {
          const result = await method();
          if (result) {
            console.log(`[SRI-SCRAPER] Scraping exitoso para RUC: ${ruc}`);
            this.setCachedData(ruc, result);
            return result;
          }
        } catch (error) {
          console.log(`[SRI-SCRAPER] Método falló, intentando siguiente:`, error);
        }
      }

      console.log(`[SRI-SCRAPER] Todos los métodos fallaron para RUC: ${ruc}`);
      return null;
      
    } catch (error) {
      console.error(`[SRI-SCRAPER] Error general:`, error);
      return null;
    } finally {
      if (browser) {
        await browser.close();
      }
      // Guardar rate limits actualizados
      this.saveToFiles();
    }
  }

  /**
   * Método 1: API REST del SRI
   */
  private static async scrapeMethod1(page: Page, ruc: string): Promise<SRICompanyData | null> {
    console.log(`[SRI-SCRAPER] Método 1: API REST para RUC ${ruc}`);
    
    const apiUrl = `https://srienlinea.sri.gob.ec/movil-servicios-internet/rest/ConsolidadoContribuyente/obtenerPorNumerosRuc?ruc=${ruc}`;
    
    try {
      const response = await page.goto(apiUrl, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });
      
      if (!response || !response.ok()) {
        throw new Error(`HTTP ${response?.status()}`);
      }
      
      const content = await page.content();
      const jsonData = JSON.parse(content.replace(/<[^>]*>/g, ''));
      
      if (jsonData && jsonData.razonSocial) {
        return this.transformSRIResponse(jsonData, ruc);
      }
      
      return null;
    } catch (error) {
      console.log(`[SRI-SCRAPER] Método 1 falló:`, error);
      throw error;
    }
  }

  /**
   * Método 2: Formulario web público
   */
  private static async scrapeMethod2(page: Page, ruc: string): Promise<SRICompanyData | null> {
    console.log(`[SRI-SCRAPER] Método 2: Formulario web para RUC ${ruc}`);
    
    try {
      await page.goto('https://srienlinea.sri.gob.ec/facturacion-internet/consultas/publico/ruc-datos2.jspa', {
        waitUntil: 'networkidle2',
        timeout: 30000
      });
      
      // Buscar campo de RUC
      await page.waitForSelector('input[name="ruc"]', { timeout: 10000 });
      
      // Llenar formulario
      await page.type('input[name="ruc"]', ruc);
      
      // Esperar por CAPTCHA si existe
      const captchaExists = await page.$('img[alt="CAPTCHA"]');
      if (captchaExists) {
        console.log(`[SRI-SCRAPER] CAPTCHA detectado, requiere intervención manual`);
        throw new Error('CAPTCHA detectado');
      }
      
      // Enviar formulario
      await page.click('input[type="submit"]');
      
      // Esperar resultados
      await page.waitForSelector('.resultado', { timeout: 15000 });
      
      // Extraer datos
      const data = await page.evaluate(() => {
        const rows = document.querySelectorAll('.resultado tr');
        const result: any = {};
        
        rows.forEach(row => {
          const cells = row.querySelectorAll('td');
          if (cells.length >= 2) {
            const key = cells[0].textContent?.trim();
            const value = cells[1].textContent?.trim();
            if (key && value) {
              result[key] = value;
            }
          }
        });
        
        return result;
      });
      
      return this.transformWebScrapedData(data, ruc);
      
    } catch (error) {
      console.log(`[SRI-SCRAPER] Método 2 falló:`, error);
      throw error;
    }
  }

  /**
   * Método 3: Consulta alternativa
   */
  private static async scrapeMethod3(page: Page, ruc: string): Promise<SRICompanyData | null> {
    console.log(`[SRI-SCRAPER] Método 3: Consulta alternativa para RUC ${ruc}`);
    
    try {
      // Usar endpoint alternativo
      const altUrl = `https://srienlinea.sri.gob.ec/sri-catastro-sujeto-servicio-internet/rest/ConsolidadoContribuyente/obtenerPorNumeroRuc?numeroRuc=${ruc}`;
      
      const response = await page.goto(altUrl, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });
      
      if (!response || !response.ok()) {
        throw new Error(`HTTP ${response?.status()}`);
      }
      
      const content = await page.content();
      const cleanContent = content.replace(/<[^>]*>/g, '');
      
      if (cleanContent.includes('razonSocial') || cleanContent.includes('numeroRuc')) {
        const jsonData = JSON.parse(cleanContent);
        return this.transformSRIResponse(jsonData, ruc);
      }
      
      return null;
      
    } catch (error) {
      console.log(`[SRI-SCRAPER] Método 3 falló:`, error);
      throw error;
    }
  }

  /**
   * Transformar respuesta API del SRI
   */
  private static transformSRIResponse(data: any, ruc: string): SRICompanyData {
    return {
      ruc: ruc,
      razonSocial: data.razonSocial || 'NO DISPONIBLE',
      nombreComercial: data.nombreComercial || undefined,
      tipoContribuyente: data.tipoContribuyente || 'NO ESPECIFICADO',
      estado: data.estado || 'DESCONOCIDO',
      claseContribuyente: data.claseContribuyente || 'NO ESPECIFICADA',
      fechaInicioActividades: data.fechaInicioActividades || 'NO DISPONIBLE',
      fechaActualizacion: new Date().toISOString().split('T')[0],
      actividadEconomica: {
        principal: {
          codigo: data.actividadEconomica?.principal?.codigo || 'NO DISPONIBLE',
          descripcion: data.actividadEconomica?.principal?.descripcion || 'NO DISPONIBLE'
        },
        secundarias: data.actividadEconomica?.secundarias || []
      },
      direccion: {
        provincia: data.direccion?.provincia || 'NO DISPONIBLE',
        canton: data.direccion?.canton || 'NO DISPONIBLE',
        parroquia: data.direccion?.parroquia || 'NO DISPONIBLE',
        direccionCompleta: data.direccion?.direccionCompleta || 'NO DISPONIBLE'
      },
      obligaciones: {
        llevarContabilidad: data.obligaciones?.llevarContabilidad || false,
        agenteRetencion: data.obligaciones?.agenteRetencion || false,
        regimen: data.obligaciones?.regimen || 'NO ESPECIFICADO'
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
   * Transformar datos scrapeados del web
   */
  private static transformWebScrapedData(data: any, ruc: string): SRICompanyData {
    return {
      ruc: ruc,
      razonSocial: data['Razón Social'] || data['RAZÓN SOCIAL'] || 'NO DISPONIBLE',
      tipoContribuyente: data['Tipo Contribuyente'] || 'NO ESPECIFICADO',
      estado: data['Estado'] || 'DESCONOCIDO',
      claseContribuyente: data['Clase Contribuyente'] || 'NO ESPECIFICADA',
      fechaInicioActividades: data['Fecha Inicio Actividades'] || 'NO DISPONIBLE',
      fechaActualizacion: new Date().toISOString().split('T')[0],
      actividadEconomica: {
        principal: {
          codigo: data['Actividad Económica'] || 'NO DISPONIBLE',
          descripcion: data['Descripción Actividad'] || 'NO DISPONIBLE'
        }
      },
      direccion: {
        provincia: data['Provincia'] || 'NO DISPONIBLE',
        canton: data['Cantón'] || 'NO DISPONIBLE',
        parroquia: data['Parroquia'] || 'NO DISPONIBLE',
        direccionCompleta: data['Dirección'] || 'NO DISPONIBLE'
      },
      obligaciones: {
        llevarContabilidad: data['Llevar Contabilidad'] === 'SI',
        agenteRetencion: data['Agente Retención'] === 'SI',
        regimen: data['Régimen'] || 'NO ESPECIFICADO'
      }
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
   * Obtener estadísticas del scraper
   */
  static getStats(): object {
    return {
      cacheSize: this.cache.size,
      rateLimitEntries: this.rateLimits.size,
      lastCleanup: new Date().toISOString()
    };
  }
}