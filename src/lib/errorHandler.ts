import { toast } from "sonner";
import { PostgrestError } from "@supabase/supabase-js";

/**
 * Error handler cho Supabase errors
 */
export const handleSupabaseError = (error: PostgrestError | Error | unknown, context?: string) => {
  console.error(`Error${context ? ` in ${context}` : ''}:`, error);
  
  if (error && typeof error === 'object' && 'code' in error) {
    const pgError = error as PostgrestError;
    
    // Handle specific error codes
    switch (pgError.code) {
      case 'PGRST116':
        // Not found - this is often OK
        return;
      
      case '23505':
        toast.error("Dữ liệu đã tồn tại");
        break;
      
      case '23503':
        toast.error("Không thể xóa do có dữ liệu liên quan");
        break;
      
      case '42501':
        toast.error("Bạn không có quyền thực hiện hành động này");
        break;
      
      case 'PGRST301':
        toast.error("Không tìm thấy dữ liệu");
        break;
        
      default:
        toast.error(pgError.message || "Có lỗi xảy ra với cơ sở dữ liệu");
    }
  } else if (error instanceof Error) {
    // Handle auth errors
    if (error.message.includes("Invalid login credentials")) {
      toast.error("Email hoặc mật khẩu không đúng");
    } else if (error.message.includes("User already registered")) {
      toast.error("Email này đã được đăng ký");
    } else if (error.message.includes("Email not confirmed")) {
      toast.error("Vui lòng xác nhận email trước khi đăng nhập");
    } else {
      toast.error(error.message || "Có lỗi xảy ra");
    }
  } else {
    toast.error("Có lỗi không xác định xảy ra");
  }
};

/**
 * Wrapper cho async operations với error handling
 */
export const withErrorHandling = async <T>(
  operation: () => Promise<T>,
  context?: string,
  onError?: (error: unknown) => void
): Promise<T | null> => {
  try {
    return await operation();
  } catch (error) {
    handleSupabaseError(error, context);
    onError?.(error);
    return null;
  }
};

/**
 * Validate required fields
 */
export const validateRequired = (fields: Record<string, any>): boolean => {
  const emptyFields = Object.entries(fields)
    .filter(([_, value]) => !value || (typeof value === 'string' && value.trim() === ''))
    .map(([key]) => key);
  
  if (emptyFields.length > 0) {
    toast.error(`Vui lòng điền đầy đủ thông tin: ${emptyFields.join(', ')}`);
    return false;
  }
  
  return true;
};

/**
 * Safe JSON parse
 */
export const safeJsonParse = <T>(json: string, fallback: T): T => {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
};

