import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdminDashboard from "@/components/AdminDashboard";
import { BookOpen } from "lucide-react";
import { toast } from "sonner";

const Admin = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Đã đăng xuất");
      navigate("/");
    } catch (error) {
      toast.error("Có lỗi khi đăng xuất");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-foreground font-crimson">
              Bảng Quản Trị
            </h1>
            <Button variant="outline" onClick={handleLogout}>
              Đăng Xuất
            </Button>
          </div>

          {/* Dashboard Statistics */}
          <div className="mb-8">
            <AdminDashboard />
          </div>

          {/* Management Card */}
          <div className="max-w-md mx-auto">
            <div 
              onClick={() => navigate("/admin/novels")}
              className="bg-card p-8 rounded-lg border border-border hover:shadow-md cursor-pointer transition-all"
            >
              <BookOpen className="h-12 w-12 text-secondary mb-4" />
              <h2 className="text-2xl font-semibold text-foreground mb-2">
                Quản Lý Truyện
              </h2>
              <p className="text-muted-foreground">
                Thêm, chỉnh sửa, xóa truyện và quản lý các chapter
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Admin;
