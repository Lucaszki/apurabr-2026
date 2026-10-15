/**
 * @file ThemeSelector.tsx
 * @description Botão de alternância direta e intuitiva entre Tema Claro e Tema Escuro.
 */

import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export const ThemeSelector: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={isDark ? 'Alternar para Tema Claro' : 'Alternar para Tema Escuro'}
      aria-label={isDark ? 'Ativar tema claro' : 'Ativar tema escuro'}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-all text-xs font-semibold cursor-pointer shadow-2xs select-none"
    >
      {isDark ? (
        <>
          <Sun className="h-3.5 w-3.5 text-amber-400 animate-in spin-in-180 duration-200" />
          <span className="hidden sm:inline">Tema Claro</span>
        </>
      ) : (
        <>
          <Moon className="h-3.5 w-3.5 text-slate-600 animate-in spin-in-180 duration-200" />
          <span className="hidden sm:inline">Tema Escuro</span>
        </>
      )}
    </button>
  );
};
