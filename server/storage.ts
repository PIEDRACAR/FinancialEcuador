import { users, companies, clients, invoices, type User, type InsertUser, type Company, type InsertCompany, type Client, type InsertClient, type Invoice, type InsertInvoice } from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Companies
  getCompany(id: number): Promise<Company | undefined>;
  getCompaniesByOwner(ownerId: number): Promise<Company[]>;
  createCompany(company: InsertCompany & { ownerId: number }): Promise<Company>;
  updateCompany(id: number, updates: Partial<InsertCompany>): Promise<Company | undefined>;
  deleteCompany(id: number): Promise<boolean>;
  
  // Clients
  getClient(id: number): Promise<Client | undefined>;
  getClientsByCompany(companyId: number): Promise<Client[]>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: number, updates: Partial<InsertClient>): Promise<Client | undefined>;
  deleteClient(id: number): Promise<boolean>;
  
  // Invoices
  getInvoice(id: number): Promise<Invoice | undefined>;
  getInvoicesByCompany(companyId: number): Promise<Invoice[]>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  updateInvoice(id: number, updates: Partial<InsertInvoice>): Promise<Invoice | undefined>;
  deleteInvoice(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private companies: Map<number, Company>;
  private clients: Map<number, Client>;
  private invoices: Map<number, Invoice>;
  private currentUserId: number;
  private currentCompanyId: number;
  private currentClientId: number;
  private currentInvoiceId: number;

  constructor() {
    this.users = new Map();
    this.companies = new Map();
    this.clients = new Map();
    this.invoices = new Map();
    this.currentUserId = 1;
    this.currentCompanyId = 1;
    this.currentClientId = 1;
    this.currentInvoiceId = 1;
    
    // Add sample data for testing
    this.initSampleData();
  }

  private initSampleData() {
    // This will be populated when a company is created
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      ...insertUser,
      id,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  // Companies
  async getCompany(id: number): Promise<Company | undefined> {
    return this.companies.get(id);
  }

  async getCompaniesByOwner(ownerId: number): Promise<Company[]> {
    return Array.from(this.companies.values()).filter(company => company.ownerId === ownerId);
  }

  async createCompany(company: InsertCompany & { ownerId: number }): Promise<Company> {
    const id = this.currentCompanyId++;
    const newCompany: Company = {
      id,
      name: company.name,
      ruc: company.ruc || null,
      address: company.address || null,
      ownerId: company.ownerId,
      createdAt: new Date(),
    };
    this.companies.set(id, newCompany);
    return newCompany;
  }

  async updateCompany(id: number, updates: Partial<InsertCompany>): Promise<Company | undefined> {
    const company = this.companies.get(id);
    if (!company) return undefined;
    
    const updatedCompany = { ...company, ...updates };
    this.companies.set(id, updatedCompany);
    return updatedCompany;
  }

  async deleteCompany(id: number): Promise<boolean> {
    return this.companies.delete(id);
  }

  // Clients
  async getClient(id: number): Promise<Client | undefined> {
    return this.clients.get(id);
  }

  async getClientsByCompany(companyId: number): Promise<Client[]> {
    return Array.from(this.clients.values()).filter(client => client.companyId === companyId);
  }

  async createClient(client: InsertClient): Promise<Client> {
    const id = this.currentClientId++;
    const newClient: Client = {
      id,
      name: client.name,
      ruc: client.ruc,
      email: client.email || null,
      phone: client.phone || null,
      address: client.address || null,
      companyId: client.companyId,
      isActive: client.isActive ?? true,
      createdAt: new Date(),
    };
    this.clients.set(id, newClient);
    return newClient;
  }

  async updateClient(id: number, updates: Partial<InsertClient>): Promise<Client | undefined> {
    const client = this.clients.get(id);
    if (!client) return undefined;
    
    const updatedClient = { ...client, ...updates };
    this.clients.set(id, updatedClient);
    return updatedClient;
  }

  async deleteClient(id: number): Promise<boolean> {
    return this.clients.delete(id);
  }

  // Invoices
  async getInvoice(id: number): Promise<Invoice | undefined> {
    return this.invoices.get(id);
  }

  async getInvoicesByCompany(companyId: number): Promise<Invoice[]> {
    return Array.from(this.invoices.values()).filter(invoice => invoice.companyId === companyId);
  }

  async createInvoice(invoice: InsertInvoice): Promise<Invoice> {
    const id = this.currentInvoiceId++;
    const newInvoice: Invoice = {
      ...invoice,
      id,
      createdAt: new Date(),
    };
    this.invoices.set(id, newInvoice);
    return newInvoice;
  }

  async updateInvoice(id: number, updates: Partial<InsertInvoice>): Promise<Invoice | undefined> {
    const invoice = this.invoices.get(id);
    if (!invoice) return undefined;
    
    const updatedInvoice = { ...invoice, ...updates };
    this.invoices.set(id, updatedInvoice);
    return updatedInvoice;
  }

  async deleteInvoice(id: number): Promise<boolean> {
    return this.invoices.delete(id);
  }
}

export const storage = new MemStorage();
