import crypto from 'crypto';
import { db } from './db.js';
import { 
  sriConfig, 
  sriSyncLog, 
  comprasSRI, 
  ventasSRI, 
  retencionesSRI, 
  anulacionesSRI,
  invoices,
  clients,
  suppliers,
  type SRIConfig,
  type InsertSRIConfig,
  type InsertSRISyncLog,
  type InsertCompraSRI,
  type InsertVentaSRI,
  type InsertRetencionSRI
} from '@shared/schema.js';
import { eq, and, desc, gte, lte } from 'drizzle-orm';

/**
 * Servicio de integración directa con SRI Ecuador
 * Permite importar compras, ventas y retenciones automáticamente
 */
export class SRIIntegrationService {
  private static readonly ENCRYPTION_KEY = process.env.SRI_ENCRYPTION_KEY || 'default-key-change-in-production';
  
  /**
   * Configurar acceso al SRI para una empresa
   */
  static async configureCompanySRI(
    companyId: number, 
    ruc: string, 
    claveContribuyente: string,
    ambiente: 'produccion' | 'pruebas' = 'produccion'
  ): Promise<SRIConfig> {
    console.log(`[SRI-INTEGRATION] Configurando acceso SRI para empresa ${companyId}`);
    
    // Encriptar la clave del contribuyente
    const encryptedClave = this.encryptPassword(claveContribuyente);
    
    const configData: InsertSRIConfig = {
      id: crypto.randomUUID(),
      companyId,
      ruc,
      claveContribuyente: encryptedClave,
      ambiente,
      syncStatus: 'pending',
      autoSync: true,
      syncFrequency: 'daily'
    };
    
    // Verificar si ya existe configuración
    const [existingConfig] = await db
      .select()
      .from(sriConfig)
      .where(eq(sriConfig.companyId, companyId))
      .limit(1);
    
    if (existingConfig) {
      // Actualizar configuración existente
      const [updated] = await db
        .update(sriConfig)
        .set({
          ruc,
          claveContribuyente: encryptedClave,
          ambiente,
          updatedAt: new Date()
        })
        .where(eq(sriConfig.companyId, companyId))
        .returning();
      
      console.log(`[SRI-INTEGRATION] Configuración SRI actualizada para empresa ${companyId}`);
      return updated;
    } else {
      // Crear nueva configuración
      const [newConfig] = await db
        .insert(sriConfig)
        .values(configData)
        .returning();
      
      console.log(`[SRI-INTEGRATION] Nueva configuración SRI creada para empresa ${companyId}`);
      return newConfig;
    }
  }
  
