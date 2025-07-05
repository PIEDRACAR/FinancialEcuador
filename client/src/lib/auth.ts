export const TOKEN_KEY = "jwt_token";

const isTokenValid = (): boolean => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return false;
  
  // Since we're using simple session tokens, just check if token exists
  // In a real app, you'd validate the token with the server
  return token.length > 0;
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
