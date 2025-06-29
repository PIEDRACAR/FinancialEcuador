import { apiRequest } from "./queryClient";

const API_BASE = "/api";

// Auth API
export const authApi = {
  login: async (data: { email: string; password: string }) => {
    const res = await apiRequest("POST", `${API_BASE}/auth/login`, data);
    return res.json();
  },
  
  register: async (data: { name: string; email: string; password: string; confirmPassword: string }) => {
    const res = await apiRequest("POST", `${API_BASE}/auth/register`, data);
    return res.json();
  },
  
  logout: async () => {
    const res = await apiRequest("POST", `${API_BASE}/auth/logout`);
    return res.json();
  },
  
  me: async () => {
    const res = await apiRequest("GET", `${API_BASE}/auth/me`);
    return res.json();
  },
};

// Companies API
export const companiesApi = {
  getAll: async () => {
    const res = await apiRequest("GET", `${API_BASE}/companies`);
    return res.json();
  },
  
  create: async (data: { name: string; ruc?: string; address?: string }) => {
    const res = await apiRequest("POST", `${API_BASE}/companies`, data);
    return res.json();
  },
  
  update: async (id: number, data: Partial<{ name: string; ruc?: string; address?: string }>) => {
    const res = await apiRequest("PUT", `${API_BASE}/companies/${id}`, data);
    return res.json();
  },
  
  delete: async (id: number) => {
    const res = await apiRequest("DELETE", `${API_BASE}/companies/${id}`);
    return res.json();
  },
};

// Clients API
export const clientsApi = {
  getByCompany: async (companyId: number) => {
    const res = await apiRequest("GET", `${API_BASE}/companies/${companyId}/clients`);
    return res.json();
  },
  
  create: async (companyId: number, data: { name: string; ruc: string; email?: string; phone?: string; address?: string }) => {
    const res = await apiRequest("POST", `${API_BASE}/companies/${companyId}/clients`, data);
    return res.json();
  },
  
  update: async (id: number, data: Partial<{ name: string; ruc: string; email?: string; phone?: string; address?: string }>) => {
    const res = await apiRequest("PUT", `${API_BASE}/clients/${id}`, data);
    return res.json();
  },
  
  delete: async (id: number) => {
    const res = await apiRequest("DELETE", `${API_BASE}/clients/${id}`);
    return res.json();
  },
};

// Invoices API
export const invoicesApi = {
  getByCompany: async (companyId: number) => {
    const res = await apiRequest("GET", `${API_BASE}/companies/${companyId}/invoices`);
    return res.json();
  },
  
  create: async (companyId: number, data: { number: string; date: Date; total: string; status: string; clientId: number }) => {
    const res = await apiRequest("POST", `${API_BASE}/companies/${companyId}/invoices`, data);
    return res.json();
  },
  
  update: async (id: number, data: Partial<{ number: string; date: Date; total: string; status: string; clientId: number }>) => {
    const res = await apiRequest("PUT", `${API_BASE}/invoices/${id}`, data);
    return res.json();
  },
  
  delete: async (id: number) => {
    const res = await apiRequest("DELETE", `${API_BASE}/invoices/${id}`);
    return res.json();
  },
};
