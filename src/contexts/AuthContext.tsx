import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user data on mount
    const storedUser = localStorage.getItem('bedtime_buddy_user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('bedtime_buddy_user');
      }
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Mock authentication - in a real app, this would call an API
      const storedUsers = JSON.parse(localStorage.getItem('bedtime_buddy_users') || '[]');
      const existingUser = storedUsers.find((u: { email: string; password: string; id: string; name?: string }) => u.email === email && u.password === password);
      
      if (existingUser) {
        const userData: User = {
          id: existingUser.id,
          email: existingUser.email,
          name: existingUser.name || email.split('@')[0],
          preferences: {
            language: 'en',
            theme: 'light',
            notifications: true
          }
        };
        
        setUser(userData);
        localStorage.setItem('bedtime_buddy_user', JSON.stringify(userData));
        return { success: true };
      } else {
        return { success: false, error: 'Invalid email or password' };
      }
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error: 'An error occurred during sign in' };
    }
  };

  const signUp = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Mock registration - in a real app, this would call an API
      const storedUsers = JSON.parse(localStorage.getItem('bedtime_buddy_users') || '[]');
      const existingUser = storedUsers.find((u: { email: string }) => u.email === email);
      
      if (existingUser) {
        return { success: false, error: 'Email already exists' };
      }
      
      const newUser = {
        id: Date.now().toString(),
        email,
        password,
        name: email.split('@')[0]
      };
      
      const updatedUsers = [...storedUsers, newUser];
      localStorage.setItem('bedtime_buddy_users', JSON.stringify(updatedUsers));
      
      const userData: User = {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        preferences: {
          language: 'en',
          theme: 'light',
          notifications: true
        }
      };
      
      setUser(userData);
      localStorage.setItem('bedtime_buddy_user', JSON.stringify(userData));
      return { success: true };
    } catch (error) {
      console.error('Sign up error:', error);
      return { success: false, error: 'An error occurred during sign up' };
    }
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('bedtime_buddy_user');
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};