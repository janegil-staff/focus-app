import api, { saveTokens, clearTokens, getToken } from './client';

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  register: async ({ age, name, email, password, language = 'no', clinicianCode }) => {
    const res = await api.post('/api/auth/patient/register', {
      age, name, email, password, language,
      ...(clinicianCode && { clinicianCode }),
    });
    const { accessToken, refreshToken, patient } = res.data.data;
    await saveTokens(accessToken, refreshToken);
    return patient;
  },

  login: async ({ email, password }) => {
    const res = await api.post('/api/auth/patient/login', { email, password });
    const { accessToken, refreshToken, patient } = res.data.data;
    await saveTokens(accessToken, refreshToken);
    return patient;
  },

  getMe: async () => {
    try {
      const token = await getToken();
      if (!token) return null;
      const res = await api.get('/api/auth/me');
      return res.data.data;
    } catch {
      return null;
    }
  },

  forgotPassword: async (email) => {
    await api.post('/api/auth/patient/forgot-password', { email });
  },

  logout: clearTokens,
};

// ── Logs ──────────────────────────────────────────────────────────────────────
export const logsApi = {
  getLogs: async (limit = 90) => {
    const res = await api.get('/api/logs', { params: { limit } });
    return res.data.data;
  },

  saveLog: async (log) => {
    const res = await api.post('/api/logs', log);
    return res.data.data;
  },

  getSummary: async (days = 7) => {
    const res = await api.get('/api/logs/summary', { params: { days } });
    return res.data.data;
  },

  deleteLog: async (date) => {
    await api.delete(`/api/logs/${date}`);
  },
};

// ── Medications ───────────────────────────────────────────────────────────────
export const medsApi = {
  getMedications: async () => {
    const res = await api.get('/api/patient/medications');
    return res.data.data;
  },
  addMedication: async (med) => {
    const res = await api.post('/api/patient/medications', med);
    return res.data.data;
  },
  deleteMedication: async (id) => {
    await api.delete(`/api/patient/medications/${id}`);
  },
};
