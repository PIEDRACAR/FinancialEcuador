import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { loginSchema, registerSchema, insertCompanySchema, insertClientSchema, insertInvoiceSchema } from "@shared/schema";
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

  const httpServer = createServer(app);
  return httpServer;
}
