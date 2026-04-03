import React, { createContext, useContext, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { getTranslations } from '../translations';

const LangContext = createContext(null);

const FALLBACK = getTranslations('no');

export function LangProvider({ children }) {
  const { user } = useAuth();
  const lang = user?.language ?? 'no';
  const t = useMemo(() => getTranslations(lang), [lang]);

  return (
    <LangContext.Provider value={{ lang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LangContext);
  // Always return a valid object — never crash
  if (!ctx) return { lang: 'no', t: FALLBACK };
  return ctx;
}