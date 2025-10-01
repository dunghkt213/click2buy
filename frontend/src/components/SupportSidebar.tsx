import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  HelpCircle,
  MessageSquare,
  Phone,
  Mail,
  Clock,
  MapPin,
  Send,
  Search,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Users,
  BookOpen,
  Headphones,
  Shield,
  Truck,
  CreditCard,
  RotateCcw
} from 'lucide-react';
import { FAQItem, SupportTicket } from '../types';

interface SupportSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  faqs: FAQItem[];
  tickets: SupportTicket[];
  onSubmitTicket: (subject: string, message: string, category: string) => void;
}

export function SupportSidebar({
  isOpen,
  onClose,
  faqs,
  tickets,
  onSubmitTicket
}: SupportSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketCategory, setTicketCategory] = useState('general');

  const supportCategories = [
    { id: 'orders', name: 'Đơn hàng', icon: Truck },
    { id: 'payment', name: 'Thanh toán', icon: CreditCard },
    { id: 'returns', name: 'Đổi trả', icon: RotateCcw },
    { id: 'account', name: 'Tài khoản', icon: Users },
    { id: 'security', name: 'Bảo mật', icon: Shield },
    { id: 'general', name: 'Khác', icon: HelpCircle }
  ];

  const filteredFAQs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
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

  const getStatusText = (status: string) => {
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

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:w-[500px] flex flex-col p-0 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border bg-card">
          <SheetHeader>
            <SheetTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <Headphones className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2>Trợ giúp & Hỗ trợ</h2>
                  <SheetDescription>
                    Chúng tôi luôn sẵn sàng hỗ trợ bạn
                  </SheetDescription>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                Online
              </Badge>
            </SheetTitle>
          </SheetHeader>
        </div>

        {/* Contact Info Banner */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-b border-border">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-blue-600" />
              <div>
                <p className="font-medium">Hotline 24/7</p>
                <p className="text-muted-foreground">1900-1234</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-green-600" />
              <div>
                <p className="font-medium">Thời gian phản hồi</p>
                <p className="text-muted-foreground">&lt; 30 phút</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="faq" className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-3 mx-6 mt-4">
            <TabsTrigger value="faq">FAQ</TabsTrigger>
            <TabsTrigger value="contact">Liên hệ</TabsTrigger>
            <TabsTrigger value="tickets">Ticket</TabsTrigger>
          </TabsList>

          {/* FAQ Tab */}
          <TabsContent value="faq" className="flex-1 flex flex-col mt-4">
            <div className="px-6">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm câu hỏi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <ScrollArea className="flex-1 overflow-auto" style={{ maxHeight: 'calc(100vh - 300px)' }}>
              <div className="px-6">
                <div className="space-y-4 pb-4">
                  {/* Popular FAQs */}
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-blue-600" />
                      Câu hỏi phổ biến
                    </h3>
                    {filteredFAQs.filter(faq => faq.isPopular).map((faq) => (
                      <div 
                        key={faq.id} 
                        className="p-4 border border-border rounded-xl mb-3 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm mb-2">{faq.question}</h4>
                            <p className="text-sm text-muted-foreground">{faq.answer}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* All FAQs */}
                  <div>
                    <h3 className="font-semibold mb-3">Tất cả câu hỏi</h3>
                    {filteredFAQs.filter(faq => !faq.isPopular).map((faq) => (
                      <div 
                        key={faq.id} 
                        className="p-4 border border-border rounded-xl mb-3 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium text-sm">{faq.question}</h4>
                              <Badge variant="outline" className="text-xs">
                                {faq.category}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{faq.answer}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Contact Tab */}
          <TabsContent value="contact" className="flex-1 flex flex-col mt-4">
            <ScrollArea className="flex-1 overflow-auto" style={{ maxHeight: 'calc(100vh - 300px)' }}>
              <div className="px-6">
                <div className="space-y-6 pb-4">
                  {/* Quick Contact Methods */}
                  <div>
                    <h3 className="font-semibold mb-4">Liên hệ nhanh</h3>
                    <div className="grid gap-3">
                      <Button variant="outline" className="justify-start gap-3 h-auto p-4">
                        <Phone className="w-5 h-5 text-blue-600" />
                        <div className="text-left">
                          <p className="font-medium">Gọi điện trực tiếp</p>
                          <p className="text-sm text-muted-foreground">1900-1234 (24/7)</p>
                        </div>
                      </Button>
                      
                      <Button variant="outline" className="justify-start gap-3 h-auto p-4">
                        <MessageSquare className="w-5 h-5 text-green-600" />
                        <div className="text-left">
                          <p className="font-medium">Chat trực tuyến</p>
                          <p className="text-sm text-muted-foreground">Phản hồi trong 5 phút</p>
                        </div>
                      </Button>
                      
                      <Button variant="outline" className="justify-start gap-3 h-auto p-4">
                        <Mail className="w-5 h-5 text-purple-600" />
                        <div className="text-left">
                          <p className="font-medium">Gửi email</p>
                          <p className="text-sm text-muted-foreground">support@shopmart.vn</p>
                        </div>
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  {/* Contact Form */}
                  <div>
                    <h3 className="font-semibold mb-4">Gửi tin nhắn</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Danh mục</label>
                        <div className="grid grid-cols-2 gap-2">
                          {supportCategories.map((category) => {
                            const IconComponent = category.icon;
                            return (
                              <Button
                                key={category.id}
                                variant={ticketCategory === category.id ? "default" : "outline"}
                                size="sm"
                                className="justify-start gap-2"
                                onClick={() => setTicketCategory(category.id)}
                              >
                                <IconComponent className="w-4 h-4" />
                                {category.name}
                              </Button>
                            );
                          })}
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium mb-2 block">Tiêu đề</label>
                        <Input
                          placeholder="Mô tả ngắn gọn vấn đề của bạn"
                          value={ticketSubject}
                          onChange={(e) => setTicketSubject(e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium mb-2 block">Nội dung chi tiết</label>
                        <Textarea
                          placeholder="Mô tả chi tiết vấn đề để chúng tôi hỗ trợ bạn tốt nhất"
                          value={ticketMessage}
                          onChange={(e) => setTicketMessage(e.target.value)}
                          rows={4}
                        />
                      </div>
                      
                      <Button 
                        onClick={handleSubmitTicket}
                        disabled={!ticketSubject.trim() || !ticketMessage.trim()}
                        className="w-full gap-2"
                      >
                        <Send className="w-4 h-4" />
                        Gửi yêu cầu hỗ trợ
                      </Button>
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-red-600" />
                      Địa chỉ liên hệ
                    </h3>
                    <div className="p-4 bg-muted/50 rounded-xl">
                      <p className="font-medium">ShopMart Việt Nam</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        123 Nguyen Van A 144 Xuan Thuy<br />
                        Cầu Giấy, Hà Nội<br />
                        Email: support@shopmart.vn<br />
                        Hotline: 1900-1234
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Tickets Tab */}
          <TabsContent value="tickets" className="flex-1 flex flex-col mt-4">
            <div className="px-6 mb-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Ticket hỗ trợ của bạn</h3>
                <Badge variant="secondary">{tickets.length}</Badge>
              </div>
            </div>

            <ScrollArea className="flex-1 overflow-auto" style={{ maxHeight: 'calc(100vh - 350px)' }}>
              <div className="px-6">
                <div className="space-y-4 pb-4">
                  {tickets.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Bạn chưa có ticket hỗ trợ nào</p>
                    </div>
                  ) : (
                    tickets.map((ticket) => (
                      <div 
                        key={ticket.id} 
                        className="p-4 border border-border rounded-xl hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h4 className="font-medium text-sm">{ticket.subject}</h4>
                          <Badge className={getStatusColor(ticket.status)}>
                            {getStatusText(ticket.status)}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>#{ticket.id}</span>
                          <span>Cập nhật: {ticket.lastUpdate}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {ticket.priority === 'high' ? 'Cao' : 
                             ticket.priority === 'medium' ? 'Trung bình' : 'Thấp'}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {ticket.createdAt}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="bg-muted/30 border-t border-border p-6">
          <Button variant="outline" className="w-full" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}