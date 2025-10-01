import React from 'react';
import { Button } from '../ui/button.tsx';
import { Input } from '../ui/input.tsx';
import { Separator } from '../ui/separator.tsx';
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Youtube,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Truck,
  Shield,
  RotateCcw
} from 'lucide-react';

export function Footer() {
  const footerSections = [
    {
      title: 'Về TechStore',
      links: [
        'Giới thiệu',
        'Tuyển dụng',
        'Tin tức',
        'Hệ thống cửa hàng',
        'Liên hệ',
      ],
    },
    {
      title: 'Chính sách',
      links: [
        'Chính sách bảo hành',
        'Chính sách đổi trả',
        'Chính sách vận chuyển',
        'Chính sách bảo mật',
        'Điều khoản sử dụng',
      ],
    },
    {
      title: 'Hỗ trợ khách hàng',
      links: [
        'Hướng dẫn mua hàng',
        'Hướng dẫn thanh toán',
        'Câu hỏi thường gặp',
        'Bảo hành & sửa chữa',
        'Khiếu nại & góp ý',
      ],
    },
    {
      title: 'Danh mục sản phẩm',
      links: [
        'Thời trang',
        'Điện tử',
        'Nhà cửa',
        'Làm đẹp',
        'Thể thao',
      ],
    },
  ];

  const benefits = [
    {
      icon: Truck,
      title: 'Giao hàng toàn quốc',
      description: 'Miễn phí với đơn hàng trên 1 triệu',
    },
    {
      icon: Shield,
      title: 'Bảo hành chính hãng',
      description: 'Cam kết 100% hàng chính hãng',
    },
    {
      icon: RotateCcw,
      title: 'Đổi trả 15 ngày',
      description: 'Đổi trả miễn phí trong 15 ngày',
    },
    {
      icon: CreditCard,
      title: 'Thanh toán an toàn',
      description: 'Nhiều phương thức thanh toán',
    },
  ];

  return (
    <footer className="bg-card border-t border-border">
      {/* Benefits section */}
      <div className="border-b border-border">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <benefit.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{benefit.title}</h3>
                  <p className="text-muted-foreground text-xs">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main footer content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand section */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-primary-foreground rounded-sm"></div>
              </div>
              <span className="text-xl font-semibold">ShopMart</span>
            </div>
            
            <p className="text-muted-foreground text-sm leading-relaxed">
              Sàn thương mại điện tử hàng đầu Việt Nam với hơn 10 năm kinh nghiệm. 
              Cung cấp đa dạng sản phẩm chất lượng với giá cả cạnh tranh nhất.
            </p>

            {/* Contact info */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span>123 Nguyen Van A 144 Xuan Thuy</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>1900 1234</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span>support@shopmart.vn</span>
              </div>
            </div>

            {/* Social links */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="w-10 h-10 p-0">
                <Facebook className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" className="w-10 h-10 p-0">
                <Instagram className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" className="w-10 h-10 p-0">
                <Twitter className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" className="w-10 h-10 p-0">
                <Youtube className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Footer links */}
          {footerSections.map((section, index) => (
            <div key={index} className="space-y-4">
              <h3 className="font-semibold">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a
                      href="#"
                      className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter section */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="font-semibold mb-2">Đăng ký nhận tin khuyến mãi</h3>
              <p className="text-muted-foreground text-sm">
                Nhận thông tin về sản phẩm mới và các chương trình khuyến mãi hấp dẫn
              </p>
            </div>
            <div className="flex gap-2">
              <Input 
                placeholder="Nhập email của bạn..." 
                className="flex-1"
              />
              <Button>
                Đăng ký
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border bg-muted/30">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>© 2024 ShopMart. Tất cả quyền được bảo lưu.</span>
            </div>
            
            <div className="flex items-center gap-4">
              <span>Phương thức thanh toán:</span>
              <div className="flex items-center gap-2">
                {['VISA', 'MasterCard', 'Momo', 'ZaloPay'].map((method) => (
                  <div
                    key={method}
                    className="px-2 py-1 bg-card border border-border rounded text-xs"
                  >
                    {method}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}