import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginRequest, RegisterRequest } from '../types';
import { usersService } from '../services/usersApi';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const initAuth = async () => {
      try {
        if (usersService.isAuthenticated()) {
          // Add timeout to prevent hanging
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Auth timeout')), 5000)
          );

          const currentUser = await Promise.race([
            usersService.getCurrentUser(),
            timeoutPromise
          ]) as any;

          setUser(currentUser);
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
        usersService.logout();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginRequest) => {
    const response = await usersService.login(credentials);
    const userData = await usersService.getUser(response.userId);
    setUser(userData);
  };

  const register = async (userData: RegisterRequest) => {
    await usersService.register(userData);
    // Auto-login after registration
    await login({ email: userData.email, password: userData.password });
  };

  const logout = () => {
    usersService.logout();
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-spotify-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-spotify-green text-6xl mb-4">🛍️</div>
          <h2 className="text-white text-2xl font-bold mb-2">Loading...</h2>
          <p className="text-spotify-text">Setting up your shopping experience</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};