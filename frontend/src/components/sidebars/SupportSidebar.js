import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from 'framer-motion';
import { BookOpen, ChevronRight, Clock, CreditCard, Headphones, HelpCircle, Mail, MapPin, MessageSquare, Phone, RotateCcw, Search, Send, Shield, Truck, Users } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '../ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Textarea } from '../ui/textarea';
export function SupportSidebar({ isOpen, onClose, faqs, tickets, onSubmitTicket }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [ticketSubject, setTicketSubject] = useState('');
    const [ticketMessage, setTicketMessage] = useState('');
    const [ticketCategory, setTicketCategory] = useState('general');
    const motionEase = [0.4, 0, 0.2, 1];
    const containerVariants = {
        hidden: { opacity: 0, y: 16 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: motionEase } }
    };
    const listVariants = {
        hidden: {},
        visible: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } }
    };
    const itemVariants = {
        hidden: { opacity: 0, y: 12 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: motionEase } }
    };
    const supportCategories = [
        { id: 'orders', name: 'Đơn hàng', icon: Truck },
        { id: 'payment', name: 'Thanh toán', icon: CreditCard },
        { id: 'returns', name: 'Đổi trả', icon: RotateCcw },
        { id: 'account', name: 'Tài khoản', icon: Users },
        { id: 'security', name: 'Bảo mật', icon: Shield },
        { id: 'general', name: 'Khác', icon: HelpCircle }
    ];
    const filteredFAQs = faqs.filter(faq => faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase()));
    const getStatusColor = (status) => {
        switch (status) {
            case 'open':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case 'in-progress':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'resolved':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'closed':
                return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };
    const getStatusText = (status) => {
        switch (status) {
            case 'open':
                return 'Đang mở';
            case 'in-progress':
                return 'Đang xử lý';
            case 'resolved':
                return 'Đã giải quyết';
            case 'closed':
                return 'Đã đóng';
            default:
                return status;
        }
    };
    const handleSubmitTicket = () => {
        if (ticketSubject.trim() && ticketMessage.trim()) {
            onSubmitTicket(ticketSubject, ticketMessage, ticketCategory);
            setTicketSubject('');
            setTicketMessage('');
            setTicketCategory('general');
        }
    };
    return (_jsx(Sheet, { open: isOpen, onOpenChange: onClose, children: _jsx(SheetContent, { className: "w-full sm:w-[500px] flex flex-col p-0 overflow-hidden", children: _jsxs(motion.div, { className: "flex flex-col h-full", variants: containerVariants, initial: "hidden", animate: "visible", children: [_jsx("div", { className: "px-6 py-4 border-b border-border bg-card", children: _jsx(SheetHeader, { children: _jsxs(SheetTitle, { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center", children: _jsx(Headphones, { className: "w-5 h-5 text-white" }) }), _jsxs("div", { children: [_jsx("h2", { children: "Tr\u1EE3 gi\u00FAp & H\u1ED7 tr\u1EE3" }), _jsx(SheetDescription, { children: "Ch\u00FAng t\u00F4i lu\u00F4n s\u1EB5n s\u00E0ng h\u1ED7 tr\u1EE3 b\u1EA1n" })] })] }), _jsx(Badge, { className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200", children: "Online" })] }) }) }), _jsx(motion.div, { className: "px-6 py-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-b border-border", initial: { opacity: 0 }, animate: { opacity: 1, transition: { duration: 0.4, delay: 0.05 } }, children: _jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Phone, { className: "w-4 h-4 text-blue-600" }), _jsxs("div", { children: [_jsx("p", { className: "font-medium", children: "Hotline 24/7" }), _jsx("p", { className: "text-muted-foreground", children: "1900-1234" })] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Clock, { className: "w-4 h-4 text-green-600" }), _jsxs("div", { children: [_jsx("p", { className: "font-medium", children: "Th\u1EDDi gian ph\u1EA3n h\u1ED3i" }), _jsx("p", { className: "text-muted-foreground", children: "< 30 ph\u00FAt" })] })] })] }) }), _jsxs(Tabs, { defaultValue: "faq", className: "flex-1 flex flex-col", children: [_jsx(motion.div, { className: "grid w-full grid-cols-3 mx-6 mt-4", initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: motionEase } }, children: _jsxs(TabsList, { className: "grid w-full grid-cols-3", children: [_jsx(TabsTrigger, { value: "faq", children: "FAQ" }), _jsx(TabsTrigger, { value: "contact", children: "Li\u00EAn h\u1EC7" }), _jsx(TabsTrigger, { value: "tickets", children: "Ticket" })] }) }), _jsxs(TabsContent, { value: "faq", className: "flex-1 flex flex-col mt-4", children: [_jsx("div", { className: "px-6", children: _jsxs("div", { className: "relative mb-4", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" }), _jsx(Input, { placeholder: "T\u00ECm ki\u1EBFm c\u00E2u h\u1ECFi...", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), className: "pl-10" })] }) }), _jsx(ScrollArea, { className: "flex-1 overflow-auto", style: { maxHeight: 'calc(100vh - 300px)' }, children: _jsx("div", { className: "px-6", children: _jsxs("div", { className: "space-y-4 pb-4", children: [_jsxs("div", { children: [_jsxs("h3", { className: "font-semibold mb-3 flex items-center gap-2", children: [_jsx(BookOpen, { className: "w-4 h-4 text-blue-600" }), "C\u00E2u h\u1ECFi ph\u1ED5 bi\u1EBFn"] }), _jsx(motion.div, { variants: listVariants, initial: "hidden", animate: "visible", children: filteredFAQs.filter(faq => faq.isPopular).map((faq) => (_jsx(motion.div, { variants: itemVariants, className: "p-4 border border-border rounded-xl mb-3 hover:bg-muted/50 transition-colors", children: _jsxs("div", { className: "flex items-start justify-between gap-2", children: [_jsxs("div", { className: "flex-1", children: [_jsx("h4", { className: "font-medium text-sm mb-2", children: faq.question }), _jsx("p", { className: "text-sm text-muted-foreground", children: faq.answer })] }), _jsx(ChevronRight, { className: "w-4 h-4 text-muted-foreground flex-shrink-0" })] }) }, faq.id))) })] }), _jsx(Separator, {}), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold mb-3", children: "T\u1EA5t c\u1EA3 c\u00E2u h\u1ECFi" }), _jsx(motion.div, { variants: listVariants, initial: "hidden", animate: "visible", children: filteredFAQs.filter(faq => !faq.isPopular).map((faq) => (_jsx(motion.div, { variants: itemVariants, className: "p-4 border border-border rounded-xl mb-3 hover:bg-muted/50 transition-colors", children: _jsxs("div", { className: "flex items-start justify-between gap-2", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx("h4", { className: "font-medium text-sm", children: faq.question }), _jsx(Badge, { variant: "outline", className: "text-xs", children: faq.category })] }), _jsx("p", { className: "text-sm text-muted-foreground", children: faq.answer })] }), _jsx(ChevronRight, { className: "w-4 h-4 text-muted-foreground flex-shrink-0" })] }) }, faq.id))) })] })] }) }) })] }), _jsx(TabsContent, { value: "contact", className: "flex-1 flex flex-col mt-4", children: _jsx(ScrollArea, { className: "flex-1 overflow-auto", style: { maxHeight: 'calc(100vh - 300px)' }, children: _jsx("div", { className: "px-6", children: _jsxs("div", { className: "space-y-6 pb-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-semibold mb-4", children: "Li\u00EAn h\u1EC7 nhanh" }), _jsxs(motion.div, { className: "grid gap-3", variants: listVariants, initial: "hidden", animate: "visible", children: [_jsx(motion.div, { variants: itemVariants, children: _jsxs(Button, { variant: "outline", className: "justify-start gap-3 h-auto p-4", children: [_jsx(Phone, { className: "w-5 h-5 text-blue-600" }), _jsxs("div", { className: "text-left", children: [_jsx("p", { className: "font-medium", children: "G\u1ECDi \u0111i\u1EC7n tr\u1EF1c ti\u1EBFp" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "1900-1234 (24/7)" })] })] }) }), _jsx(motion.div, { variants: itemVariants, children: _jsxs(Button, { variant: "outline", className: "justify-start gap-3 h-auto p-4", children: [_jsx(MessageSquare, { className: "w-5 h-5 text-green-600" }), _jsxs("div", { className: "text-left", children: [_jsx("p", { className: "font-medium", children: "Chat tr\u1EF1c tuy\u1EBFn" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Ph\u1EA3n h\u1ED3i trong 5 ph\u00FAt" })] })] }) }), _jsx(motion.div, { variants: itemVariants, children: _jsxs(Button, { variant: "outline", className: "justify-start gap-3 h-auto p-4", children: [_jsx(Mail, { className: "w-5 h-5 text-purple-600" }), _jsxs("div", { className: "text-left", children: [_jsx("p", { className: "font-medium", children: "G\u1EEDi email" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "support@click2buy.vn" })] })] }) })] })] }), _jsx(Separator, {}), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold mb-4", children: "G\u1EEDi tin nh\u1EAFn" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium mb-2 block", children: "Danh m\u1EE5c" }), _jsx(motion.div, { className: "grid grid-cols-2 gap-2", variants: listVariants, initial: "hidden", animate: "visible", children: supportCategories.map((category) => {
                                                                                const IconComponent = category.icon;
                                                                                return (_jsx(motion.div, { variants: itemVariants, children: _jsxs(Button, { variant: ticketCategory === category.id ? "default" : "outline", size: "sm", className: "justify-start gap-2", onClick: () => setTicketCategory(category.id), children: [_jsx(IconComponent, { className: "w-4 h-4" }), category.name] }) }, category.id));
                                                                            }) })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium mb-2 block", children: "Ti\u00EAu \u0111\u1EC1" }), _jsx(Input, { placeholder: "M\u00F4 t\u1EA3 ng\u1EAFn g\u1ECDn v\u1EA5n \u0111\u1EC1 c\u1EE7a b\u1EA1n", value: ticketSubject, onChange: (e) => setTicketSubject(e.target.value) })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium mb-2 block", children: "N\u1ED9i dung chi ti\u1EBFt" }), _jsx(Textarea, { placeholder: "M\u00F4 t\u1EA3 chi ti\u1EBFt v\u1EA5n \u0111\u1EC1 \u0111\u1EC3 ch\u00FAng t\u00F4i h\u1ED7 tr\u1EE3 b\u1EA1n t\u1ED1t nh\u1EA5t", value: ticketMessage, onChange: (e) => setTicketMessage(e.target.value), rows: 4 })] }), _jsxs(Button, { onClick: handleSubmitTicket, disabled: !ticketSubject.trim() || !ticketMessage.trim(), className: "w-full gap-2", children: [_jsx(Send, { className: "w-4 h-4" }), "G\u1EEDi y\u00EAu c\u1EA7u h\u1ED7 tr\u1EE3"] })] })] }), _jsxs("div", { children: [_jsxs("h3", { className: "font-semibold mb-4 flex items-center gap-2", children: [_jsx(MapPin, { className: "w-4 h-4 text-red-600" }), "\u0110\u1ECBa ch\u1EC9 li\u00EAn h\u1EC7"] }), _jsxs("div", { className: "p-4 bg-muted/50 rounded-xl", children: [_jsx("p", { className: "font-medium", children: "Click2buy Vi\u1EC7t Nam" }), _jsxs("p", { className: "text-sm text-muted-foreground mt-1", children: ["123 Nguyen Van A 144 Xuan Thuy", _jsx("br", {}), "C\u1EA7u Gi\u1EA5y, H\u00E0 N\u1ED9i", _jsx("br", {}), "Email: support@click2buy.vn", _jsx("br", {}), "Hotline: 1900-1234"] })] })] })] }) }) }) }), _jsxs(TabsContent, { value: "tickets", className: "flex-1 flex flex-col mt-4", children: [_jsx("div", { className: "px-6 mb-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h3", { className: "font-semibold", children: "Ticket h\u1ED7 tr\u1EE3 c\u1EE7a b\u1EA1n" }), _jsx(Badge, { variant: "secondary", children: tickets.length })] }) }), _jsx(ScrollArea, { className: "flex-1 overflow-auto", style: { maxHeight: 'calc(100vh - 350px)' }, children: _jsx("div", { className: "px-6", children: _jsx("div", { className: "space-y-4 pb-4", children: tickets.length === 0 ? (_jsxs(motion.div, { className: "text-center py-8", initial: { opacity: 0 }, animate: { opacity: 1, transition: { duration: 0.3 } }, children: [_jsx(MessageSquare, { className: "w-12 h-12 text-muted-foreground mx-auto mb-4" }), _jsx("p", { className: "text-muted-foreground", children: "B\u1EA1n ch\u01B0a c\u00F3 ticket h\u1ED7 tr\u1EE3 n\u00E0o" })] })) : (_jsx(motion.div, { variants: listVariants, initial: "hidden", animate: "visible", children: tickets.map((ticket) => (_jsxs(motion.div, { variants: itemVariants, className: "p-4 border border-border rounded-xl hover:bg-muted/50 transition-colors", children: [_jsxs("div", { className: "flex items-start justify-between gap-2 mb-2", children: [_jsx("h4", { className: "font-medium text-sm", children: ticket.subject }), _jsx(Badge, { className: getStatusColor(ticket.status), children: getStatusText(ticket.status) })] }), _jsxs("div", { className: "flex items-center justify-between text-xs text-muted-foreground", children: [_jsxs("span", { children: ["#", ticket.id] }), _jsxs("span", { children: ["C\u1EADp nh\u1EADt: ", ticket.lastUpdate] })] }), _jsxs("div", { className: "flex items-center gap-2 mt-2", children: [_jsx(Badge, { variant: "outline", className: "text-xs", children: ticket.priority === 'high' ? 'Cao' :
                                                                            ticket.priority === 'medium' ? 'Trung bình' : 'Thấp' }), _jsx("span", { className: "text-xs text-muted-foreground", children: ticket.createdAt })] })] }, ticket.id))) })) }) }) })] })] }), _jsx(motion.div, { className: "bg-muted/30 border-t border-border p-6", initial: { opacity: 0 }, animate: { opacity: 1, transition: { duration: 0.3 } }, children: _jsx(Button, { variant: "outline", className: "w-full", onClick: onClose, children: "\u0110\u00F3ng" }) })] }) }) }));
}
