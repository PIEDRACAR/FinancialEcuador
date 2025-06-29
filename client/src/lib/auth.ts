export const TOKEN_KEY = "jwt_token";

const isTokenValid = (): boolean => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return false;
  
  try {
    // Basic JWT structure check (header.payload.signature)
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    // Decode payload to check expiration
    const payload = JSON.parse(atob(parts[1]));
    const now = Math.floor(Date.now() / 1000);
    
    return payload.exp > now;
  } catch {
    return false;
  }
};

export const authStorage = {
  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },
  
  setToken: (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
  },
  
  removeToken: (): void => {
    localStorage.removeItem(TOKEN_KEY);
  },
  
  getBearerToken: (): string | null => {
    const token = localStorage.getItem(TOKEN_KEY);
    return token ? `Bearer ${token}` : null;
  },
  
  isTokenValid,
  
  isAuthenticated: (): boolean => {
    return isTokenValid();
  },
};

// Update API client to include token
const originalFetch = window.fetch;
window.fetch = function(input, init = {}) {
  const token = authStorage.getToken();
  if (token) {
    init.headers = {
      ...init.headers,
      Authorization: `Bearer ${token}`,
    };
  }
  return originalFetch(input, init);
};
