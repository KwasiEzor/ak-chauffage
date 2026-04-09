const API_BASE_URL = import.meta.env.PROD ? '/api' : 'http://localhost:3001/api';

interface APIError {
  error: string;
}

/**
 * Get auth token from localStorage
 */
function getToken(): string | null {
  return localStorage.getItem('admin_token');
}

/**
 * Set auth token in localStorage
 */
export function setToken(token: string): void {
  localStorage.setItem('admin_token', token);
}

/**
 * Remove auth token from localStorage
 */
export function removeToken(): void {
  localStorage.removeItem('admin_token');
}

/**
 * Fetch wrapper with auth token
 */
async function fetchWithAuth(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  return response;
}

/**
 * Handle API response
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error: APIError = await response.json().catch(() => ({
      error: 'An unexpected error occurred',
    }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// Public API (no auth required)
export const api = {
  // Content endpoints
  async getContent() {
    const response = await fetch(`${API_BASE_URL}/content`);
    return handleResponse(response);
  },

  async getContentType(type: string) {
    const response = await fetch(`${API_BASE_URL}/content/${type}`);
    return handleResponse(response);
  },

  // Settings endpoints
  async getSettings() {
    const response = await fetch(`${API_BASE_URL}/settings`);
    return handleResponse(response);
  },

  // Legal pages endpoints
  async getLegalPages() {
    const response = await fetch(`${API_BASE_URL}/legal`);
    return handleResponse(response);
  },

  async getLegalPage(slug: string) {
    const response = await fetch(`${API_BASE_URL}/legal/${slug}`);
    return handleResponse(response);
  },
};

// Admin API (auth required)
export const adminApi = {
  // Auth endpoints
  async login(username: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    return handleResponse(response);
  },

  async logout() {
    const response = await fetchWithAuth('/auth/logout', { method: 'POST' });
    return handleResponse(response);
  },

  async verifyToken() {
    const response = await fetchWithAuth('/auth/verify');
    return handleResponse(response);
  },

  // Content management endpoints
  async updateContent(content: any) {
    const response = await fetchWithAuth('/content', {
      method: 'PUT',
      body: JSON.stringify(content),
    });
    return handleResponse(response);
  },

  async updateContentType(type: string, data: any) {
    const response = await fetchWithAuth(`/content/${type}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async updateContentItem(type: string, id: number, item: any) {
    const response = await fetchWithAuth(`/content/${type}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(item),
    });
    return handleResponse(response);
  },

  // Settings management endpoints
  async updateSettings(settings: any) {
    const response = await fetchWithAuth('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
    return handleResponse(response);
  },

  // Legal pages management endpoints
  async updateLegalPage(id: string, page: any) {
    const response = await fetchWithAuth(`/legal/${id}`, {
      method: 'PUT',
      body: JSON.stringify(page),
    });
    return handleResponse(response);
  },

  // Media management endpoints
  async getMedia() {
    const response = await fetchWithAuth('/media');
    return handleResponse(response);
  },

  async uploadImage(file: File) {
    const token = getToken();
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${API_BASE_URL}/media/upload`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    return handleResponse(response);
  },

  async deleteImage(filename: string) {
    const response = await fetchWithAuth(`/media/${filename}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  },

  // Analytics endpoints
  async getAnalyticsStats(days: number = 7) {
    const response = await fetchWithAuth(`/analytics/stats?days=${days}`);
    return handleResponse(response);
  },

  // Invoice endpoints
  async getInvoices(params?: { status?: string; search?: string; limit?: number; offset?: number }) {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const response = await fetchWithAuth(`/invoices?${queryParams.toString()}`);
    return handleResponse(response);
  },

  async getInvoiceStats() {
    const response = await fetchWithAuth('/invoices/stats');
    return handleResponse(response);
  },

  async getInvoice(id: number) {
    const response = await fetchWithAuth(`/invoices/${id}`);
    return handleResponse(response);
  },

  async createInvoice(data: { invoice: any; lineItems: any[] }) {
    const response = await fetchWithAuth('/invoices', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async updateInvoiceStatus(id: number, status: string, paidDate?: string) {
    const response = await fetchWithAuth(`/invoices/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, paidDate }),
    });
    return handleResponse(response);
  },

  async deleteInvoice(id: number) {
    const response = await fetchWithAuth(`/invoices/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  },
};

export default api;
