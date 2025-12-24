import { jsx as _jsx } from "react/jsx-runtime";
/**
 * AppProvider - Provider to manage all app state and logic
 * Wraps the entire app to provide context
 */
import { createContext, useContext } from 'react';
import { useApp } from '../hooks/useApp';
const AppContext = createContext(null);
export function useAppContext() {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within AppProvider');
    }
    return context;
}
export function AppProvider({ children }) {
    const app = useApp();
    return (_jsx(AppContext.Provider, { value: app, children: children }));
}
