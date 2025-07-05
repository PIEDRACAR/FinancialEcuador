import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  loginSchema, registerSchema, insertCompanySchema, insertClientSchema, insertInvoiceSchema,
  insertSupplierSchema, insertProductSchema, insertPurchaseSchema, insertRetentionSchema,
  insertChartOfAccountSchema, insertJournalEntrySchema, insertJournalEntryDetailSchema,
  insertEmployeeSchema, insertPayrollSchema, ECUADOR_TAX_RATES
} from "@shared/schema";
import { z } from "zod";

interface AuthenticatedRequest extends Request {
  userId: number;
}

// Simple session store for JWT-like functionality
const sessions = new Map<string, { userId: number; expires: Date }>();

function generateToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function verifyToken(req: any): number | null {
  const sessionId = req.headers.authorization?.replace('Bearer ', '');
  if (!sessionId) return null;
  
  const session = sessions.get(sessionId);
  if (!session || session.expires < new Date()) {
    sessions.delete(sessionId);
    return null;
  }
  
  return session.userId;
}

function requireAuth(req: Request, res: Response, next: NextFunction) {
  const userId = verifyToken(req);
  if (!userId) {
    return res.status(401).json({ message: "No autorizado" });
  }
  (req as AuthenticatedRequest).userId = userId;
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const data = registerSchema.parse(req.body);
      
      // Check if user exists
      const existingUser = await storage.getUserByEmail(data.email);
      if (existingUser) {
        return res.status(400).json({ message: "El usuario ya existe" });
      }
      
      // Create user (in production, hash password)
      const user = await storage.createUser({
        name: data.name,
        email: data.email,
        password: data.password, // In production: hash this
      });
      
      // Create session
      const token = generateToken();
      sessions.set(token, {
        userId: user.id,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      });
      
      res.json({ user: { id: user.id, name: user.name, email: user.email }, token });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Datos inválidos", errors: error.errors });
      } else {
        res.status(500).json({ message: "Error interno del servidor" });
      }
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const data = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(data.email);
      if (!user || user.password !== data.password) { // In production: compare hashed passwords
        return res.status(401).json({ message: "Credenciales inválidas" });
      }
      
      // Create session
      const token = generateToken();
      sessions.set(token, {
        userId: user.id,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      });
      
      res.json({ user: { id: user.id, name: user.name, email: user.email }, token });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Datos inválidos", errors: error.errors });
      } else {
        res.status(500).json({ message: "Error interno del servidor" });
      }
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    const sessionId = req.headers.authorization?.replace('Bearer ', '');
    if (sessionId) {
      sessions.delete(sessionId);
    }
    res.json({ message: "Sesión cerrada" });
  });

  app.get("/api/auth/me", requireAuth, async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const user = await storage.getUser(authReq.userId);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    res.json({ id: user.id, name: user.name, email: user.email });
  });

  // Company routes
  app.get("/api/companies", requireAuth, async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const companies = await storage.getCompaniesByOwner(authReq.userId);
    res.json(companies);
  });

  app.post("/api/companies", requireAuth, async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const data = insertCompanySchema.parse(req.body);
      const company = await storage.createCompany({ ...data, ownerId: authReq.userId });
      res.json(company);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Datos inválidos", errors: error.errors });
      } else {
        res.status(500).json({ message: "Error interno del servidor" });
      }
    }
  });

  app.get("/api/companies/:id", requireAuth, async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const company = await storage.getCompany(parseInt(req.params.id));
    if (!company || company.ownerId !== authReq.userId) {
      return res.status(404).json({ message: "Empresa no encontrada" });
    }
    res.json(company);
  });

  app.put("/api/companies/:id", requireAuth, async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const data = insertCompanySchema.partial().parse(req.body);
      const company = await storage.getCompany(parseInt(req.params.id));
      
      if (!company || company.ownerId !== authReq.userId) {
        return res.status(404).json({ message: "Empresa no encontrada" });
      }
      
      const updatedCompany = await storage.updateCompany(parseInt(req.params.id), data);
      res.json(updatedCompany);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Datos inválidos", errors: error.errors });
      } else {
        res.status(500).json({ message: "Error interno del servidor" });
      }
    }
  });

  app.delete("/api/companies/:id", requireAuth, async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const company = await storage.getCompany(parseInt(req.params.id));
    if (!company || company.ownerId !== authReq.userId) {
      return res.status(404).json({ message: "Empresa no encontrada" });
    }
    
    await storage.deleteCompany(parseInt(req.params.id));
    res.json({ message: "Empresa eliminada" });
  });

  // Client routes
  app.get("/api/companies/:companyId/clients", requireAuth, async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const company = await storage.getCompany(parseInt(req.params.companyId));
    if (!company || company.ownerId !== authReq.userId) {
      return res.status(404).json({ message: "Empresa no encontrada" });
    }
    
    const clients = await storage.getClientsByCompany(parseInt(req.params.companyId));
    res.json(clients);
  });

  app.post("/api/companies/:companyId/clients", requireAuth, async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const company = await storage.getCompany(parseInt(req.params.companyId));
      if (!company || company.ownerId !== authReq.userId) {
        return res.status(404).json({ message: "Empresa no encontrada" });
      }
      
      const data = insertClientSchema.parse(req.body);
      const client = await storage.createClient({ ...data, companyId: parseInt(req.params.companyId) });
      res.json(client);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Datos inválidos", errors: error.errors });
      } else {
        res.status(500).json({ message: "Error interno del servidor" });
      }
    }
  });

  app.get("/api/clients/:id", requireAuth, async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const client = await storage.getClient(parseInt(req.params.id));
    if (!client) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }
    
    const company = await storage.getCompany(client.companyId);
    if (!company || company.ownerId !== authReq.userId) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }
    
    res.json(client);
  });

  app.put("/api/clients/:id", requireAuth, async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const client = await storage.getClient(parseInt(req.params.id));
      if (!client) {
        return res.status(404).json({ message: "Cliente no encontrado" });
      }
      
      const company = await storage.getCompany(client.companyId);
      if (!company || company.ownerId !== authReq.userId) {
        return res.status(404).json({ message: "Cliente no encontrado" });
      }
      
      const data = insertClientSchema.partial().parse(req.body);
      const updatedClient = await storage.updateClient(parseInt(req.params.id), data);
      res.json(updatedClient);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Datos inválidos", errors: error.errors });
      } else {
        res.status(500).json({ message: "Error interno del servidor" });
      }
    }
  });

  app.delete("/api/clients/:id", requireAuth, async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const client = await storage.getClient(parseInt(req.params.id));
    if (!client) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }
    
    const company = await storage.getCompany(client.companyId);
    if (!company || company.ownerId !== authReq.userId) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }
    
    await storage.deleteClient(parseInt(req.params.id));
    res.json({ message: "Cliente eliminado" });
  });

  // Invoice routes
  app.get("/api/companies/:companyId/invoices", requireAuth, async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const company = await storage.getCompany(parseInt(req.params.companyId));
    if (!company || company.ownerId !== authReq.userId) {
      return res.status(404).json({ message: "Empresa no encontrada" });
    }
    
    const invoices = await storage.getInvoicesByCompany(parseInt(req.params.companyId));
    res.json(invoices);
  });

  app.post("/api/companies/:companyId/invoices", requireAuth, async (req, res) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const company = await storage.getCompany(parseInt(req.params.companyId));
      if (!company || company.ownerId !== authReq.userId) {
        return res.status(404).json({ message: "Empresa no encontrada" });
      }
      
      const data = insertInvoiceSchema.parse(req.body);
      const invoice = await storage.createInvoice({ ...data, companyId: parseInt(req.params.companyId) });
      res.json(invoice);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Datos inválidos", errors: error.errors });
      } else {
        res.status(500).json({ message: "Error interno del servidor" });
      }
    }
  });

  // Supplier routes (Módulo de Proveedores)
  app.get("/api/suppliers", requireAuth, async (req, res) => {
    const companyId = parseInt(req.query.companyId as string);
    if (!companyId) {
      return res.status(400).json({ message: "Company ID es requerido" });
    }
    
    const suppliers = await storage.getSuppliersByCompany(companyId);
    res.json(suppliers);
  });

  app.post("/api/suppliers", requireAuth, async (req, res) => {
    try {
      const data = insertSupplierSchema.parse(req.body);
      const supplier = await storage.createSupplier(data);
      res.json(supplier);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Datos inválidos", errors: error.errors });
      } else {
        res.status(500).json({ message: "Error interno del servidor" });
      }
    }
  });

  app.put("/api/suppliers/:id", requireAuth, async (req, res) => {
    try {
      const data = insertSupplierSchema.partial().parse(req.body);
      const supplier = await storage.updateSupplier(parseInt(req.params.id), data);
      if (!supplier) {
        return res.status(404).json({ message: "Proveedor no encontrado" });
      }
      res.json(supplier);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Datos inválidos", errors: error.errors });
      } else {
        res.status(500).json({ message: "Error interno del servidor" });
      }
    }
  });

  app.delete("/api/suppliers/:id", requireAuth, async (req, res) => {
    const deleted = await storage.deleteSupplier(parseInt(req.params.id));
    if (!deleted) {
      return res.status(404).json({ message: "Proveedor no encontrado" });
    }
    res.json({ message: "Proveedor eliminado" });
  });

  // Product routes (Módulo de Productos)
  app.get("/api/products", requireAuth, async (req, res) => {
    const companyId = parseInt(req.query.companyId as string);
    if (!companyId) {
      return res.status(400).json({ message: "Company ID es requerido" });
    }
    
    const products = await storage.getProductsByCompany(companyId);
    res.json(products);
  });

  app.post("/api/products", requireAuth, async (req, res) => {
    try {
      const data = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(data);
      res.json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Datos inválidos", errors: error.errors });
      } else {
        res.status(500).json({ message: "Error interno del servidor" });
      }
    }
  });

  app.put("/api/products/:id", requireAuth, async (req, res) => {
    try {
      const data = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(parseInt(req.params.id), data);
      if (!product) {
        return res.status(404).json({ message: "Producto no encontrado" });
      }
      res.json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Datos inválidos", errors: error.errors });
      } else {
        res.status(500).json({ message: "Error interno del servidor" });
      }
    }
  });

  app.delete("/api/products/:id", requireAuth, async (req, res) => {
    const deleted = await storage.deleteProduct(parseInt(req.params.id));
    if (!deleted) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }
    res.json({ message: "Producto eliminado" });
  });

  // Purchase routes (Módulo de Compras)
  app.get("/api/purchases", requireAuth, async (req, res) => {
    const companyId = parseInt(req.query.companyId as string);
    if (!companyId) {
      return res.status(400).json({ message: "Company ID es requerido" });
    }
    
    const purchases = await storage.getPurchasesByCompany(companyId);
    res.json(purchases);
  });

  app.post("/api/purchases", requireAuth, async (req, res) => {
    try {
      const data = insertPurchaseSchema.parse(req.body);
      const purchase = await storage.createPurchase(data);
      res.json(purchase);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Datos inválidos", errors: error.errors });
      } else {
        res.status(500).json({ message: "Error interno del servidor" });
      }
    }
  });

  app.put("/api/purchases/:id", requireAuth, async (req, res) => {
    try {
      const data = insertPurchaseSchema.partial().parse(req.body);
      const purchase = await storage.updatePurchase(parseInt(req.params.id), data);
      if (!purchase) {
        return res.status(404).json({ message: "Compra no encontrada" });
      }
      res.json(purchase);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Datos inválidos", errors: error.errors });
      } else {
        res.status(500).json({ message: "Error interno del servidor" });
      }
    }
  });

  app.delete("/api/purchases/:id", requireAuth, async (req, res) => {
    const deleted = await storage.deletePurchase(parseInt(req.params.id));
    if (!deleted) {
      return res.status(404).json({ message: "Compra no encontrada" });
    }
    res.json({ message: "Compra eliminada" });
  });

  // Retention routes (Módulo de Retenciones)
  app.get("/api/retentions", requireAuth, async (req, res) => {
    const companyId = parseInt(req.query.companyId as string);
    if (!companyId) {
      return res.status(400).json({ message: "Company ID es requerido" });
    }
    
    const retentions = await storage.getRetentionsByCompany(companyId);
    res.json(retentions);
  });

  app.post("/api/retentions", requireAuth, async (req, res) => {
    try {
      const data = insertRetentionSchema.parse(req.body);
      const retention = await storage.createRetention(data);
      res.json(retention);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Datos inválidos", errors: error.errors });
      } else {
        res.status(500).json({ message: "Error interno del servidor" });
      }
    }
  });

  // Rutas especiales para cálculo automático de retenciones Ecuador
  app.post("/api/retentions/calculate", requireAuth, async (req, res) => {
    try {
      const { baseAmount, type, concept } = req.body;
      
      let percentage = 0;
      if (type === "fuente") {
        switch (concept) {
          case "bienes":
            percentage = ECUADOR_TAX_RATES.RETENCIONES.FUENTE.BIENES;
            break;
          case "servicios":
            percentage = ECUADOR_TAX_RATES.RETENCIONES.FUENTE.SERVICIOS;
            break;
          case "arrendamientos":
            percentage = ECUADOR_TAX_RATES.RETENCIONES.FUENTE.ARRENDAMIENTOS;
            break;
          case "honorarios":
            percentage = ECUADOR_TAX_RATES.RETENCIONES.FUENTE.HONORARIOS;
            break;
        }
      } else if (type === "iva") {
        percentage = concept === "bienes" 
          ? ECUADOR_TAX_RATES.RETENCIONES.IVA.BIENES 
          : ECUADOR_TAX_RATES.RETENCIONES.IVA.SERVICIOS;
      }
      
      const retentionAmount = (parseFloat(baseAmount) * percentage) / 100;
      
      res.json({
        percentage,
        retentionAmount: retentionAmount.toFixed(2)
      });
    } catch (error) {
      res.status(500).json({ message: "Error calculando retención" });
    }
  });

  // SRI Integration routes (Módulo SRI)
  app.get("/api/sri/connection", requireAuth, async (req, res) => {
    // Simulación de conexión SRI
    res.json({
      status: "connected",
      lastSync: new Date().toISOString(),
      environment: "test" // test o production
    });
  });

  app.get("/api/sri/exportable-data", requireAuth, async (req, res) => {
    const companyId = parseInt(req.query.companyId as string);
    if (!companyId) {
      return res.status(400).json({ message: "Company ID es requerido" });
    }
    
    const invoices = await storage.getInvoicesByCompany(companyId);
    const purchases = await storage.getPurchasesByCompany(companyId);
    const retentions = await storage.getRetentionsByCompany(companyId);
    
    res.json({
      facturas: invoices.length,
      compras: purchases.length,
      retenciones: retentions.length,
      lastExport: new Date().toISOString()
    });
  });

  app.post("/api/sri/export", requireAuth, async (req, res) => {
    try {
      const { format, type, companyId } = req.body;
      
      // Simulación de exportación a SRI
      res.json({
        success: true,
        message: `Datos exportados exitosamente en formato ${format}`,
        filename: `sri_export_${type}_${new Date().getTime()}.${format.toLowerCase()}`,
        exportDate: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({ message: "Error en exportación SRI" });
    }
  });

  app.get("/api/sri/import-history", requireAuth, async (req, res) => {
    // Simulación de historial de importaciones
    res.json([
      {
        id: 1,
        date: new Date().toISOString(),
        type: "facturas",
        status: "completed",
        records: 15
      },
      {
        id: 2,
        date: new Date(Date.now() - 86400000).toISOString(),
        type: "compras",
        status: "completed", 
        records: 8
      }
    ]);
  });

  // Tax rates endpoint (Tasas Impositivas Ecuador)
  app.get("/api/tax-rates", requireAuth, async (req, res) => {
    res.json(ECUADOR_TAX_RATES);
  });

  // Report generation routes (Módulo de Reportes)
  app.get("/api/reports/sales", requireAuth, async (req, res) => {
    const companyId = parseInt(req.query.companyId as string);
    const { startDate, endDate } = req.query;
    
    if (!companyId) {
      return res.status(400).json({ message: "Company ID es requerido" });
    }
    
    const invoices = await storage.getInvoicesByCompany(companyId);
    
    // Filtrar por fechas si se proporcionan
    let filteredInvoices = invoices;
    if (startDate && endDate) {
      const start = new Date(startDate as string);
      const end = new Date(endDate as string);
      filteredInvoices = invoices.filter(invoice => 
        new Date(invoice.date) >= start && new Date(invoice.date) <= end
      );
    }
    
    const totalSales = filteredInvoices.reduce((sum, invoice) => 
      sum + parseFloat(invoice.total), 0
    );
    const totalIva = filteredInvoices.reduce((sum, invoice) => 
      sum + parseFloat(invoice.iva), 0
    );
    
    res.json({
      period: { startDate, endDate },
      totalInvoices: filteredInvoices.length,
      totalSales: totalSales.toFixed(2),
      totalIva: totalIva.toFixed(2),
      averageTicket: (totalSales / filteredInvoices.length || 0).toFixed(2),
      invoices: filteredInvoices
    });
  });

  app.get("/api/reports/purchases", requireAuth, async (req, res) => {
    const companyId = parseInt(req.query.companyId as string);
    const { startDate, endDate } = req.query;
    
    if (!companyId) {
      return res.status(400).json({ message: "Company ID es requerido" });
    }
    
    const purchases = await storage.getPurchasesByCompany(companyId);
    
    // Filtrar por fechas si se proporcionan
    let filteredPurchases = purchases;
    if (startDate && endDate) {
      const start = new Date(startDate as string);
      const end = new Date(endDate as string);
      filteredPurchases = purchases.filter(purchase => 
        new Date(purchase.date) >= start && new Date(purchase.date) <= end
      );
    }
    
    const totalPurchases = filteredPurchases.reduce((sum, purchase) => 
      sum + parseFloat(purchase.total), 0
    );
    const totalRetentions = filteredPurchases.reduce((sum, purchase) => 
      sum + parseFloat(purchase.retentionFuente || "0") + parseFloat(purchase.retentionIva || "0"), 0
    );
    
    res.json({
      period: { startDate, endDate },
      totalPurchases: filteredPurchases.length,
      totalAmount: totalPurchases.toFixed(2),
      totalRetentions: totalRetentions.toFixed(2),
      purchases: filteredPurchases
    });
  });

  app.get("/api/reports/balance", requireAuth, async (req, res) => {
    const companyId = parseInt(req.query.companyId as string);
    if (!companyId) {
      return res.status(400).json({ message: "Company ID es requerido" });
    }
    
    const accounts = await storage.getChartOfAccountsByCompany(companyId);
    const journalEntries = await storage.getJournalEntriesByCompany(companyId);
    
    // Calcular balance por tipo de cuenta
    const balanceSheet = {
      activos: accounts.filter(acc => acc.type === "activo"),
      pasivos: accounts.filter(acc => acc.type === "pasivo"),
      patrimonio: accounts.filter(acc => acc.type === "patrimonio"),
      ingresos: accounts.filter(acc => acc.type === "ingreso"),
      gastos: accounts.filter(acc => acc.type === "gasto")
    };
    
    res.json({
      date: new Date().toISOString(),
      balanceSheet,
      totalEntries: journalEntries.length
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
