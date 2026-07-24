import axios from 'axios';

// Normalize whatever NEXT_PUBLIC_API_URL is set to, so a missing "/api" or a
// stray trailing slash can't break requests. All of these end up as
// "https://host/api":  "https://host", "https://host/", "https://host/api/".
function normalizeApiBase(raw?: string): string {
  const base = (raw || 'http://localhost:5000/api').trim().replace(/\/+$/, '');
  return /\/api$/.test(base) ? base : `${base}/api`;
}

// Set NEXT_PUBLIC_API_URL in Vercel to the Render backend, e.g.
//   https://english-backend-hmw5.onrender.com/api  (the "/api" is added if missing)
export const API_BASE = normalizeApiBase(process.env.NEXT_PUBLIC_API_URL);

const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
