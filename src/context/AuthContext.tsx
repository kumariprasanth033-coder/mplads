import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, Role } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: UserProfile | null;
  role: Role;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginAsRole: (role: Role) => Promise<void>;
  loginAsGuest: () => void;
  logout: () => void;
  switchDemoRole: (role: Role) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'mplads_portal_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const loginAsRole = async (targetRole: Role) => {
    setIsLoading(true);
    try {
      if (targetRole === 'GUEST') {
        loginAsGuest();
        return;
      }
      const loggedUser = await api.login({ role: targetRole });
      setUser(loggedUser);
    } catch (err) {
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsGuest = () => {
    const guestUser: UserProfile = {
      uid: 'guest-public',
      name: 'Citizen Guest',
      email: 'guest@public.gov.in',
      role: 'GUEST',
      designation: 'Public Citizen Visitor',
      status: 'active',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      isDemo: true,
    };
    setUser(guestUser);
  };

  const logout = () => {
    setUser(null);
  };

  const switchDemoRole = async (newRole: Role) => {
    await loginAsRole(newRole);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user ? user.role : 'GUEST',
        isAuthenticated: Boolean(user && user.role !== 'GUEST'),
        isLoading,
        loginAsRole,
        loginAsGuest,
        logout,
        switchDemoRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
