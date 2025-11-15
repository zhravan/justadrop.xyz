import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authService, type User, type LoginCredentials, type RegisterData } from '@/services/auth.service';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const isAuthenticated = computed(() => !!token.value);

  const loadFromStorage = () => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      token.value = storedToken;
      user.value = JSON.parse(storedUser);
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      loading.value = true;
      error.value = null;

      const response = await authService.login(credentials);
      
      user.value = response.data.user;
      token.value = response.data.token;

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      return response;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Login failed';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      loading.value = true;
      error.value = null;

      const response = await authService.register(data);
      
      user.value = response.data.user;
      token.value = response.data.token;

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      return response;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Registration failed';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const logout = () => {
    user.value = null;
    token.value = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const fetchProfile = async () => {
    try {
      loading.value = true;
      const response = await authService.getProfile();
      user.value = response.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch profile';
      logout();
    } finally {
      loading.value = false;
    }
  };

  loadFromStorage();

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    fetchProfile,
  };
});

