/**
 * @file ThemeContext.tsx
 * @description Gerenciamento de Tema Claro e Tema Escuro para as Eleições 2026.
 * Proporciona uma interface neutra, sem viés político, com alternância limpa entre modo claro e escuro.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeMode = 'claro' | 'escuro';

interface ThemeContextType {
  theme: ThemeMode;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'eleicao_2026_tema';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    try {
      const salvo = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
      if (salvo === 'claro' || salvo === 'escuro') {
        return salvo;
      }
      // Verifica preferência do sistema operacional caso não haja preferência salva
      if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'escuro';
      }
    } catch {
      // Ignore
    }
    return 'claro';
  });

  const setTheme = (novoTema: ThemeMode) => {
    setThemeState(novoTema);
    try {
      localStorage.setItem(STORAGE_KEY, novoTema);
    } catch {
      // Ignore
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'claro' ? 'escuro' : 'claro');
  };

  const isDark = theme === 'escuro';

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme, isDark]);

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme deve ser utilizado dentro de um ThemeProvider');
  }
  return context;
};
