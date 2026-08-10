const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function getToken() {
  return localStorage.getItem('token');
}

async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
}

export const authAPI = {
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  getProfile: () => request('/auth/profile'),
};

export const contentAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/content${query ? `?${query}` : ''}`);
  },
  getById: (id) => request(`/content/${id}`),
  create: (body) => request('/content', { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) => request(`/content/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (id) => request(`/content/${id}`, { method: 'DELETE' }),
  submit: (id) => request(`/content/${id}/submit`, { method: 'POST' }),
  schedule: (id, body) => request(`/content/${id}/schedule`, { method: 'POST', body: JSON.stringify(body) }),
  publish: (id) => request(`/content/${id}/publish`, { method: 'POST' }),
};

export const reviewAPI = {
  getPending: () => request('/reviews/pending'),
  getByContent: (contentId) => request(`/reviews/${contentId}`),
  approve: (contentId, body) => request(`/reviews/${contentId}/approve`, { method: 'POST', body: JSON.stringify(body) }),
  reject: (contentId, body) => request(`/reviews/${contentId}/reject`, { method: 'POST', body: JSON.stringify(body) }),
};

export const dashboardAPI = {
  getStats: () => request('/dashboard/stats'),
  getSchedule: () => request('/dashboard/schedule'),
};

export const userAPI = {
  getAll: () => request('/users'),
  getById: (id) => request(`/users/${id}`),
  update: (id, body) => request(`/users/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (id) => request(`/users/${id}`, { method: 'DELETE' }),
};
