import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "../ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../ui/tabs";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";
import { AuthSuccessPayload } from "../../apis/auth";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "login" | "register";
  onLoginSuccess: (payload: AuthSuccessPayload) => void;
  onRegisterSuccess: (payload: AuthSuccessPayload) => void;
}

export function AuthModal({
  isOpen,
  onClose,
  defaultTab = "login",
  onLoginSuccess,
  onRegisterSuccess,
}: AuthModalProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  // Update active tab when defaultTab changes
  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl p-0 gap-0 overflow-hidden [&>button]:text-white [&>button]:hover:bg-white/20 [&>button]:z-10">
        <div className="flex flex-col md:flex-row">
          {/* Left side - Image/Brand */}

          {/* Right side - Form */}
          <div className="flex-1 p-8 md:p-12">
            <DialogTitle className="sr-only">Xác thực tài khoản</DialogTitle>
            <DialogDescription className="sr-only">
              Đăng nhập hoặc đăng ký để tiếp tục sử dụng Click2Buy
            </DialogDescription>
            <Tabs
              value={activeTab}
              onValueChange={(value) =>
                setActiveTab(value as "login" | "register")
              }
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="login">
                  Đăng nhập
                </TabsTrigger>
                <TabsTrigger value="register">
                  Đăng ký
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="mt-0">
                <LoginForm
                  onSuccess={onLoginSuccess}
                  onClose={onClose}
                />
              </TabsContent>

              <TabsContent value="register" className="mt-0">
                <RegisterForm
                  onSuccess={onRegisterSuccess}
                  onClose={onClose}
                  onSwitchToLogin={() => setActiveTab("login")}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}