  /**
   * Iniciar sincronización completa de datos SRI
   */
  static async syncCompanyData(
    companyId: number,
    fechaInicio: Date,
    fechaFin: Date,
    tipos: ('compras' | 'ventas' | 'retenciones')[] = ['compras', 'ventas', 'retenciones']
  ): Promise<void> {
    console.log(`[SRI-INTEGRATION] 🚀 Iniciando sincronización SRI para empresa ${companyId}`);
    
    // Obtener configuración SRI
    const [config] = await db
      .select()
      .from(sriConfig)
      .where(eq(sriConfig.companyId, companyId))
      .limit(1);
    
    if (!config) {
      throw new Error('No se encontró configuración SRI para esta empresa');
    }
    
    // Desencriptar clave
    const claveContribuyente = this.decryptPassword(config.claveContribuyente);
    
    // Marcar inicio de sincronización
    await db
      .update(sriConfig)
      .set({ syncStatus: 'syncing', lastSync: new Date() })
      .where(eq(sriConfig.companyId, companyId));
    
    let allSuccess = true;
    const results = [];
    
    for (const tipo of tipos) {
      try {
        console.log(`[SRI-INTEGRATION] 📥 Sincronizando ${tipo}...`);
        
        const syncLogData: InsertSRISyncLog = {
          id: crypto.randomUUID(),
          companyId,
          syncType: tipo,
          status: 'success',
          recordsProcessed: 0,
          recordsImported: 0
        };
        
        let result;
        switch (tipo) {
          case 'compras':
            result = await this.syncCompras(companyId, config.ruc, claveContribuyente, fechaInicio, fechaFin);
            break;
          case 'ventas':
            result = await this.syncVentas(companyId, config.ruc, claveContribuyente, fechaInicio, fechaFin);
            break;
          case 'retenciones':
            result = await this.syncRetenciones(companyId, config.ruc, claveContribuyente, fechaInicio, fechaFin);
            break;
        }
        
        if (result) {
          syncLogData.recordsProcessed = result.processed;
          syncLogData.recordsImported = result.imported;
          syncLogData.details = JSON.stringify(result.details);
          
          console.log(`[SRI-INTEGRATION] ✅ ${tipo}: ${result.imported}/${result.processed} registros importados`);
          results.push(result);
        }
        
        // Registrar log de sincronización
        await db.insert(sriSyncLog).values(syncLogData);
        
      } catch (error: any) {
        console.error(`[SRI-INTEGRATION] ❌ Error sincronizando ${tipo}:`, error.message);
        allSuccess = false;
        
        // Registrar error en log
        await db.insert(sriSyncLog).values({
          id: crypto.randomUUID(),
          companyId,
          syncType: tipo,
          status: 'error',
          errors: JSON.stringify({ message: error.message, stack: error.stack })
        });
      }
    }
    
    // Actualizar estado final
    await db
      .update(sriConfig)
      .set({ 
        syncStatus: allSuccess ? 'completed' : 'error',
        lastSync: new Date() 
      })
      .where(eq(sriConfig.companyId, companyId));
    
    console.log(`[SRI-INTEGRATION] 🎯 Sincronización completada para empresa ${companyId}`);
  }
  
  /**
   * Sincronizar compras desde SRI
   */
  private static async syncCompras(
    companyId: number,
    ruc: string,
    clave: string,
    fechaInicio: Date,
    fechaFin: Date
  ): Promise<{ processed: number; imported: number; details: any }> {
    console.log(`[SRI-INTEGRATION] 🛒 Consultando compras en SRI desde ${fechaInicio.toISOString().split('T')[0]} hasta ${fechaFin.toISOString().split('T')[0]}`);
    
    // Simular consulta real al SRI (aquí se integraría con la API real del SRI)
    const comprasData = await this.consultarComprasSRI(ruc, clave, fechaInicio, fechaFin);
    
    let imported = 0;
    const details = [];
    
    for (const compra of comprasData) {
      try {
        // Verificar si ya existe el comprobante
        const [existing] = await db
          .select()
          .from(comprasSRI)
          .where(eq(comprasSRI.claveAcceso, compra.claveAcceso))
          .limit(1);
        
        if (!existing) {
          // Insertar nueva compra
          const compraData: InsertCompraSRI = {
            id: crypto.randomUUID(),
            companyId,
            numeroComprobante: compra.numeroComprobante,
            rucProveedor: compra.rucProveedor,
            razonSocialProveedor: compra.razonSocialProveedor,
            fechaEmision: compra.fechaEmision,
            fechaAutorizacion: compra.fechaAutorizacion,
            tipoComprobante: compra.tipoComprobante,
            ambiente: compra.ambiente,
            baseImponible: compra.baseImponible.toString(),
            baseImpGrav: compra.baseImpGrav.toString(),
            baseImpExe: compra.baseImpExe.toString(),
            montoIce: compra.montoIce.toString(),
            montoIva: compra.montoIva.toString(),
            valorRetenidoIva: compra.valorRetenidoIva.toString(),
            valorRetenidoRenta: compra.valorRetenidoRenta.toString(),
            valorTotal: compra.valorTotal.toString(),
            estadoComprobante: compra.estadoComprobante,
            claveAcceso: compra.claveAcceso,
            xml: compra.xml
          };
          
          await db.insert(comprasSRI).values(compraData);
          
          // Crear proveedor si no existe
          await this.crearProveedorSiNoExiste(companyId, compra.rucProveedor, compra.razonSocialProveedor);
          
          imported++;
          details.push({
            comprobante: compra.numeroComprobante,
            proveedor: compra.razonSocialProveedor,
            valor: compra.valorTotal,
            accion: 'importado'
          });
        } else {
          details.push({
            comprobante: compra.numeroComprobante,
            proveedor: compra.razonSocialProveedor,
            valor: compra.valorTotal,
            accion: 'ya_existe'
          });
        }
      } catch (error: any) {
        console.error(`[SRI-INTEGRATION] Error procesando compra ${compra.numeroComprobante}:`, error.message);
        details.push({
          comprobante: compra.numeroComprobante,
          error: error.message,
          accion: 'error'
        });
      }
    }
    
    return {
      processed: comprasData.length,
      imported,
      details
    };
  }
  
