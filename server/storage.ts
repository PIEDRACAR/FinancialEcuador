import { 
  users, companies, clients, suppliers, products, invoices, purchases, retentions, chartOfAccounts, journalEntries, journalEntryDetails, employees, payrolls, systemSettings,
  type User, type InsertUser, type Company, type InsertCompany, type Client, type InsertClient, type Supplier, type InsertSupplier,
  type Product, type InsertProduct, type Invoice, type InsertInvoice, type Purchase, type InsertPurchase,
  type Retention, type InsertRetention, type ChartOfAccount, type InsertChartOfAccount, 
  type JournalEntry, type InsertJournalEntry, type JournalEntryDetail, type InsertJournalEntryDetail,
  type Employee, type InsertEmployee, type Payroll, type InsertPayroll, type SystemSetting, type InsertSystemSetting,
  ECUADOR_TAX_RATES
} from "@shared/schema";

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
  
  // Suppliers
  getSupplier(id: number): Promise<Supplier | undefined>;
  getSuppliersByCompany(companyId: number): Promise<Supplier[]>;
  createSupplier(supplier: InsertSupplier): Promise<Supplier>;
  updateSupplier(id: number, updates: Partial<InsertSupplier>): Promise<Supplier | undefined>;
  deleteSupplier(id: number): Promise<boolean>;
  
  // Products
  getProduct(id: number): Promise<Product | undefined>;
  getProductsByCompany(companyId: number): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, updates: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  
  // Invoices
  getInvoice(id: number): Promise<Invoice | undefined>;
  getInvoicesByCompany(companyId: number): Promise<Invoice[]>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  updateInvoice(id: number, updates: Partial<InsertInvoice>): Promise<Invoice | undefined>;
  deleteInvoice(id: number): Promise<boolean>;
  
  // Purchases
  getPurchase(id: number): Promise<Purchase | undefined>;
  getPurchasesByCompany(companyId: number): Promise<Purchase[]>;
  createPurchase(purchase: InsertPurchase): Promise<Purchase>;
  updatePurchase(id: number, updates: Partial<InsertPurchase>): Promise<Purchase | undefined>;
  deletePurchase(id: number): Promise<boolean>;
  
  // Retentions
  getRetention(id: number): Promise<Retention | undefined>;
  getRetentionsByCompany(companyId: number): Promise<Retention[]>;
  createRetention(retention: InsertRetention): Promise<Retention>;
  updateRetention(id: number, updates: Partial<InsertRetention>): Promise<Retention | undefined>;
  deleteRetention(id: number): Promise<boolean>;
  
  // Chart of Accounts
  getChartOfAccount(id: number): Promise<ChartOfAccount | undefined>;
  getChartOfAccountsByCompany(companyId: number): Promise<ChartOfAccount[]>;
  createChartOfAccount(account: InsertChartOfAccount): Promise<ChartOfAccount>;
  updateChartOfAccount(id: number, updates: Partial<InsertChartOfAccount>): Promise<ChartOfAccount | undefined>;
  deleteChartOfAccount(id: number): Promise<boolean>;
  
  // Journal Entries
  getJournalEntry(id: number): Promise<JournalEntry | undefined>;
  getJournalEntriesByCompany(companyId: number): Promise<JournalEntry[]>;
  createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry>;
  updateJournalEntry(id: number, updates: Partial<InsertJournalEntry>): Promise<JournalEntry | undefined>;
  deleteJournalEntry(id: number): Promise<boolean>;
  
  // Journal Entry Details
  getJournalEntryDetails(journalEntryId: number): Promise<JournalEntryDetail[]>;
  createJournalEntryDetail(detail: InsertJournalEntryDetail): Promise<JournalEntryDetail>;
  updateJournalEntryDetail(id: number, updates: Partial<InsertJournalEntryDetail>): Promise<JournalEntryDetail | undefined>;
  deleteJournalEntryDetail(id: number): Promise<boolean>;
  
  // Employees
  getEmployee(id: number): Promise<Employee | undefined>;
  getEmployeesByCompany(companyId: number): Promise<Employee[]>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  updateEmployee(id: number, updates: Partial<InsertEmployee>): Promise<Employee | undefined>;
  deleteEmployee(id: number): Promise<boolean>;
  
  // Payrolls
  getPayroll(id: number): Promise<Payroll | undefined>;
  getPayrollsByCompany(companyId: number): Promise<Payroll[]>;
  getPayrollsByEmployee(employeeId: number): Promise<Payroll[]>;
  createPayroll(payroll: InsertPayroll): Promise<Payroll>;
  updatePayroll(id: number, updates: Partial<InsertPayroll>): Promise<Payroll | undefined>;
  deletePayroll(id: number): Promise<boolean>;
  
  // System Settings
  getSystemSetting(companyId: number, key: string): Promise<SystemSetting | undefined>;
  getSystemSettingsByCompany(companyId: number): Promise<SystemSetting[]>;
  setSystemSetting(setting: InsertSystemSetting): Promise<SystemSetting>;
  updateSystemSetting(id: number, updates: Partial<InsertSystemSetting>): Promise<SystemSetting | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private companies: Map<number, Company>;
  private clients: Map<number, Client>;
  private suppliers: Map<number, Supplier>;
  private products: Map<number, Product>;
  private invoices: Map<number, Invoice>;
  private purchases: Map<number, Purchase>;
  private retentions: Map<number, Retention>;
  private chartOfAccounts: Map<number, ChartOfAccount>;
  private journalEntries: Map<number, JournalEntry>;
  private journalEntryDetails: Map<number, JournalEntryDetail>;
  private employees: Map<number, Employee>;
  private payrolls: Map<number, Payroll>;
  private systemSettings: Map<number, SystemSetting>;
  
  private currentUserId: number;
  private currentCompanyId: number;
  private currentClientId: number;
  private currentSupplierId: number;
  private currentProductId: number;
  private currentInvoiceId: number;
  private currentPurchaseId: number;
  private currentRetentionId: number;
  private currentChartOfAccountId: number;
  private currentJournalEntryId: number;
  private currentJournalEntryDetailId: number;
  private currentEmployeeId: number;
  private currentPayrollId: number;
  private currentSystemSettingId: number;

  constructor() {
    this.users = new Map();
    this.companies = new Map();
    this.clients = new Map();
    this.suppliers = new Map();
    this.products = new Map();
    this.invoices = new Map();
    this.purchases = new Map();
    this.retentions = new Map();
    this.chartOfAccounts = new Map();
    this.journalEntries = new Map();
    this.journalEntryDetails = new Map();
    this.employees = new Map();
    this.payrolls = new Map();
    this.systemSettings = new Map();
    
    this.currentUserId = 1;
    this.currentCompanyId = 1;
    this.currentClientId = 1;
    this.currentSupplierId = 1;
    this.currentProductId = 1;
    this.currentInvoiceId = 1;
    this.currentPurchaseId = 1;
    this.currentRetentionId = 1;
    this.currentChartOfAccountId = 1;
    this.currentJournalEntryId = 1;
    this.currentJournalEntryDetailId = 1;
    this.currentEmployeeId = 1;
    this.currentPayrollId = 1;
    this.currentSystemSettingId = 1;
    
    this.initSampleData();
  }

  private initSampleData() {
    // Datos de ejemplo para Ecuador con nuevas normativas
    this.createUser({
      name: "Carlos Herrera",
      email: "carlos@empresa.com",
      password: "password123"
    });

    // Plan de cuentas estándar Ecuador
    const defaultChartOfAccounts = [
      // ACTIVOS
      { code: "1", name: "ACTIVOS", type: "activo", level: 1 },
      { code: "1.01", name: "ACTIVOS CORRIENTES", type: "activo", level: 2 },
      { code: "1.01.01", name: "EFECTIVO Y EQUIVALENTES", type: "activo", level: 3 },
      { code: "1.01.01.001", name: "Caja General", type: "activo", level: 4 },
      { code: "1.01.01.002", name: "Banco Pichincha", type: "activo", level: 4 },
      { code: "1.01.02", name: "CUENTAS POR COBRAR", type: "activo", level: 3 },
      { code: "1.01.02.001", name: "Clientes", type: "activo", level: 4 },
      { code: "1.01.03", name: "INVENTARIOS", type: "activo", level: 3 },
      { code: "1.01.03.001", name: "Mercaderías", type: "activo", level: 4 },
      { code: "1.01.04", name: "IMPUESTOS POR COBRAR", type: "activo", level: 3 },
      { code: "1.01.04.001", name: "IVA Pagado", type: "activo", level: 4 },
      { code: "1.01.04.002", name: "Retención Fuente por Cobrar", type: "activo", level: 4 },
      
      // PASIVOS
      { code: "2", name: "PASIVOS", type: "pasivo", level: 1 },
      { code: "2.01", name: "PASIVOS CORRIENTES", type: "pasivo", level: 2 },
      { code: "2.01.01", name: "CUENTAS POR PAGAR", type: "pasivo", level: 3 },
      { code: "2.01.01.001", name: "Proveedores", type: "pasivo", level: 4 },
      { code: "2.01.02", name: "IMPUESTOS POR PAGAR", type: "pasivo", level: 3 },
      { code: "2.01.02.001", name: "IVA por Pagar", type: "pasivo", level: 4 },
      { code: "2.01.02.002", name: "Retención Fuente por Pagar", type: "pasivo", level: 4 },
      { code: "2.01.02.003", name: "Retención IVA por Pagar", type: "pasivo", level: 4 },
      { code: "2.01.02.004", name: "IESS por Pagar", type: "pasivo", level: 4 },
      
      // PATRIMONIO
      { code: "3", name: "PATRIMONIO", type: "patrimonio", level: 1 },
      { code: "3.01", name: "CAPITAL SOCIAL", type: "patrimonio", level: 2 },
      { code: "3.01.01", name: "Capital Suscrito y Pagado", type: "patrimonio", level: 3 },
      { code: "3.02", name: "UTILIDADES RETENIDAS", type: "patrimonio", level: 2 },
      
      // INGRESOS
      { code: "4", name: "INGRESOS", type: "ingreso", level: 1 },
      { code: "4.01", name: "INGRESOS OPERACIONALES", type: "ingreso", level: 2 },
      { code: "4.01.01", name: "Ventas", type: "ingreso", level: 3 },
      { code: "4.01.01.001", name: "Ventas Gravadas 15%", type: "ingreso", level: 4 },
      { code: "4.01.01.002", name: "Ventas Gravadas 5%", type: "ingreso", level: 4 },
      { code: "4.01.01.003", name: "Ventas 0%", type: "ingreso", level: 4 },
      
      // GASTOS
      { code: "5", name: "GASTOS", type: "gasto", level: 1 },
      { code: "5.01", name: "GASTOS OPERACIONALES", type: "gasto", level: 2 },
      { code: "5.01.01", name: "Compras", type: "gasto", level: 3 },
      { code: "5.01.02", name: "Gastos de Personal", type: "gasto", level: 3 },
      { code: "5.01.02.001", name: "Sueldos y Salarios", type: "gasto", level: 4 },
      { code: "5.01.02.002", name: "Aporte Patronal IESS", type: "gasto", level: 4 },
      { code: "5.01.03", name: "Gastos Generales", type: "gasto", level: 3 },
      { code: "5.01.03.001", name: "Servicios Básicos", type: "gasto", level: 4 },
      { code: "5.01.03.002", name: "Arriendos", type: "gasto", level: 4 }
    ];

    // Inicializar con empresa ejemplo
    this.createCompany({
      name: "HERRERA PIEDRA CARLOS RUBEN",
      ruc: "0704567890001",
      address: "Av. Principal 123, Guayaquil",
      email: "info@empresa.com",
      phone: "042-234567",
      ownerId: 1
    }).then(company => {
      // Crear plan de cuentas
      defaultChartOfAccounts.forEach(account => {
        this.createChartOfAccount({
          ...account,
          companyId: company.id
        });
      });

      // Crear productos de ejemplo
      this.createProduct({
        code: "PROD001",
        name: "Producto de Ejemplo",
        description: "Producto para pruebas",
        category: "General",
        unit: "unidad",
        purchasePrice: "10.00",
        salePrice: "15.00",
        ivaRate: "15.00",
        stock: 100,
        minStock: 10,
        companyId: company.id
      });

      // Crear proveedor de ejemplo
      this.createSupplier({
        name: "Proveedor Ejemplo S.A.",
        ruc: "0912345678001",
        email: "proveedor@ejemplo.com",
        phone: "042-123456",
        address: "Av. Comercial 456, Guayaquil",
        contactPerson: "Juan Pérez",
        category: "bienes",
        paymentTerms: "30 días",
        companyId: company.id
      });

      // Crear cliente de ejemplo
      this.createClient({
        name: "Cliente Ejemplo",
        ruc: "0987654321001",
        email: "cliente@ejemplo.com", 
        phone: "042-987654",
        address: "Calle Principal 789, Guayaquil",
        companyId: company.id
      });

      // Crear empleado de ejemplo
      this.createEmployee({
        firstName: "María",
        lastName: "González",
        cedula: "0923456789",
        email: "maria.gonzalez@empresa.com",
        phone: "099-123456",
        position: "Contadora",
        department: "Contabilidad",
        salary: "800.00",
        startDate: new Date("2024-01-01"),
        companyId: company.id
      });
    });
  }

  // USERS
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      id,
      name: insertUser.name,
      email: insertUser.email,
      password: insertUser.password,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  // COMPANIES
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
      email: company.email || null,
      phone: company.phone || null,
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

  // CLIENTS
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
      isActive: client.isActive !== undefined ? client.isActive : true,
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

  // SUPPLIERS
  async getSupplier(id: number): Promise<Supplier | undefined> {
    return this.suppliers.get(id);
  }

  async getSuppliersByCompany(companyId: number): Promise<Supplier[]> {
    return Array.from(this.suppliers.values()).filter(supplier => supplier.companyId === companyId);
  }

  async createSupplier(supplier: InsertSupplier): Promise<Supplier> {
    const id = this.currentSupplierId++;
    const newSupplier: Supplier = {
      id,
      name: supplier.name,
      ruc: supplier.ruc,
      email: supplier.email || null,
      phone: supplier.phone || null,
      address: supplier.address || null,
      contactPerson: supplier.contactPerson || null,
      category: supplier.category || null,
      paymentTerms: supplier.paymentTerms || "contado",
      isActive: supplier.isActive !== undefined ? supplier.isActive : true,
      companyId: supplier.companyId,
      createdAt: new Date(),
    };
    this.suppliers.set(id, newSupplier);
    return newSupplier;
  }

  async updateSupplier(id: number, updates: Partial<InsertSupplier>): Promise<Supplier | undefined> {
    const supplier = this.suppliers.get(id);
    if (!supplier) return undefined;
    
    const updatedSupplier = { ...supplier, ...updates };
    this.suppliers.set(id, updatedSupplier);
    return updatedSupplier;
  }

  async deleteSupplier(id: number): Promise<boolean> {
    return this.suppliers.delete(id);
  }

  // PRODUCTS
  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProductsByCompany(companyId: number): Promise<Product[]> {
    return Array.from(this.products.values()).filter(product => product.companyId === companyId);
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.currentProductId++;
    const newProduct: Product = {
      id,
      code: product.code,
      name: product.name,
      description: product.description || null,
      category: product.category || null,
      unit: product.unit || "unidad",
      purchasePrice: product.purchasePrice || "0.00",
      salePrice: product.salePrice || "0.00",
      ivaRate: product.ivaRate || "15.00",
      stock: product.stock || 0,
      minStock: product.minStock || 0,
      isActive: product.isActive !== undefined ? product.isActive : true,
      companyId: product.companyId,
      createdAt: new Date(),
    };
    this.products.set(id, newProduct);
    return newProduct;
  }

  async updateProduct(id: number, updates: Partial<InsertProduct>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;
    
    const updatedProduct = { ...product, ...updates };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
  }

  // INVOICES
  async getInvoice(id: number): Promise<Invoice | undefined> {
    return this.invoices.get(id);
  }

  async getInvoicesByCompany(companyId: number): Promise<Invoice[]> {
    return Array.from(this.invoices.values()).filter(invoice => invoice.companyId === companyId);
  }

  async createInvoice(invoice: InsertInvoice): Promise<Invoice> {
    const id = this.currentInvoiceId++;
    const newInvoice: Invoice = {
      id,
      number: invoice.number,
      date: invoice.date,
      subtotal: invoice.subtotal || "0.00",
      iva: invoice.iva || "0.00",
      ivaRate: invoice.ivaRate || "15.00",
      ice: invoice.ice || "0.00",
      total: invoice.total,
      status: invoice.status,
      type: invoice.type || "factura",
      paymentMethod: invoice.paymentMethod || "efectivo",
      authorizationCode: invoice.authorizationCode || null,
      accessKey: invoice.accessKey || null,
      xmlSigned: invoice.xmlSigned || null,
      items: invoice.items || "[]",
      notes: invoice.notes || "",
      clientId: invoice.clientId,
      companyId: invoice.companyId,
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

  // PURCHASES
  async getPurchase(id: number): Promise<Purchase | undefined> {
    return this.purchases.get(id);
  }

  async getPurchasesByCompany(companyId: number): Promise<Purchase[]> {
    return Array.from(this.purchases.values()).filter(purchase => purchase.companyId === companyId);
  }

  async createPurchase(purchase: InsertPurchase): Promise<Purchase> {
    const id = this.currentPurchaseId++;
    const newPurchase: Purchase = {
      id,
      number: purchase.number,
      date: purchase.date,
      subtotal: purchase.subtotal || "0.00",
      iva: purchase.iva || "0.00",
      ivaRate: purchase.ivaRate || "15.00",
      ice: purchase.ice || "0.00",
      retentionFuente: purchase.retentionFuente || "0.00",
      retentionIva: purchase.retentionIva || "0.00",
      total: purchase.total,
      status: purchase.status || "pendiente",
      type: purchase.type || "compra",
      paymentMethod: purchase.paymentMethod || "efectivo",
      authorizationCode: purchase.authorizationCode || null,
      accessKey: purchase.accessKey || null,
      xmlSigned: purchase.xmlSigned || null,
      items: purchase.items || "[]",
      notes: purchase.notes || "",
      supplierId: purchase.supplierId,
      companyId: purchase.companyId,
      createdAt: new Date(),
    };
    this.purchases.set(id, newPurchase);
    return newPurchase;
  }

  async updatePurchase(id: number, updates: Partial<InsertPurchase>): Promise<Purchase | undefined> {
    const purchase = this.purchases.get(id);
    if (!purchase) return undefined;
    
    const updatedPurchase = { ...purchase, ...updates };
    this.purchases.set(id, updatedPurchase);
    return updatedPurchase;
  }

  async deletePurchase(id: number): Promise<boolean> {
    return this.purchases.delete(id);
  }

  // RETENTIONS
  async getRetention(id: number): Promise<Retention | undefined> {
    return this.retentions.get(id);
  }

  async getRetentionsByCompany(companyId: number): Promise<Retention[]> {
    return Array.from(this.retentions.values()).filter(retention => retention.companyId === companyId);
  }

  async createRetention(retention: InsertRetention): Promise<Retention> {
    const id = this.currentRetentionId++;
    const newRetention: Retention = {
      id,
      number: retention.number,
      date: retention.date,
      type: retention.type,
      concept: retention.concept,
      percentage: retention.percentage,
      baseAmount: retention.baseAmount,
      retentionAmount: retention.retentionAmount,
      authorizationCode: retention.authorizationCode || null,
      accessKey: retention.accessKey || null,
      xmlSigned: retention.xmlSigned || null,
      invoiceId: retention.invoiceId || null,
      purchaseId: retention.purchaseId || null,
      clientId: retention.clientId || null,
      supplierId: retention.supplierId || null,
      companyId: retention.companyId,
      createdAt: new Date(),
    };
    this.retentions.set(id, newRetention);
    return newRetention;
  }

  async updateRetention(id: number, updates: Partial<InsertRetention>): Promise<Retention | undefined> {
    const retention = this.retentions.get(id);
    if (!retention) return undefined;
    
    const updatedRetention = { ...retention, ...updates };
    this.retentions.set(id, updatedRetention);
    return updatedRetention;
  }

  async deleteRetention(id: number): Promise<boolean> {
    return this.retentions.delete(id);
  }

  // CHART OF ACCOUNTS
  async getChartOfAccount(id: number): Promise<ChartOfAccount | undefined> {
    return this.chartOfAccounts.get(id);
  }

  async getChartOfAccountsByCompany(companyId: number): Promise<ChartOfAccount[]> {
    return Array.from(this.chartOfAccounts.values()).filter(account => account.companyId === companyId);
  }

  async createChartOfAccount(account: InsertChartOfAccount): Promise<ChartOfAccount> {
    const id = this.currentChartOfAccountId++;
    const newAccount: ChartOfAccount = {
      id,
      code: account.code,
      name: account.name,
      type: account.type,
      parentId: account.parentId || null,
      level: account.level || 1,
      isActive: account.isActive !== undefined ? account.isActive : true,
      companyId: account.companyId,
      createdAt: new Date(),
    };
    this.chartOfAccounts.set(id, newAccount);
    return newAccount;
  }

  async updateChartOfAccount(id: number, updates: Partial<InsertChartOfAccount>): Promise<ChartOfAccount | undefined> {
    const account = this.chartOfAccounts.get(id);
    if (!account) return undefined;
    
    const updatedAccount = { ...account, ...updates };
    this.chartOfAccounts.set(id, updatedAccount);
    return updatedAccount;
  }

  async deleteChartOfAccount(id: number): Promise<boolean> {
    return this.chartOfAccounts.delete(id);
  }

  // JOURNAL ENTRIES
  async getJournalEntry(id: number): Promise<JournalEntry | undefined> {
    return this.journalEntries.get(id);
  }

  async getJournalEntriesByCompany(companyId: number): Promise<JournalEntry[]> {
    return Array.from(this.journalEntries.values()).filter(entry => entry.companyId === companyId);
  }

  async createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry> {
    const id = this.currentJournalEntryId++;
    const newEntry: JournalEntry = {
      id,
      number: entry.number,
      date: entry.date,
      description: entry.description,
      reference: entry.reference || null,
      type: entry.type || "manual",
      companyId: entry.companyId,
      createdAt: new Date(),
    };
    this.journalEntries.set(id, newEntry);
    return newEntry;
  }

  async updateJournalEntry(id: number, updates: Partial<InsertJournalEntry>): Promise<JournalEntry | undefined> {
    const entry = this.journalEntries.get(id);
    if (!entry) return undefined;
    
    const updatedEntry = { ...entry, ...updates };
    this.journalEntries.set(id, updatedEntry);
    return updatedEntry;
  }

  async deleteJournalEntry(id: number): Promise<boolean> {
    return this.journalEntries.delete(id);
  }

  // JOURNAL ENTRY DETAILS
  async getJournalEntryDetails(journalEntryId: number): Promise<JournalEntryDetail[]> {
    return Array.from(this.journalEntryDetails.values()).filter(detail => detail.journalEntryId === journalEntryId);
  }

  async createJournalEntryDetail(detail: InsertJournalEntryDetail): Promise<JournalEntryDetail> {
    const id = this.currentJournalEntryDetailId++;
    const newDetail: JournalEntryDetail = {
      id,
      journalEntryId: detail.journalEntryId,
      accountId: detail.accountId,
      debit: detail.debit || "0.00",
      credit: detail.credit || "0.00",
      description: detail.description || null,
    };
    this.journalEntryDetails.set(id, newDetail);
    return newDetail;
  }

  async updateJournalEntryDetail(id: number, updates: Partial<InsertJournalEntryDetail>): Promise<JournalEntryDetail | undefined> {
    const detail = this.journalEntryDetails.get(id);
    if (!detail) return undefined;
    
    const updatedDetail = { ...detail, ...updates };
    this.journalEntryDetails.set(id, updatedDetail);
    return updatedDetail;
  }

  async deleteJournalEntryDetail(id: number): Promise<boolean> {
    return this.journalEntryDetails.delete(id);
  }

  // EMPLOYEES
  async getEmployee(id: number): Promise<Employee | undefined> {
    return this.employees.get(id);
  }

  async getEmployeesByCompany(companyId: number): Promise<Employee[]> {
    return Array.from(this.employees.values()).filter(employee => employee.companyId === companyId);
  }

  async createEmployee(employee: InsertEmployee): Promise<Employee> {
    const id = this.currentEmployeeId++;
    const newEmployee: Employee = {
      id,
      firstName: employee.firstName,
      lastName: employee.lastName,
      cedula: employee.cedula,
      email: employee.email || null,
      phone: employee.phone || null,
      position: employee.position,
      department: employee.department || null,
      salary: employee.salary,
      startDate: employee.startDate,
      endDate: employee.endDate || null,
      isActive: employee.isActive !== undefined ? employee.isActive : true,
      companyId: employee.companyId,
      createdAt: new Date(),
    };
    this.employees.set(id, newEmployee);
    return newEmployee;
  }

  async updateEmployee(id: number, updates: Partial<InsertEmployee>): Promise<Employee | undefined> {
    const employee = this.employees.get(id);
    if (!employee) return undefined;
    
    const updatedEmployee = { ...employee, ...updates };
    this.employees.set(id, updatedEmployee);
    return updatedEmployee;
  }

  async deleteEmployee(id: number): Promise<boolean> {
    return this.employees.delete(id);
  }

  // PAYROLLS
  async getPayroll(id: number): Promise<Payroll | undefined> {
    return this.payrolls.get(id);
  }

  async getPayrollsByCompany(companyId: number): Promise<Payroll[]> {
    return Array.from(this.payrolls.values()).filter(payroll => payroll.companyId === companyId);
  }

  async getPayrollsByEmployee(employeeId: number): Promise<Payroll[]> {
    return Array.from(this.payrolls.values()).filter(payroll => payroll.employeeId === employeeId);
  }

  async createPayroll(payroll: InsertPayroll): Promise<Payroll> {
    const id = this.currentPayrollId++;
    const newPayroll: Payroll = {
      id,
      employeeId: payroll.employeeId,
      period: payroll.period,
      baseSalary: payroll.baseSalary,
      overtime: payroll.overtime || "0.00",
      bonuses: payroll.bonuses || "0.00",
      grossSalary: payroll.grossSalary,
      iessEmployee: payroll.iessEmployee,
      incomeTax: payroll.incomeTax || "0.00",
      netSalary: payroll.netSalary,
      iessEmployer: payroll.iessEmployer,
      status: payroll.status || "pendiente",
      companyId: payroll.companyId,
      createdAt: new Date(),
    };
    this.payrolls.set(id, newPayroll);
    return newPayroll;
  }

  async updatePayroll(id: number, updates: Partial<InsertPayroll>): Promise<Payroll | undefined> {
    const payroll = this.payrolls.get(id);
    if (!payroll) return undefined;
    
    const updatedPayroll = { ...payroll, ...updates };
    this.payrolls.set(id, updatedPayroll);
    return updatedPayroll;
  }

  async deletePayroll(id: number): Promise<boolean> {
    return this.payrolls.delete(id);
  }

  // SYSTEM SETTINGS
  async getSystemSetting(companyId: number, key: string): Promise<SystemSetting | undefined> {
    return Array.from(this.systemSettings.values()).find(
      setting => setting.companyId === companyId && setting.key === key
    );
  }

  async getSystemSettingsByCompany(companyId: number): Promise<SystemSetting[]> {
    return Array.from(this.systemSettings.values()).filter(setting => setting.companyId === companyId);
  }

  async setSystemSetting(setting: InsertSystemSetting): Promise<SystemSetting> {
    const existingSetting = await this.getSystemSetting(setting.companyId, setting.key);
    
    if (existingSetting) {
      return this.updateSystemSetting(existingSetting.id, setting) as Promise<SystemSetting>;
    }
    
    const id = this.currentSystemSettingId++;
    const newSetting: SystemSetting = {
      id,
      key: setting.key,
      value: setting.value,
      type: setting.type || "string",
      companyId: setting.companyId,
      updatedAt: new Date(),
    };
    this.systemSettings.set(id, newSetting);
    return newSetting;
  }

  async updateSystemSetting(id: number, updates: Partial<InsertSystemSetting>): Promise<SystemSetting | undefined> {
    const setting = this.systemSettings.get(id);
    if (!setting) return undefined;
    
    const updatedSetting = { ...setting, ...updates, updatedAt: new Date() };
    this.systemSettings.set(id, updatedSetting);
    return updatedSetting;
  }
}

export const storage = new MemStorage();