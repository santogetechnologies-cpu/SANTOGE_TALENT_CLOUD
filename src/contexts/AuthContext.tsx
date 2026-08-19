import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Role, Permission, DataScope } from '../types/auth';
import { authService } from '../services/authService';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  role: Role;
  dataScope: DataScope;
  permissions: Permission[];
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<User | null>;
  signUp: (email: string, password: string, fullName?: string, role?: Role, dataScope?: DataScope) => Promise<User | null>;
  logout: () => Promise<void>;
  changePassword: (newPassword: string) => Promise<boolean>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      const current = await authService.getCurrentUser();
      setUser(current);
    } catch (err) {
      console.error('refreshUser error:', err);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();

    // Listen to Supabase auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const profile = await authService.getCurrentUser();
        setUser(profile);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const login = async (email: string, password?: string) => {
    setIsLoading(true);
    try {
      const loggedUser = await authService.login(email, password);
      setUser(loggedUser);
      return loggedUser;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName?: string, role?: Role, dataScope?: DataScope) => {
    setIsLoading(true);
    try {
      const loggedUser = await authService.signUp(email, password, fullName, role, dataScope);
      setUser(loggedUser);
      return loggedUser;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async (newPassword: string) => {
    if (!user) return false;
    const ok = await authService.updatePassword(newPassword);
    if (ok) {
      setUser({ ...user, firstLogin: false });
    }
    return ok;
  };

  const role = user?.role || 'STUDENT';
  const dataScope = user?.dataScope || { scopeType: 'SELF' };
  const permissions = user?.permissions || [];
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        dataScope,
        permissions,
        isAuthenticated,
        isLoading,
        login,
        signUp,
        logout,
        changePassword,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
