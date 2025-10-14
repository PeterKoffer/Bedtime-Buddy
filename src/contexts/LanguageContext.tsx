import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'da';

interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}

const translations: Record<Language, Translations> = {
  en: {
    common: {
      loading: 'Loading...',
      save: 'Save',
      cancel: 'Cancel',
      next: 'Next',
      back: 'Back',
      finish: 'Finish',
      edit: 'Edit',
      delete: 'Delete',
      create: 'Create',
      close: 'Close'
    },
    auth: {
      login: 'Login',
      signup: 'Sign Up',
      logout: 'Logout',
      email: 'Email',
      password: 'Password',
      confirm_password: 'Confirm Password',
      signup_success: 'Account created successfully',
      email_exists: 'Email already exists'
    },
    story: {
      create_new: 'Create New Story',
      your_stories: 'Your Stories',
      character_creation: 'Create Character',
      theme_selection: 'Choose Theme',
      style_selection: 'Choose Style',
      keyword_selection: 'Add Keywords',
      generate_story: 'Generate Story',
      story_title: 'Story Title',
      no_stories: 'No stories yet'
    },
    navigation: {
      home: 'Home',
      library: 'Library',
      create: 'Create Story'
    }
  },
  da: {
    common: {
      loading: 'Indlæser...',
      save: 'Gem',
      cancel: 'Annuller',
      next: 'Næste',
      back: 'Tilbage',
      finish: 'Afslut',
      edit: 'Rediger',
      delete: 'Slet',
      create: 'Opret',
      close: 'Luk'
    },
    auth: {
      login: 'Log ind',
      signup: 'Tilmeld dig',
      logout: 'Log ud',
      email: 'E-mail',
      password: 'Adgangskode',
      confirm_password: 'Bekræft adgangskode',
      signup_success: 'Konto oprettet med succes',
      email_exists: 'E-mail eksisterer allerede'
    },
    story: {
      create_new: 'Opret ny historie',
      your_stories: 'Dine historier',
      character_creation: 'Opret karakter',
      theme_selection: 'Vælg tema',
      style_selection: 'Vælg stil',
      keyword_selection: 'Tilføj nøgleord',
      generate_story: 'Generer historie',
      story_title: 'Historietitel',
      no_stories: 'Ingen historier endnu'
    },
    navigation: {
      home: 'Hjem',
      library: 'Bibliotek',
      create: 'Opret historie'
    }
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (category: string, key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const storedLanguage = localStorage.getItem('bedtime_buddy_language') as Language;
    if (storedLanguage && (storedLanguage === 'en' || storedLanguage === 'da')) {
      setLanguage(storedLanguage);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('bedtime_buddy_language', lang);
  };

  const t = (category: string, key: string): string => {
    return translations[language]?.[category]?.[key] || key;
  };

  const value = {
    language,
    setLanguage: handleSetLanguage,
    t,
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};