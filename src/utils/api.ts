const API_BASE_URL = import.meta.env.PROD ? '/api' : 'http://localhost:3001/api';

interface APIError {
  error: string;
}

interface FetchOptions extends RequestInit {
  skipJsonContentType?: boolean;
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
 * Get CSRF token from cookie
 */
function getCsrfToken(): string | null {
  const name = 'XSRF-TOKEN=';
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }
  return null;
}

function buildHeaders(
  options: FetchOptions,
  { includeAuth = false }: { includeAuth?: boolean } = {}
): Record<string, string> {
  const csrfToken = getCsrfToken();
  const headers: Record<string, string> = {
    ...((options.headers as Record<string, string>) || {}),
  };

  const unsafeMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];
  const method = options.method || 'GET';

  if (!options.skipJsonContentType && !(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  if (includeAuth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  if (csrfToken && unsafeMethods.includes(method)) {
    headers['X-CSRF-Token'] = csrfToken;
  }

  return headers;
}

/**
 * Fetch wrapper with auth token and CSRF protection
 */
async function fetchWithAuth(
  endpoint: string,
  options: FetchOptions = {}
): Promise<Response> {
  const { skipJsonContentType, ...requestOptions } = options;
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...requestOptions,
    headers: buildHeaders(options, { includeAuth: true }),
  });

  return response;
}

async function fetchWithCsrf(
  endpoint: string,
  options: FetchOptions = {}
): Promise<Response> {
  const { skipJsonContentType, ...requestOptions } = options;
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...requestOptions,
    headers: buildHeaders(options),
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

  async submitContact(data: {
    name: string;
    email: string;
    phone: string;
    service: string;
    message: string;
    website?: string;
  }) {
    const response = await fetchWithCsrf('/contact', {
      method: 'POST',
      body: JSON.stringify(data),
    });
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

  async getProfile() {
    const response = await fetchWithAuth('/auth/profile', { skipJsonContentType: true });
    return handleResponse(response);
  },

  async updatePassword(data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) {
    const response = await fetchWithAuth('/auth/password', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async updateEmail(email: string) {
    const response = await fetchWithAuth('/auth/email', {
      method: 'PUT',
      body: JSON.stringify({ email }),
    });
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

  async getAdminLegalPages() {
    const response = await fetchWithAuth('/legal/admin/pages', { skipJsonContentType: true });
    return handleResponse(response);
  },

  // Media management endpoints
  async getMedia() {
    const response = await fetchWithAuth('/media', { skipJsonContentType: true });
    return handleResponse(response);
  },

  async uploadImage(file: File) {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetchWithAuth('/media/upload', {
      method: 'POST',
      body: formData,
      skipJsonContentType: true,
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
    const response = await fetchWithAuth(`/analytics/stats?days=${days}`, { skipJsonContentType: true });
    return handleResponse(response);
  },

  // Contact management endpoints
  async getContacts(params?: { status?: string; search?: string; limit?: number; offset?: number }) {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const suffix = queryParams.toString();
    const response = await fetchWithAuth(`/contacts${suffix ? `?${suffix}` : ''}`, { skipJsonContentType: true });
    return handleResponse(response);
  },

  async getContactStats() {
    const response = await fetchWithAuth('/contacts/stats', { skipJsonContentType: true });
    return handleResponse(response);
  },

  async updateContact(id: number, updates: Record<string, unknown>) {
    const response = await fetchWithAuth(`/contacts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return handleResponse(response);
  },

  async deleteContact(id: number) {
    const response = await fetchWithAuth(`/contacts/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  },

  async exportContacts() {
    const response = await fetchWithAuth('/contacts/export', { skipJsonContentType: true });

    if (!response.ok) {
      const error: APIError = await response.json().catch(() => ({
        error: 'An unexpected error occurred',
      }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.blob();
  },

  // System settings endpoints
  async getSMTPConfig() {
    const response = await fetchWithAuth('/system-settings/smtp', { skipJsonContentType: true });
    return handleResponse(response);
  },

  async updateSMTPConfig(data: {
    host: string;
    port: number;
    user: string;
    pass: string;
    from: string;
  }) {
    const response = await fetchWithAuth('/system-settings/smtp', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async testSMTPConfig(data: {
    host: string;
    port: number;
    user: string;
    pass?: string;
  }) {
    const response = await fetchWithAuth('/system-settings/smtp/test', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  // Invoice endpoints
  async getInvoices(params?: { status?: string; search?: string; limit?: number; offset?: number }) {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const suffix = queryParams.toString();
    const response = await fetchWithAuth(`/invoices${suffix ? `?${suffix}` : ''}`, { skipJsonContentType: true });
    return handleResponse(response);
  },

  async getInvoiceStats() {
    const response = await fetchWithAuth('/invoices/stats', { skipJsonContentType: true });
    return handleResponse(response);
  },

  async getInvoice(id: number) {
    const response = await fetchWithAuth(`/invoices/${id}`, { skipJsonContentType: true });
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
