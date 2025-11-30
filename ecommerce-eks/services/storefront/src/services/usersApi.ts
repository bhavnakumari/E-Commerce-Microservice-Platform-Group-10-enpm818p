// services/storefront/src/services/userApi.ts
import axios from 'axios';
import { API_URLS } from './api';
import { User, RegisterRequest, LoginRequest, LoginResponse } from '../types';

export const usersApi = axios.create({
  baseURL: API_URLS.USERS, // "/api/users"
});

export function loginUser(data: LoginRequest) {
  return usersApi.post('/login', data);
}

export function registerUser(data: RegisterRequest) {
  return usersApi.post('/register', data);
}

export const usersService = {
  register: async (userData: RegisterRequest): Promise<User> => {
    const response = await usersApi.post<User>('/register', userData);
    return response.data;
  },

  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await usersApi.post<LoginResponse>('/login', credentials);
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
    }
    return response.data;
  },

  getUser: async (userId: number): Promise<User> => {
    const response = await usersApi.get<User>(`/${userId}`); // ✅
    return response.data;
  },

  getCurrentUser: async (): Promise<User | null> => {
    const userId = localStorage.getItem('userId');
    if (!userId) return null;
    return usersService.getUser(parseInt(userId));
  },

  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('authToken');
  },
};