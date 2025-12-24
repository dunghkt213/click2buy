import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "../ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger, } from "../ui/tabs";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";
export function AuthModal({ isOpen, onClose, defaultTab = "login", onLoginSuccess, onRegisterSuccess, }) {
    const [activeTab, setActiveTab] = useState(defaultTab);
    // Update active tab when defaultTab changes
    useEffect(() => {
        setActiveTab(defaultTab);
    }, [defaultTab]);
    return (_jsx(Dialog, { open: isOpen, onOpenChange: onClose, children: _jsx(DialogContent, { className: "max-w-5xl p-0 gap-0 overflow-hidden [&>button]:text-white [&>button]:hover:bg-white/20 [&>button]:z-10", children: _jsx("div", { className: "flex flex-col md:flex-row", children: _jsxs("div", { className: "flex-1 p-8 md:p-12", children: [_jsx(DialogTitle, { className: "sr-only", children: "X\u00E1c th\u1EF1c t\u00E0i kho\u1EA3n" }), _jsx(DialogDescription, { className: "sr-only", children: "\u0110\u0103ng nh\u1EADp ho\u1EB7c \u0111\u0103ng k\u00FD \u0111\u1EC3 ti\u1EBFp t\u1EE5c s\u1EED d\u1EE5ng Click2Buy" }), _jsxs(Tabs, { value: activeTab, onValueChange: (value) => setActiveTab(value), className: "w-full", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-2 mb-8", children: [_jsx(TabsTrigger, { value: "login", children: "\u0110\u0103ng nh\u1EADp" }), _jsx(TabsTrigger, { value: "register", children: "\u0110\u0103ng k\u00FD" })] }), _jsx(TabsContent, { value: "login", className: "mt-0", children: _jsx(LoginForm, { onSuccess: onLoginSuccess, onClose: onClose }) }), _jsx(TabsContent, { value: "register", className: "mt-0", children: _jsx(RegisterForm, { onSuccess: onRegisterSuccess, onClose: onClose, onSwitchToLogin: () => setActiveTab("login") }) })] })] }) }) }) }));
}
