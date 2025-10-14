import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export type Theme = 'dark' | 'light' | 'system';

export function useTheme() {
  const { user, updateUserProfile } = useAuth();
  const [theme, setThemeState] = useState<Theme>(
    (user?.preferences?.theme as Theme) || 'dark'
  );

  // Update theme when user changes
  useEffect(() => {
    if (user?.preferences?.theme) {
      setThemeState(user.preferences.theme as Theme);
    }
  }, [user]);

  // Effect to apply theme to document
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove old theme classes
    root.classList.remove('light', 'dark');
    
    // Add new theme class
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  // Update theme function that also saves to user preferences
  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme);
    
    // Save to user preferences if logged in
    if (user) {
      await updateUserProfile({
        preferences: {
          ...user.preferences,
          theme: newTheme
        }
      });
    }
  };

  return { theme, setTheme };
}