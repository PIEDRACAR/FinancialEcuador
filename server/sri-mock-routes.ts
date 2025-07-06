import type { Express, Request, Response } from "express";

// Mock SRI Integration routes for testing
export function registerSRIMockRoutes(app: Express) {
  // Configure SRI credentials
  app.post('/api/sri/configure', (req: Request, res: Response) => {
    try {
      const { ruc, claveContribuyente, ambiente } = req.body;
      
      if (!ruc || !claveContribuyente) {
        return res.status(400).json({ error: 'RUC y clave del contribuyente son requeridos' });
      }
      
      res.json({
        message: 'Configuración SRI guardada exitosamente',
        config: {
          id: 1,
          ruc: ruc,
          ambiente: ambiente || 'PRODUCCION',
          autoSync: false,
          syncFrequency: 'MENSUAL',
          syncStatus: 'CONFIGURADO',
          lastSync: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      });
    } catch (error: any) {
      console.error('Error configurando SRI:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Start SRI data synchronization
  app.post('/api/sri/sync', (req: Request, res: Response) => {
    try {
      const { fechaInicio, fechaFin, tipos } = req.body;
      
      if (!fechaInicio || !fechaFin) {
        return res.status(400).json({ error: 'Fecha inicio y fin son requeridas' });
      }
      
      // Simulate async sync process
      setTimeout(() => {
        console.log('SRI sync completed for period:', fechaInicio, 'to', fechaFin);
      }, 1000);
      
      res.json({
        message: 'Sincronización SRI iniciada',
        status: 'processing',
        syncId: Math.random().toString(36).substring(2, 15)
      });
    } catch (error: any) {
      console.error('Error iniciando sincronización SRI:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get SRI configuration
  app.get('/api/sri/config', (req: Request, res: Response) => {
    try {
      // Mock configuration data
      res.json({
        configured: true,
        config: {
          id: 1,
          ruc: "0705063105001",
          ambiente: "PRODUCCION",
          autoSync: false,
          syncFrequency: "MENSUAL",
          syncStatus: "CONFIGURADO",
          lastSync: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      });
    } catch (error: any) {
      console.error('Error obteniendo configuración SRI:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get SRI sync statistics
  app.get('/api/sri/stats', (req: Request, res: Response) => {
    try {
      res.json({
        compras: 0,
        ventas: 0,
        retenciones: 0,
        total: 0,
        ultimaActualizacion: new Date().toISOString()
      });
    } catch (error: any) {
      console.error('Error obteniendo estadísticas SRI:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get SRI sync logs
  app.get('/api/sri/logs', (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      
      res.json([]);
    } catch (error: any) {
      console.error('Error obteniendo logs SRI:', error);
      res.status(500).json({ error: error.message });
    }
  });
}