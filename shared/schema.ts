import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  ruc: text("ruc"),
  address: text("address"),
  email: text("email"),
  phone: text("phone"),
  ownerId: integer("owner_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  ruc: text("ruc").notNull(),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  number: text("number").notNull(),
  date: timestamp("date").notNull(),
  dueDate: timestamp("due_date"),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull().default("0"),
  iva: decimal("iva", { precision: 10, scale: 2 }).notNull().default("0"),
  ivaRate: decimal("iva_rate", { precision: 5, scale: 2 }).notNull().default("15.00"), // IVA variable
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull(), // 'pendiente', 'pagada', 'vencida'
  type: text("type").notNull().default("factura"), // factura, proforma, nota_credito, nota_debito
  items: text("items").default("[]"),
  notes: text("notes").default(""),
  clientId: integer("client_id").references(() => clients.id).notNull(),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Tabla para Comprobantes de Retención
export const retentions = pgTable("retentions", {
  id: serial("id").primaryKey(),
  number: text("number").notNull(),
  date: timestamp("date").notNull(),
  type: text("type").notNull(), // fuente, iva
  percentage: decimal("percentage", { precision: 5, scale: 2 }).notNull(),
  baseAmount: decimal("base_amount", { precision: 10, scale: 2 }).notNull(),
  retentionAmount: decimal("retention_amount", { precision: 10, scale: 2 }).notNull(),
  invoiceId: integer("invoice_id").references(() => invoices.id, { onDelete: "cascade" }),
  clientId: integer("client_id").references(() => clients.id).notNull(),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Tabla para Plan de Cuentas
export const chartOfAccounts = pgTable("chart_of_accounts", {
  id: serial("id").primaryKey(),
  code: text("code").notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(), // activo, pasivo, patrimonio, ingreso, gasto
  parentId: integer("parent_id"),
  level: integer("level").notNull().default(1),
  isActive: boolean("is_active").notNull().default(true),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Tabla para Asientos Contables
export const journalEntries = pgTable("journal_entries", {
  id: serial("id").primaryKey(),
  number: text("number").notNull(),
  date: timestamp("date").notNull(),
  description: text("description").notNull(),
  reference: text("reference"),
  type: text("type").notNull().default("manual"), // manual, automatic
  companyId: integer("company_id").references(() => companies.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Tabla para Detalles de Asientos
export const journalEntryDetails = pgTable("journal_entry_details", {
  id: serial("id").primaryKey(),
  journalEntryId: integer("journal_entry_id").references(() => journalEntries.id, { onDelete: "cascade" }).notNull(),
  accountId: integer("account_id").references(() => chartOfAccounts.id, { onDelete: "cascade" }).notNull(),
  debit: decimal("debit", { precision: 10, scale: 2 }).default("0.00"),
  credit: decimal("credit", { precision: 10, scale: 2 }).default("0.00"),
  description: text("description"),
});

// Tabla para Empleados
export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  cedula: text("cedula").notNull(),
  email: text("email"),
  phone: text("phone"),
  position: text("position").notNull(),
  department: text("department"),
  salary: decimal("salary", { precision: 10, scale: 2 }).notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  isActive: boolean("is_active").notNull().default(true),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Tabla para Nómina
export const payrolls = pgTable("payrolls", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").references(() => employees.id, { onDelete: "cascade" }).notNull(),
  period: text("period").notNull(), // YYYY-MM
  baseSalary: decimal("base_salary", { precision: 10, scale: 2 }).notNull(),
  overtime: decimal("overtime", { precision: 10, scale: 2 }).default("0.00"),
  bonuses: decimal("bonuses", { precision: 10, scale: 2 }).default("0.00"),
  grossSalary: decimal("gross_salary", { precision: 10, scale: 2 }).notNull(),
  iessEmployee: decimal("iess_employee", { precision: 10, scale: 2 }).notNull(),
  incomeTax: decimal("income_tax", { precision: 10, scale: 2 }).default("0.00"),
  netSalary: decimal("net_salary", { precision: 10, scale: 2 }).notNull(),
  iessEmployer: decimal("iess_employer", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pendiente"),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Tabla para Configuraciones del Sistema
export const systemSettings = pgTable("system_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull(),
  value: text("value").notNull(),
  type: text("type").notNull().default("string"), // string, number, boolean, json
  companyId: integer("company_id").references(() => companies.id).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
  createdAt: true,
  ownerId: true,
});

export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  createdAt: true,
});

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export const registerSchema = insertUserSchema.extend({
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Company = typeof companies.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;
export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;

// Nuevos tipos para las tablas agregadas
export type Retention = typeof retentions.$inferSelect;
export type InsertRetention = typeof retentions.$inferInsert;
export type ChartOfAccount = typeof chartOfAccounts.$inferSelect;
export type InsertChartOfAccount = typeof chartOfAccounts.$inferInsert;
export type JournalEntry = typeof journalEntries.$inferSelect;
export type InsertJournalEntry = typeof journalEntries.$inferInsert;
export type JournalEntryDetail = typeof journalEntryDetails.$inferSelect;
export type InsertJournalEntryDetail = typeof journalEntryDetails.$inferInsert;
export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = typeof employees.$inferInsert;
export type Payroll = typeof payrolls.$inferSelect;
export type InsertPayroll = typeof payrolls.$inferInsert;
export type SystemSetting = typeof systemSettings.$inferSelect;
export type InsertSystemSetting = typeof systemSettings.$inferInsert;

// Schemas de inserción para las nuevas tablas
export const insertRetentionSchema = createInsertSchema(retentions).omit({
  id: true,
  createdAt: true,
});
export const insertChartOfAccountSchema = createInsertSchema(chartOfAccounts).omit({
  id: true,
  createdAt: true,
});
export const insertJournalEntrySchema = createInsertSchema(journalEntries).omit({
  id: true,
  createdAt: true,
});
export const insertJournalEntryDetailSchema = createInsertSchema(journalEntryDetails).omit({
  id: true,
});
export const insertEmployeeSchema = createInsertSchema(employees).omit({
  id: true,
  createdAt: true,
});
export const insertPayrollSchema = createInsertSchema(payrolls).omit({
  id: true,
  createdAt: true,
});
export const insertSystemSettingSchema = createInsertSchema(systemSettings).omit({
  id: true,
  updatedAt: true,
});
