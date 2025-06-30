import { 
  users, companies, clients, invoices, retentions, chartOfAccounts, journalEntries, journalEntryDetails, employees, payrolls, systemSettings,
  type User, type InsertUser, type Company, type InsertCompany, type Client, type InsertClient, type Invoice, type InsertInvoice,
  type Retention, type InsertRetention, type ChartOfAccount, type InsertChartOfAccount, 
  type JournalEntry, type InsertJournalEntry, type JournalEntryDetail, type InsertJournalEntryDetail,
  type Employee, type InsertEmployee, type Payroll, type InsertPayroll, type SystemSetting, type InsertSystemSetting
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
  
  // Invoices
  getInvoice(id: number): Promise<Invoice | undefined>;
  getInvoicesByCompany(companyId: number): Promise<Invoice[]>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  updateInvoice(id: number, updates: Partial<InsertInvoice>): Promise<Invoice | undefined>;
  deleteInvoice(id: number): Promise<boolean>;
  
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
  private invoices: Map<number, Invoice>;
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
  private currentInvoiceId: number;
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
    this.invoices = new Map();
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
    this.currentInvoiceId = 1;
    this.currentRetentionId = 1;
    this.currentChartOfAccountId = 1;
    this.currentJournalEntryId = 1;
    this.currentJournalEntryDetailId = 1;
    this.currentEmployeeId = 1;
    this.currentPayrollId = 1;
    this.currentSystemSettingId = 1;
    
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
      subtotal: invoice.subtotal || "0",
      iva: invoice.iva || "0",
      ivaRate: invoice.ivaRate || "15.00",
      type: invoice.type || "factura",
      items: invoice.items || "[]",
      notes: invoice.notes || "",
      dueDate: invoice.dueDate || null,
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

  // Retentions
  async getRetention(id: number): Promise<Retention | undefined> {
    return this.retentions.get(id);
  }

  async getRetentionsByCompany(companyId: number): Promise<Retention[]> {
    return Array.from(this.retentions.values()).filter(retention => retention.companyId === companyId);
  }

  async createRetention(retention: InsertRetention): Promise<Retention> {
    const id = this.currentRetentionId++;
    const newRetention: Retention = {
      ...retention,
      id,
      createdAt: new Date(),
      invoiceId: retention.invoiceId || null,
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

  // Chart of Accounts
  async getChartOfAccount(id: number): Promise<ChartOfAccount | undefined> {
    return this.chartOfAccounts.get(id);
  }

  async getChartOfAccountsByCompany(companyId: number): Promise<ChartOfAccount[]> {
    return Array.from(this.chartOfAccounts.values()).filter(account => account.companyId === companyId);
  }

  async createChartOfAccount(account: InsertChartOfAccount): Promise<ChartOfAccount> {
    const id = this.currentChartOfAccountId++;
    const newAccount: ChartOfAccount = {
      ...account,
      id,
      createdAt: new Date(),
      isActive: account.isActive ?? true,
      parentId: account.parentId ?? null,
      level: account.level ?? 1,
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

  // Journal Entries
  async getJournalEntry(id: number): Promise<JournalEntry | undefined> {
    return this.journalEntries.get(id);
  }

  async getJournalEntriesByCompany(companyId: number): Promise<JournalEntry[]> {
    return Array.from(this.journalEntries.values()).filter(entry => entry.companyId === companyId);
  }

  async createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry> {
    const id = this.currentJournalEntryId++;
    const newEntry: JournalEntry = {
      ...entry,
      id,
      createdAt: new Date(),
      type: entry.type || "general",
      reference: entry.reference || null,
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

  // Journal Entry Details
  async getJournalEntryDetails(journalEntryId: number): Promise<JournalEntryDetail[]> {
    return Array.from(this.journalEntryDetails.values()).filter(detail => detail.journalEntryId === journalEntryId);
  }

  async createJournalEntryDetail(detail: InsertJournalEntryDetail): Promise<JournalEntryDetail> {
    const id = this.currentJournalEntryDetailId++;
    const newDetail: JournalEntryDetail = {
      ...detail,
      id,
      description: detail.description || null,
      debit: detail.debit || null,
      credit: detail.credit || null,
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

  // Employees
  async getEmployee(id: number): Promise<Employee | undefined> {
    return this.employees.get(id);
  }

  async getEmployeesByCompany(companyId: number): Promise<Employee[]> {
    return Array.from(this.employees.values()).filter(employee => employee.companyId === companyId);
  }

  async createEmployee(employee: InsertEmployee): Promise<Employee> {
    const id = this.currentEmployeeId++;
    const newEmployee: Employee = {
      ...employee,
      id,
      createdAt: new Date(),
      email: employee.email || null,
      phone: employee.phone || null,
      department: employee.department || null,
      isActive: employee.isActive ?? true,
      endDate: employee.endDate || null,
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

  // Payrolls
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
      ...payroll,
      id,
      createdAt: new Date(),
      status: payroll.status || "pendiente",
      overtime: payroll.overtime || null,
      bonuses: payroll.bonuses || null,
      incomeTax: payroll.incomeTax || null,
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

  // System Settings
  async getSystemSetting(companyId: number, key: string): Promise<SystemSetting | undefined> {
    return Array.from(this.systemSettings.values()).find(setting => setting.companyId === companyId && setting.key === key);
  }

  async getSystemSettingsByCompany(companyId: number): Promise<SystemSetting[]> {
    return Array.from(this.systemSettings.values()).filter(setting => setting.companyId === companyId);
  }

  async setSystemSetting(setting: InsertSystemSetting): Promise<SystemSetting> {
    const existing = await this.getSystemSetting(setting.companyId, setting.key);
    if (existing) {
      return await this.updateSystemSetting(existing.id, setting) as SystemSetting;
    }
    
    const id = this.currentSystemSettingId++;
    const newSetting: SystemSetting = {
      ...setting,
      id,
      updatedAt: new Date(),
      type: setting.type || "general",
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
