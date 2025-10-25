import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { BookOpen } from "lucide-react";
import { z } from "zod";

const authSchema = z.object({
  email: z.string().trim().email({ message: "Email không hợp lệ" }),
  password: z.string().min(6, { message: "Mật khẩu phải có ít nhất 6 ký tự" }),
});

const Auth = () => {
  const navigate = useNavigate();
  const { user, refreshAuth } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate input
      authSchema.parse({ email, password });

      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        
        if (data.session) {
          toast.success("Đăng nhập thành công!");
          // Manually refresh auth state to ensure it updates immediately
          await refreshAuth();
          navigate("/", { replace: true });
        }
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}`,
          },
        });
        if (error) throw error;
        toast.success("Đăng ký thành công! Vui lòng kiểm tra email để xác nhận.");
        setIsLogin(true); // Switch to login tab
      }
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else if (error.message.includes("Invalid login credentials")) {
        toast.error("Email hoặc mật khẩu không đúng");
      } else if (error.message.includes("User already registered")) {
        toast.error("Email này đã được đăng ký");
      } else if (error.message.includes("Email not confirmed")) {
        toast.error("Vui lòng xác nhận email trước khi đăng nhập");
      } else {
        toast.error(error.message || "Có lỗi xảy ra");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-card to-background px-4">
      <Card className="w-full max-w-md p-8">
        <div className="flex items-center justify-center gap-2 mb-6">
          <BookOpen className="h-8 w-8 text-secondary" />
          <h1 className="text-2xl font-bold text-foreground font-crimson">
            Rảnh Thì Dịch
          </h1>
        </div>
        
        <h2 className="text-xl font-semibold text-center text-foreground mb-6">
          {isLogin ? "Đăng Nhập" : "Đăng Ký"}
        </h2>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div>
            <Label htmlFor="password">Mật khẩu</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Đang xử lý..." : isLogin ? "Đăng Nhập" : "Đăng Ký"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-4">
          {isLogin ? "Chưa có tài khoản? " : "Đã có tài khoản? "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-secondary hover:underline"
            disabled={loading}
          >
            {isLogin ? "Đăng ký" : "Đăng nhập"}
          </button>
        </p>
      </Card>
    </div>
  );
};

export default Auth;
