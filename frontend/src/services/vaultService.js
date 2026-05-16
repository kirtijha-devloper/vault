import api from './api';

// Auth Services
export const authService = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('vault_token', response.data.token);
      localStorage.setItem('vault_user', JSON.stringify(response.data));
    }
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('vault_token', response.data.token);
      localStorage.setItem('vault_user', JSON.stringify(response.data));
    }
    return response.data;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error(err);
    } finally {
      localStorage.removeItem('vault_token');
      localStorage.removeItem('vault_user');
    }
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Password Services
export const passwordService = {
  getAll: async () => {
    const response = await api.get('/vault/passwords');
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/vault/passwords', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/vault/passwords/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/vault/passwords/${id}`);
    return response.data;
  },
};

// Document Services
export const documentService = {
  getAll: async () => {
    const response = await api.get('/vault/documents');
    return response.data;
  },

  upload: async (formData) => {
    const response = await api.post('/vault/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/vault/documents/${id}`);
    return response.data;
  },
};

// Note Services
export const noteService = {
  getAll: async () => {
    const response = await api.get('/vault/notes');
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/vault/notes', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/vault/notes/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/vault/notes/${id}`);
    return response.data;
  },
};

// Share Services
export const shareService = {
  create: async (data) => {
    const response = await api.post('/share/create', data);
    return response.data;
  },

  getMyShares: async () => {
    const response = await api.get('/share');
    return response.data;
  },

  revoke: async (id) => {
    const response = await api.delete(`/share/revoke/${id}`);
    return response.data;
  },

  getSharedItem: async (token, password = null) => {
    const response = await api.post(`/share/${token}`, { password });
    return response.data;
  },
};