  /**
   * Sincronizar ventas desde SRI
   */
  private static async syncVentas(
    companyId: number,
    ruc: string,
    clave: string,
    fechaInicio: Date,
    fechaFin: Date
  ): Promise<{ processed: number; imported: number; details: any }> {
    console.log(`[SRI-INTEGRATION] 💰 Consultando ventas en SRI desde ${fechaInicio.toISOString().split('T')[0]} hasta ${fechaFin.toISOString().split('T')[0]}`);
    
    const ventasData = await this.consultarVentasSRI(ruc, clave, fechaInicio, fechaFin);
    
    let imported = 0;
    const details = [];
    
    for (const venta of ventasData) {
      try {
        const [existing] = await db
          .select()
          .from(ventasSRI)
          .where(eq(ventasSRI.claveAcceso, venta.claveAcceso))
          .limit(1);
        
        if (!existing) {
          const ventaData: InsertVentaSRI = {
            id: crypto.randomUUID(),
            companyId,
            numeroComprobante: venta.numeroComprobante,
            rucCliente: venta.rucCliente,
            razonSocialCliente: venta.razonSocialCliente,
            fechaEmision: venta.fechaEmision,
            fechaAutorizacion: venta.fechaAutorizacion,
            tipoComprobante: venta.tipoComprobante,
            ambiente: venta.ambiente,
            baseImponible: venta.baseImponible.toString(),
            baseImpGrav: venta.baseImpGrav.toString(),
            baseImpExe: venta.baseImpExe.toString(),
            montoIce: venta.montoIce.toString(),
            montoIva: venta.montoIva.toString(),
            valorTotal: venta.valorTotal.toString(),
            estadoComprobante: venta.estadoComprobante,
            claveAcceso: venta.claveAcceso,
            xml: venta.xml
          };
          
          await db.insert(ventasSRI).values(ventaData);
          
          // Crear cliente si no existe
          await this.crearClienteSiNoExiste(companyId, venta.rucCliente, venta.razonSocialCliente);
          
          imported++;
          details.push({
            comprobante: venta.numeroComprobante,
            cliente: venta.razonSocialCliente,
            valor: venta.valorTotal,
            accion: 'importado'
          });
        }
      } catch (error: any) {
        console.error(`[SRI-INTEGRATION] Error procesando venta ${venta.numeroComprobante}:`, error.message);
      }
    }
    
    return {
      processed: ventasData.length,
      imported,
      details
    };
  }
  
