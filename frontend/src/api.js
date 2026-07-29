import axios from 'axios'

// Backend (Django) se baat karne ka central setup.
// Saari API calls isi ke through jayengi.
// Local: fallback (127.0.0.1). Production (Vercel): VITE_API_URL env var se deployed backend.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api',
})

// Har request se pehle: agar token save hai, to use header mein laga do.
// Isse server pehchan leta hai ki request kaun bhej raha hai (login ke baad).
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
