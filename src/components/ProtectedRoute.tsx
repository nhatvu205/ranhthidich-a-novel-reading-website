import { ReactNode, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
  redirectTo?: string;
}

/**
 * Component bảo vệ routes
 * - Yêu cầu authentication
 * - Có thể yêu cầu admin role
 * - Tự động redirect nếu không có quyền
 */
export const ProtectedRoute = ({ 
  children, 
  requireAdmin = false,
  redirectTo = "/auth" 
}: ProtectedRouteProps) => {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const hasShownToast = useRef(false);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      if (!hasShownToast.current) {
        toast.error("Vui lòng đăng nhập để tiếp tục");
        hasShownToast.current = true;
      }
      navigate(redirectTo, { replace: true });
      return;
    }

    if (requireAdmin && !isAdmin) {
      if (!hasShownToast.current) {
        toast.error("Bạn không có quyền truy cập trang này");
        hasShownToast.current = true;
      }
      navigate("/", { replace: true });
      return;
    }
    
    // Reset toast flag when authorized
    hasShownToast.current = false;
  }, [user, isAdmin, loading, navigate, requireAdmin, redirectTo]);

  // Show loading state only on initial load
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authorized
  if (!user || (requireAdmin && !isAdmin)) {
    return null;
  }

  return <>{children}</>;
};

