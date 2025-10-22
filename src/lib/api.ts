// API Configuration and Utilities for Django Backend Integration

export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000,
  RETRY_ATTEMPTS: 3,
};

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  details?: string;
}

// Error handling utility
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public details?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Token management
export const TokenManager = {
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  },

  setToken(token: string): void {
    localStorage.setItem('auth_token', token);
  },

  removeToken(): void {
    localStorage.removeItem('auth_token');
  },

  isTokenValid(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      // Basic token validation - in a real app, you might want to check expiration
      const parts = token.split('.');
      return parts.length === 3; // Basic JWT structure check
    } catch {
      return false;
    }
  },
};

// HTTP client wrapper
export class HttpClient {
  private static async makeRequest<T = unknown>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    const token = TokenManager.getToken();

    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      defaultHeaders['Authorization'] = `Token ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      let data;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        throw new ApiError(
          data?.error || data?.message || `HTTP ${response.status}`,
          response.status,
          data?.details
        );
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new ApiError('Request timeout');
        }
        throw new ApiError(error.message);
      }

      throw new ApiError('Unknown error occurred');
    }
  }

  static async get<T = unknown>(endpoint: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: 'GET' });
  }

  static async post<T = unknown>(
    endpoint: string,
    body?: unknown
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  static async put<T = unknown>(
    endpoint: string,
    body?: unknown
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  static async patch<T = unknown>(
    endpoint: string,
    body?: unknown
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  static async delete<T = unknown>(endpoint: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: 'DELETE' });
  }

  static async uploadFile<T = unknown>(
    endpoint: string,
    formData: FormData
  ): Promise<ApiResponse<T>> {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    const token = TokenManager.getToken();

    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Token ${token}`;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new ApiError(
          data?.error || `Upload failed with status ${response.status}`,
          response.status
        );
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Upload failed');
    }
  }
}

// Retry mechanism for failed requests
export const withRetry = async <T>(
  fn: () => Promise<T>,
  maxRetries = API_CONFIG.RETRY_ATTEMPTS
): Promise<T> => {
  let lastError: Error;

  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      if (i === maxRetries) {
        break;
      }

      // Exponential backoff
      const delay = Math.pow(2, i) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
};

// Request interceptors for common functionality
export const createAuthenticatedRequest = (endpoint: string, options: RequestInit = {}) => {
  return () => HttpClient['makeRequest'](endpoint, options);
};

// Network status detection
export const NetworkStatus = {
  isOnline(): boolean {
    return navigator.onLine;
  },

  onChange(callback: (online: boolean) => void): () => void {
    const handleOnline = () => callback(true);
    const handleOffline = () => callback(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  },
};

// Local storage helpers for offline functionality
export const LocalStorageCache = {
  set<T>(key: string, data: T, ttl = 24 * 60 * 60 * 1000): void {
    const item = {
      data,
      timestamp: Date.now(),
      ttl,
    };
    localStorage.setItem(key, JSON.stringify(item));
  },

  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;

      const parsed = JSON.parse(item);
      const now = Date.now();

      if (now - parsed.timestamp > parsed.ttl) {
        localStorage.removeItem(key);
        return null;
      }

      return parsed.data;
    } catch {
      return null;
    }
  },

  remove(key: string): void {
    localStorage.removeItem(key);
  },

  clear(): void {
    localStorage.clear();
  },
};
