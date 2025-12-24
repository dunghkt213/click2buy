import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import App from './App';
import { NotificationProvider } from './contexts/NotificationContext';
import { AppProvider } from './providers/AppProvider';
import './styles/globals.css';
import { cleanupExpiredCache } from './utils/cache';
// Cleanup expired cache khi app start
cleanupExpiredCache();
ReactDOM.createRoot(document.getElementById('root')).render(_jsx(React.StrictMode, { children: _jsx(BrowserRouter, { children: _jsx(AppProvider, { children: _jsxs(NotificationProvider, { children: [_jsx(App, {}), _jsx(Toaster, { position: "bottom-left", richColors: true })] }) }) }) }));