  /**
   * Sincronizar retenciones desde SRI
   */
  private static async syncRetenciones(
    companyId: number,
    ruc: string,
    clave: string,
    fechaInicio: Date,
    fechaFin: Date
  ): Promise<{ processed: number; imported: number; details: any }> {
    console.log(`[SRI-INTEGRATION] 📋 Consultando retenciones en SRI desde ${fechaInicio.toISOString().split('T')[0]} hasta ${fechaFin.toISOString().split('T')[0]}`);
    
    const retencionesData = await this.consultarRetencionesSRI(ruc, clave, fechaInicio, fechaFin);
    
    let imported = 0;
    const details = [];
    
    for (const retencion of retencionesData) {
      try {
        const [existing] = await db
          .select()
          .from(retencionesSRI)
          .where(eq(retencionesSRI.claveAcceso, retencion.claveAcceso))
          .limit(1);
        
        if (!existing) {
          const retencionData: InsertRetencionSRI = {
            id: crypto.randomUUID(),
            companyId,
            numeroRetencion: retencion.numeroRetencion,
            rucSujeto: retencion.rucSujeto,
            razonSocialSujeto: retencion.razonSocialSujeto,
            fechaEmision: retencion.fechaEmision,
            fechaAutorizacion: retencion.fechaAutorizacion,
            tipoDocumentoSustento: retencion.tipoDocumentoSustento,
            numeroDocumentoSustento: retencion.numeroDocumentoSustento,
            fechaEmisionDocSustento: retencion.fechaEmisionDocSustento,
            baseImponible: retencion.baseImponible.toString(),
            impuesto: retencion.impuesto,
            codigoRetencion: retencion.codigoRetencion,
            porcentajeRetencion: retencion.porcentajeRetencion.toString(),
            valorRetenido: retencion.valorRetenido.toString(),
            claveAcceso: retencion.claveAcceso,
            xml: retencion.xml
          };
          
          await db.insert(retencionesSRI).values(retencionData);
          imported++;
          
          details.push({
            numero: retencion.numeroRetencion,
            sujeto: retencion.razonSocialSujeto,
            valor: retencion.valorRetenido,
            accion: 'importado'
          });
        }
      } catch (error: any) {
        console.error(`[SRI-INTEGRATION] Error procesando retención ${retencion.numeroRetencion}:`, error.message);
      }
    }
    
    return {
      processed: retencionesData.length,
      imported,
      details
    };
  }
  
  /**
   * Consultar compras en SRI (simulación - aquí se conectaría a la API real)
   */
  private static async consultarComprasSRI(ruc: string, clave: string, fechaInicio: Date, fechaFin: Date): Promise<any[]> {
    // En producción, aquí se haría la conexión real al SRI
    console.log(`[SRI-INTEGRATION] 🔗 Conectando al SRI para consultar compras...`);
    console.log(`[SRI-INTEGRATION] RUC: ${ruc}, Período: ${fechaInicio.toISOString().split('T')[0]} - ${fechaFin.toISOString().split('T')[0]}`);
    
    // Datos de ejemplo para demostrar la funcionalidad
    return [
      {
        numeroComprobante: "001-001-000000001",
        rucProveedor: "0992570239001",
        razonSocialProveedor: "PROVEEDOR EJEMPLO S.A.",
        fechaEmision: new Date('2024-01-15'),
        fechaAutorizacion: new Date('2024-01-15'),
        tipoComprobante: "01",
        ambiente: "2",
        baseImponible: 1000.00,
        baseImpGrav: 1000.00,
        baseImpExe: 0.00,
        montoIce: 0.00,
        montoIva: 150.00,
        valorRetenidoIva: 15.00,
        valorRetenidoRenta: 10.00,
        valorTotal: 1125.00,
        estadoComprobante: "AUTORIZADO",
        claveAcceso: "1520240115019925702390011000010010000000011234567890",
        xml: "<factura>...</factura>"
      }
    ];
  }
  
  /**
   * Consultar ventas en SRI (simulación)
   */
  private static async consultarVentasSRI(ruc: string, clave: string, fechaInicio: Date, fechaFin: Date): Promise<any[]> {
    console.log(`[SRI-INTEGRATION] 🔗 Conectando al SRI para consultar ventas...`);
    
    return [
      {
        numeroComprobante: "001-001-000000001",
        rucCliente: "0995234567001",
        razonSocialCliente: "CLIENTE EJEMPLO S.A.",
        fechaEmision: new Date('2024-01-15'),
        fechaAutorizacion: new Date('2024-01-15'),
        tipoComprobante: "01",
        ambiente: "2",
        baseImponible: 2000.00,
        baseImpGrav: 2000.00,
        baseImpExe: 0.00,
        montoIce: 0.00,
        montoIva: 300.00,
        valorTotal: 2300.00,
        estadoComprobante: "AUTORIZADO",
        claveAcceso: "1520240115019925702390011000010010000000021234567890",
        xml: "<factura>...</factura>"
      }
    ];
  }
  
