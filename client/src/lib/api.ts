import { apiRequest } from "./queryClient";

const API_BASE = "/api";
const AUTH_API_BASE = "http://localhost:8000";

// Auth API - Connected to FastAPI backend
export const authApi = {
  login: async (data: { email: string; password: string }) => {
    const response = await fetch(`${AUTH_API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Error en el inicio de sesión");
    }

    const result = await response.json();
    return { token: result.access_token, tokenType: result.token_type };
  },
  
  register: async (data: { name: string; email: string; password: string; confirmPassword: string }) => {
    const response = await fetch(`${AUTH_API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Error en el registro");
    }

    return response.json();
  },
  
  logout: async () => {
    // JWT logout is handled client-side by removing the token
    return { message: "Sesión cerrada exitosamente" };
  },
  
  me: async () => {
    const token = localStorage.getItem("jwt_token");
    if (!token) return null;

    const response = await fetch(`${AUTH_API_BASE}/auth/me`, {
      headers: { 
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem("jwt_token");
        return null;
      }
      throw new Error("Error al obtener datos del usuario");
    }

    return response.json();
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
