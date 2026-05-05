/**
 * Lotus TEF API Client
 */

const BASE_URL = 'http://localhost:3001';

function getToken() {
  return localStorage.getItem('lotus_token');
}

async function request(method, path, body = null) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  
  if (token && token !== 'undefined' && token !== 'null') {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = { method, headers };
  if (body !== null) options.body = JSON.stringify(body);

  try {
    const res = await fetch(`${BASE_URL}${path}`, options);

    // 👇 FIM DO F5 VIOLENTO 👇
    // Em vez de recarregar a página, disparamos um evento silencioso
    if (res.status === 401 && path !== '/auth/login' && path !== '/auth/me') {
      console.warn(`[API] Sessão bloqueada (401) na rota: ${path}`);
      window.dispatchEvent(new Event('auth:unauthorized'));
      throw new Error('Sessão inválida ou expirada');
    }

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.error || `Erro ${res.status}`);
    }

    return data;
  } catch (error) {
    console.error(`[API Falhou] ${method} ${path}:`, error.message);
    throw error;
  }
}

const get = (path) => request('GET', path);
const post = (path, body) => request('POST', path, body);
const put = (path, body) => request('PUT', path, body);
const patch = (path, body) => request('PATCH', path, body);
const del = (path) => request('DELETE', path);

// ─── Auth ──────────────────────────────────────────────────────────────────
export const auth = {
  login: (email, password) => post('/auth/login', { email, password }),
  logout: () => post('/auth/logout'),
  me: () => get('/auth/me'),
};

export const clientsApi = {
  list: (search = '') => get(`/clients${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  get: (id) => get(`/clients/${id}`),
  create: (data) => post('/clients', data),
  update: (id, data) => put(`/clients/${id}`, data),
  delete: (id) => del(`/clients/${id}`),
};

export const ticketsApi = {
  list: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.status && filters.status !== 'todos') params.set('status', filters.status);
    if (filters.urgencia && filters.urgencia !== 'todas') params.set('urgencia', filters.urgencia);
    const q = params.toString();
    return get(`/tickets${q ? `?${q}` : ''}`);
  },
  get: (id) => get(`/tickets/${id}`),
  create: (data) => post('/tickets', data),
  update: (id, data) => put(`/tickets/${id}`, data),
  updateStatus: (id, status, urgencia) => patch(`/tickets/${id}/status`, { status, urgencia }),
  delete: (id) => del(`/tickets/${id}`),
};

export const whatsappApi = {
  listInstances: () => get('/whatsapp/instances'),
  createInstance: (data) => post('/whatsapp/instances', data),
  getQrCode: (id) => get(`/whatsapp/instances/${id}/qrcode`),
  deleteInstance: (id) => del(`/whatsapp/instances/${id}`),
  listConversations: () => get('/whatsapp/conversations'),
  getMessages: (conversationId) => get(`/whatsapp/conversations/${conversationId}/messages`),
  sendMessage: (conversationId, text) => post(`/whatsapp/conversations/${conversationId}/send`, { text }),
};

export const usersApi = {
  list: () => get('/users'),
  create: (data) => post('/users', data),
  updateProfile: (id, data) => put(`/users/${id}/profile`, data),
  delete: (id) => del(`/users/${id}`),
};

export default { auth, clientsApi, ticketsApi, whatsappApi, usersApi };