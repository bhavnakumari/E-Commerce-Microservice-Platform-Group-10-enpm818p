import { usersApi } from './api';
import { User, RegisterRequest, LoginRequest, LoginResponse } from '../types';

export const usersService = {
  // Register a new user
  register: async (userData: RegisterRequest): Promise<User> => {
    const response = await usersApi.post<User>('/api/users/register', userData);
    return response.data;
  },

  // Login user
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await usersApi.post<LoginResponse>('/api/users/login', credentials);
    // Store token in localStorage
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('userId', response.data.userId.toString());
    }
    return response.data;
  },

  // Get user by ID
  getUser: async (userId: number): Promise<User> => {
    const response = await usersApi.get<User>(`/api/users/${userId}`);
    return response.data;
  },

  // Get current logged in user
  getCurrentUser: async (): Promise<User | null> => {
    const userId = localStorage.getItem('userId');
    if (!userId) return null;
    return usersService.getUser(parseInt(userId));
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
  },

  // Check if user is logged in
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('authToken');
  },
};