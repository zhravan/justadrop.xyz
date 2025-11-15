import { apiService } from './api.service';

export interface User {
  id: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface AuthResponse {
  status: string;
  data: {
    user: User;
    token: string;
  };
  message?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  role?: 'VOLUNTEER' | 'ORGANIZATION';
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export const authService = {
  login: (credentials: LoginCredentials) =>
    apiService.post<AuthResponse>('/auth/login', credentials),

  register: (data: RegisterData) =>
    apiService.post<AuthResponse>('/auth/register', data),

  getProfile: () =>
    apiService.get<{ status: string; data: User }>('/auth/profile'),
};

