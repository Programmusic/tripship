import axios from 'axios'
import { mockRequest } from '@/demo/mockApi.js'

export const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true'

const http = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('tripship_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !isDemoMode) {
      localStorage.removeItem('tripship_token')
      localStorage.removeItem('tripship_user')
    }
    return Promise.reject(error)
  }
)

const api = {
  async get(url, config) {
    if (isDemoMode) return { data: await mockRequest('GET', url) }
    return http.get(url, config)
  },
  async post(url, data, config) {
    if (isDemoMode) return { data: await mockRequest('POST', url, data) }
    return http.post(url, data, config)
  },
}

export default api
