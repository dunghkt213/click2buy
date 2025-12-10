/**
 * AppProvider - Provider to manage all app state and logic
 * Wraps the entire app to provide context
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { useApp } from '../hooks/useApp';

interface AppContextType {
  // Return type from useApp hook
  [key: string]: any;
}

const AppContext = createContext<AppContextType | null>(null);

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
}

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const app = useApp();

  return (
    <AppContext.Provider value={app}>
      {children}
    </AppContext.Provider>
  );
}