  /**
   * Consultar retenciones en SRI (simulación)
   */
  private static async consultarRetencionesSRI(ruc: string, clave: string, fechaInicio: Date, fechaFin: Date): Promise<any[]> {
    console.log(`[SRI-INTEGRATION] 🔗 Conectando al SRI para consultar retenciones...`);
    
    return [
      {
        numeroRetencion: "001-001-000000001",
        rucSujeto: "0995234567001",
        razonSocialSujeto: "SUJETO RETENCION S.A.",
        fechaEmision: new Date('2024-01-15'),
        fechaAutorizacion: new Date('2024-01-15'),
        tipoDocumentoSustento: "01",
        numeroDocumentoSustento: "001-001-000000001",
        fechaEmisionDocSustento: new Date('2024-01-15'),
        baseImponible: 1000.00,
        impuesto: "1",
        codigoRetencion: "303",
        porcentajeRetencion: 1.00,
        valorRetenido: 10.00,
        claveAcceso: "1520240115019925702390071000010010000000011234567890",
        xml: "<retencion>...</retencion>"
      }
    ];
  }
  
  /**
   * Crear proveedor si no existe
   */
  private static async crearProveedorSiNoExiste(companyId: number, ruc: string, razonSocial: string): Promise<void> {
    const [existing] = await db
      .select()
      .from(suppliers)
      .where(and(eq(suppliers.companyId, companyId), eq(suppliers.ruc, ruc)))
      .limit(1);
    
    if (!existing) {
      await db.insert(suppliers).values({
        name: razonSocial,
        ruc,
        companyId,
        category: 'bienes',
        isActive: true
      });
      console.log(`[SRI-INTEGRATION] ✅ Proveedor creado: ${razonSocial} (${ruc})`);
    }
  }
  
  /**
   * Crear cliente si no existe
   */
  private static async crearClienteSiNoExiste(companyId: number, ruc: string, razonSocial: string): Promise<void> {
    const [existing] = await db
      .select()
      .from(clients)
      .where(and(eq(clients.companyId, companyId), eq(clients.ruc, ruc)))
      .limit(1);
    
    if (!existing) {
      await db.insert(clients).values({
        name: razonSocial,
        ruc,
        companyId,
        isActive: true
      });
      console.log(`[SRI-INTEGRATION] ✅ Cliente creado: ${razonSocial} (${ruc})`);
    }
  }
  
  /**
   * Encriptar contraseña
   */
  private static encryptPassword(password: string): string {
    const cipher = crypto.createCipher('aes192', this.ENCRYPTION_KEY);
    let encrypted = cipher.update(password, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }
  
  /**
   * Desencriptar contraseña
   */
  private static decryptPassword(encryptedPassword: string): string {
    const decipher = crypto.createDecipher('aes192', this.ENCRYPTION_KEY);
    let decrypted = decipher.update(encryptedPassword, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
  
  /**
   * Obtener configuración SRI de una empresa
   */
  static async getCompanySRIConfig(companyId: number): Promise<SRIConfig | null> {
    const [config] = await db
      .select()
      .from(sriConfig)
      .where(eq(sriConfig.companyId, companyId))
      .limit(1);
    
    return config || null;
  }
  
  /**
   * Obtener logs de sincronización
   */
  static async getSyncLogs(companyId: number, limit: number = 50) {
    return await db
      .select()
      .from(sriSyncLog)
      .where(eq(sriSyncLog.companyId, companyId))
      .orderBy(desc(sriSyncLog.createdAt))
      .limit(limit);
  }
  
  /**
   * Obtener estadísticas de sincronización
   */
  static async getSyncStats(companyId: number) {
    // Obtener conteos de registros importados
    const [comprasCount] = await db
      .select({ count: db.$count() })
      .from(comprasSRI)
      .where(eq(comprasSRI.companyId, companyId));
    
    const [ventasCount] = await db
      .select({ count: db.$count() })
      .from(ventasSRI)
      .where(eq(ventasSRI.companyId, companyId));
    
    const [retencionesCount] = await db
      .select({ count: db.$count() })
      .from(retencionesSRI)
      .where(eq(retencionesSRI.companyId, companyId));
    
    return {
      compras: comprasCount?.count || 0,
      ventas: ventasCount?.count || 0,
      retenciones: retencionesCount?.count || 0,
      total: (comprasCount?.count || 0) + (ventasCount?.count || 0) + (retencionesCount?.count || 0)
    };
  }
}