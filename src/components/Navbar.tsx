import { Link, useNavigate } from "react-router-dom";
import { BookOpen, User, LogOut, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Navbar = () => {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Đã đăng xuất thành công");
      navigate("/");
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("Có lỗi khi đăng xuất");
    }
  };

  return (
    <nav className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <BookOpen className="h-6 w-6 text-secondary" />
            <span className="text-xl font-semibold text-foreground">Rảnh Thì Dịch</span>
          </Link>
          
          <div className="flex items-center gap-6">
            <Link 
              to="/" 
              className="text-foreground hover:text-secondary transition-colors"
            >
              Trang Chủ
            </Link>
            <Link 
              to="/novels" 
              className="text-foreground hover:text-secondary transition-colors"
            >
              Truyện
            </Link>
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">Tài Khoản</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5 text-sm font-medium">
                    {user.email}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/bookmarks" className="cursor-pointer">
                      <Heart className="mr-2 h-4 w-4" />
                      Truyện Yêu Thích
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="cursor-pointer">
                          <User className="mr-2 h-4 w-4" />
                          Quản Trị
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <button 
                      onClick={handleSignOut}
                      className="w-full flex items-center cursor-pointer text-red-600"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Đăng Xuất
                    </button>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button size="sm" variant="default" className="gap-2">
                  <User className="h-4 w-4" />
                  Đăng Nhập
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
