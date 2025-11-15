import axios, { AxiosInstance, AxiosError } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response) => response.data,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  get<T = any>(url: string, config = {}) {
    return this.client.get<T, T>(url, config);
  }

  post<T = any>(url: string, data = {}, config = {}) {
    return this.client.post<T, T>(url, data, config);
  }

  put<T = any>(url: string, data = {}, config = {}) {
    return this.client.put<T, T>(url, data, config);
  }

  delete<T = any>(url: string, config = {}) {
    return this.client.delete<T, T>(url, config);
  }
}

export const apiService = new ApiService();

