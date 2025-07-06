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

// Tabla para Proveedores
export const suppliers = pgTable("suppliers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  ruc: text("ruc").notNull(),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  contactPerson: text("contact_person"),
  category: text("category"), // bienes, servicios, arrendamientos, honorarios
  paymentTerms: text("payment_terms").default("contado"),
  isActive: boolean("is_active").default(true).notNull(),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Tabla para Productos/Servicios
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  code: text("code").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category"),
  unit: text("unit").default("unidad"), // unidad, kg, litros, etc.
  purchasePrice: decimal("purchase_price", { precision: 10, scale: 2 }).default("0.00"),
  salePrice: decimal("sale_price", { precision: 10, scale: 2 }).default("0.00"),
  ivaRate: decimal("iva_rate", { precision: 5, scale: 2 }).default("15.00"),
  stock: integer("stock").default(0),
  minStock: integer("min_stock").default(0),
  isActive: boolean("is_active").default(true).notNull(),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  number: text("number").notNull(),
  date: timestamp("date").notNull(),
  // Removido dueDate - Las facturas en Ecuador no llevan fecha de vencimiento
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull().default("0"),
  iva: decimal("iva", { precision: 10, scale: 2 }).notNull().default("0"),
  ivaRate: decimal("iva_rate", { precision: 5, scale: 2 }).notNull().default("15.00"), // IVA actualizado 15%
  ice: decimal("ice", { precision: 10, scale: 2 }).default("0.00"), // Impuesto a Consumos Especiales
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull(), // 'pendiente', 'pagada', 'cancelada'
  type: text("type").notNull().default("factura"), // factura, proforma, nota_credito, nota_debito
  paymentMethod: text("payment_method").default("efectivo"), // efectivo, tarjeta, transferencia, credito
  authorizationCode: text("authorization_code"), // Código de autorización SRI
  accessKey: text("access_key"), // Clave de acceso SRI
  xmlSigned: text("xml_signed"), // XML firmado para SRI
  items: text("items").default("[]"),
  notes: text("notes").default(""),
  clientId: integer("client_id").references(() => clients.id).notNull(),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Tabla para Proformas (Cotizaciones)
export const proformas = pgTable("proformas", {
  id: serial("id").primaryKey(),
  number: text("number").notNull(),
  date: timestamp("date").notNull(),
  validUntil: timestamp("valid_until").notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull().default("0"),
  iva: decimal("iva", { precision: 10, scale: 2 }).notNull().default("0"),
  ivaRate: decimal("iva_rate", { precision: 5, scale: 2 }).notNull().default("15.00"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pendiente"), // pendiente, aceptada, rechazada, vencida
  items: text("items").default("[]"),
  notes: text("notes").default(""),
  termsConditions: text("terms_conditions").default(""),
  clientId: integer("client_id").references(() => clients.id).notNull(),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Tabla para Compras
export const purchases = pgTable("purchases", {
  id: serial("id").primaryKey(),
  number: text("number").notNull(),
  date: timestamp("date").notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull().default("0"),
  iva: decimal("iva", { precision: 10, scale: 2 }).notNull().default("0"),
  ivaRate: decimal("iva_rate", { precision: 5, scale: 2 }).notNull().default("15.00"),
  ice: decimal("ice", { precision: 10, scale: 2 }).default("0.00"),
  retentionFuente: decimal("retention_fuente", { precision: 10, scale: 2 }).default("0.00"),
  retentionIva: decimal("retention_iva", { precision: 10, scale: 2 }).default("0.00"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pendiente"), // pendiente, pagada, cancelada
  type: text("type").notNull().default("compra"), // compra, gasto, activo
  paymentMethod: text("payment_method").default("efectivo"),
  authorizationCode: text("authorization_code"), // Código de autorización SRI
  accessKey: text("access_key"), // Clave de acceso SRI
  xmlSigned: text("xml_signed"), // XML firmado para SRI
  items: text("items").default("[]"),
  notes: text("notes").default(""),
  supplierId: integer("supplier_id").references(() => suppliers.id).notNull(),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Tabla para Comprobantes de Retención (Normativa Ecuador 2024)
export const retentions = pgTable("retentions", {
  id: serial("id").primaryKey(),
  number: text("number").notNull(),
  date: timestamp("date").notNull(),
  type: text("type").notNull(), // fuente, iva
  concept: text("concept").notNull(), // bienes, servicios, arrendamientos, honorarios
  percentage: decimal("percentage", { precision: 5, scale: 2 }).notNull(),
  baseAmount: decimal("base_amount", { precision: 10, scale: 2 }).notNull(),
  retentionAmount: decimal("retention_amount", { precision: 10, scale: 2 }).notNull(),
  authorizationCode: text("authorization_code"), // Código de autorización SRI
  accessKey: text("access_key"), // Clave de acceso SRI
  xmlSigned: text("xml_signed"), // XML firmado para SRI
  invoiceId: integer("invoice_id").references(() => invoices.id, { onDelete: "cascade" }),
  purchaseId: integer("purchase_id").references(() => purchases.id, { onDelete: "cascade" }),
  clientId: integer("client_id").references(() => clients.id),
  supplierId: integer("supplier_id").references(() => suppliers.id),
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

export const insertSupplierSchema = createInsertSchema(suppliers).omit({
  id: true,
  createdAt: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  createdAt: true,
});

export const insertProformaSchema = createInsertSchema(proformas).omit({
  id: true,
  createdAt: true,
});

export const insertPurchaseSchema = createInsertSchema(purchases).omit({
  id: true,
  createdAt: true,
});

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
export type Supplier = typeof suppliers.$inferSelect;
export type InsertSupplier = z.infer<typeof insertSupplierSchema>;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Proforma = typeof proformas.$inferSelect;
export type InsertProforma = z.infer<typeof insertProformaSchema>;
export type Purchase = typeof purchases.$inferSelect;
export type InsertPurchase = z.infer<typeof insertPurchaseSchema>;
export type Retention = typeof retentions.$inferSelect;
export type InsertRetention = z.infer<typeof insertRetentionSchema>;
export type ChartOfAccount = typeof chartOfAccounts.$inferSelect;
export type InsertChartOfAccount = z.infer<typeof insertChartOfAccountSchema>;
export type JournalEntry = typeof journalEntries.$inferSelect;
export type InsertJournalEntry = z.infer<typeof insertJournalEntrySchema>;
export type JournalEntryDetail = typeof journalEntryDetails.$inferSelect;
export type InsertJournalEntryDetail = z.infer<typeof insertJournalEntryDetailSchema>;
export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type Payroll = typeof payrolls.$inferSelect;
export type InsertPayroll = z.infer<typeof insertPayrollSchema>;
export type SystemSetting = typeof systemSettings.$inferSelect;
export type InsertSystemSetting = z.infer<typeof insertSystemSettingSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;

// Constantes para tasas impositivas Ecuador 2024 - JULIO 2024 ACTUALIZADO
export const ECUADOR_TAX_RATES = {
  IVA: {
    GENERAL: 15.0,
    REDUCIDO: 5.0,
    CERO: 0.0
  },
  RETENCIONES: {
    RENTA: {
      BIENES: 1.75,
      SERVICIOS: 3.5,
      ARRENDAMIENTOS: 10.0,
      HONORARIOS: 10.0,
      TRANSPORTE: 1.0,
      COMBUSTIBLES: 0.3,
      SEGUROS: 1.0,
      RENDIMIENTOS_FINANCIEROS: 2.0,
      OTROS_SERVICIOS: 3.5
    },
    IVA: {
      BIENES: 30.0,
      SERVICIOS: 70.0,
      SERVICIOS_PROFESIONALES: 100.0
    }
  },
  IMPUESTO_RENTA: {
    // Tabla progresiva personas naturales 2024
    TRAMOS: [
      { desde: 0, hasta: 11722, porcentaje: 0, deduccion: 0 },
      { desde: 11722, hasta: 14930, porcentaje: 5, deduccion: 586 },
      { desde: 14930, hasta: 19385, porcentaje: 10, deduccion: 1332 },
      { desde: 19385, hasta: 25638, porcentaje: 12, deduccion: 1720 },
      { desde: 25638, hasta: 33738, porcentaje: 15, deduccion: 2489 },
      { desde: 33738, hasta: 44721, porcentaje: 20, deduccion: 4176 },
      { desde: 44721, hasta: 59537, porcentaje: 25, deduccion: 6412 },
      { desde: 59537, hasta: 79388, porcentaje: 30, deduccion: 9388 },
      { desde: 79388, hasta: 105580, porcentaje: 35, deduccion: 13360 },
      { desde: 105580, hasta: Infinity, porcentaje: 37, deduccion: 15472 }
    ]
  },
  ICE: {
    VEHICULOS_MIN: 5.0,
    VEHICULOS_MAX: 35.0,
    BEBIDAS_AZUCARADAS: 20.0,
    CIGARRILLOS: 50.0,
    ALCOHOL: 75.0,
    PERFUMES: 20.0
  },
  NOMINA: {
    IESS_EMPLEADO: 9.45,
    IESS_EMPLEADOR: 12.15,
    IESS_TOTAL: 21.60,
    FONDOS_RESERVA: 8.33,
    DECIMO_TERCERO: 8.33,
    DECIMO_CUARTO: 450.00, // Salario básico unificado 2024
    VACACIONES: 4.17
  },
  SRI: {
    RUC_VALIDATION_ENDPOINT: "https://srienlinea.sri.gob.ec/sri-en-linea/SriRucWeb/ConsultaRuc",
    XML_SCHEMA_VERSION: "2.1.0",
    AMBIENTE_PRUEBAS: 1,
    AMBIENTE_PRODUCCION: 2
  }
};

// Configuración SRI para importación automática
export const sriConfig = pgTable("sri_config", {
  id: text("id").primaryKey().notNull(),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  ruc: text("ruc").notNull(),
  claveContribuyente: text("clave_contribuyente").notNull(), // Encriptada
  ambiente: text("ambiente").default("produccion"), // produccion o pruebas
  certificadoDigital: text("certificado_digital"), // Para firmas electrónicas
  lastSync: timestamp("last_sync"),
  syncStatus: text("sync_status").default("pending"), // pending, syncing, completed, error
  autoSync: boolean("auto_sync").default(true),
  syncFrequency: text("sync_frequency").default("daily"), // hourly, daily, weekly
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Log de sincronizaciones SRI
export const sriSyncLog = pgTable("sri_sync_log", {
  id: text("id").primaryKey().notNull(),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  syncType: text("sync_type").notNull(), // compras, ventas, retenciones, anulaciones
  startTime: timestamp("start_time").defaultNow(),
  endTime: timestamp("end_time"),
  status: text("status").notNull(), // success, error, partial
  recordsProcessed: integer("records_processed").default(0),
  recordsImported: integer("records_imported").default(0),
  errors: text("errors"), // JSON con errores detallados
  details: text("details"), // JSON con detalles de la importación
  createdAt: timestamp("created_at").defaultNow(),
});

// Compras importadas del SRI
export const comprasSRI = pgTable("compras_sri", {
  id: text("id").primaryKey().notNull(),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  numeroComprobante: text("numero_comprobante").notNull(),
  rucProveedor: text("ruc_proveedor").notNull(),
  razonSocialProveedor: text("razon_social_proveedor").notNull(),
  fechaEmision: timestamp("fecha_emision").notNull(),
  fechaAutorizacion: timestamp("fecha_autorizacion"),
  tipoComprobante: text("tipo_comprobante").notNull(), // 01=Factura, 03=Liquidacion, 04=Nota Credito, 05=Nota Debito
  ambiente: text("ambiente").notNull(), // 1=Pruebas, 2=Produccion
  baseImponible: decimal("base_imponible", { precision: 10, scale: 2 }).default("0"),
  baseImpGrav: decimal("base_imp_grav", { precision: 10, scale: 2 }).default("0"),
  baseImpExe: decimal("base_imp_exe", { precision: 10, scale: 2 }).default("0"),
  montoIce: decimal("monto_ice", { precision: 10, scale: 2 }).default("0"),
  montoIva: decimal("monto_iva", { precision: 10, scale: 2 }).default("0"),
  valorRetenidoIva: decimal("valor_retenido_iva", { precision: 10, scale: 2 }).default("0"),
  valorRetenidoRenta: decimal("valor_retenido_renta", { precision: 10, scale: 2 }).default("0"),
  valorTotal: decimal("valor_total", { precision: 10, scale: 2 }).notNull(),
  estadoComprobante: text("estado_comprobante").default("AUTORIZADO"), // AUTORIZADO, ANULADO
  claveAcceso: text("clave_acceso").notNull().unique(),
  xml: text("xml"), // XML completo del comprobante
  processed: boolean("processed").default(false), // Si ya se procesó contablemente
  invoiceId: integer("invoice_id").references(() => invoices.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Ventas reportadas al SRI
export const ventasSRI = pgTable("ventas_sri", {
  id: text("id").primaryKey().notNull(),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  numeroComprobante: text("numero_comprobante").notNull(),
  rucCliente: text("ruc_cliente").notNull(),
  razonSocialCliente: text("razon_social_cliente").notNull(),
  fechaEmision: timestamp("fecha_emision").notNull(),
  fechaAutorizacion: timestamp("fecha_autorizacion"),
  tipoComprobante: text("tipo_comprobante").notNull(),
  ambiente: text("ambiente").notNull(),
  baseImponible: decimal("base_imponible", { precision: 10, scale: 2 }).default("0"),
  baseImpGrav: decimal("base_imp_grav", { precision: 10, scale: 2 }).default("0"),
  baseImpExe: decimal("base_imp_exe", { precision: 10, scale: 2 }).default("0"),
  montoIce: decimal("monto_ice", { precision: 10, scale: 2 }).default("0"),
  montoIva: decimal("monto_iva", { precision: 10, scale: 2 }).default("0"),
  valorTotal: decimal("valor_total", { precision: 10, scale: 2 }).notNull(),
  estadoComprobante: text("estado_comprobante").default("AUTORIZADO"),
  claveAcceso: text("clave_acceso").notNull().unique(),
  xml: text("xml"),
  processed: boolean("processed").default(false),
  invoiceId: integer("invoice_id").references(() => invoices.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Retenciones emitidas
export const retencionesSRI = pgTable("retenciones_sri", {
  id: text("id").primaryKey().notNull(),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  numeroRetencion: text("numero_retencion").notNull(),
  rucSujeto: text("ruc_sujeto").notNull(),
  razonSocialSujeto: text("razon_social_sujeto").notNull(),
  fechaEmision: timestamp("fecha_emision").notNull(),
  fechaAutorizacion: timestamp("fecha_autorizacion"),
  tipoDocumentoSustento: text("tipo_documento_sustento").notNull(), // 01=Factura, 03=Liquidacion
  numeroDocumentoSustento: text("numero_documento_sustento").notNull(),
  fechaEmisionDocSustento: timestamp("fecha_emision_doc_sustento").notNull(),
  baseImponible: decimal("base_imponible", { precision: 10, scale: 2 }).notNull(),
  impuesto: text("impuesto").notNull(), // 1=RENTA, 2=IVA, 6=ICE
  codigoRetencion: text("codigo_retencion").notNull(),
  porcentajeRetencion: decimal("porcentaje_retencion", { precision: 5, scale: 2 }).notNull(),
  valorRetenido: decimal("valor_retenido", { precision: 10, scale: 2 }).notNull(),
  claveAcceso: text("clave_acceso").notNull().unique(),
  xml: text("xml"),
  processed: boolean("processed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Anulaciones de comprobantes
export const anulacionesSRI = pgTable("anulaciones_sri", {
  id: text("id").primaryKey().notNull(),
  companyId: integer("company_id").references(() => companies.id).notNull(),
  claveAccesoAnulado: text("clave_acceso_anulado").notNull(),
  fechaAnulacion: timestamp("fecha_anulacion").notNull(),
  motivo: text("motivo").notNull(),
  tipoComprobante: text("tipo_comprobante").notNull(),
  numeroComprobante: text("numero_comprobante").notNull(),
  processed: boolean("processed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export type SRIConfig = typeof sriConfig.$inferSelect;
export type InsertSRIConfig = typeof sriConfig.$inferInsert;
export type SRISyncLog = typeof sriSyncLog.$inferSelect;
export type InsertSRISyncLog = typeof sriSyncLog.$inferInsert;
export type CompraSRI = typeof comprasSRI.$inferSelect;
export type InsertCompraSRI = typeof comprasSRI.$inferInsert;
export type VentaSRI = typeof ventasSRI.$inferSelect;
export type InsertVentaSRI = typeof ventasSRI.$inferInsert;
export type RetencionSRI = typeof retencionesSRI.$inferSelect;
export type InsertRetencionSRI = typeof retencionesSRI.$inferInsert;
export type AnulacionSRI = typeof anulacionesSRI.$inferSelect;
export type InsertAnulacionSRI = typeof anulacionesSRI.$inferInsert;