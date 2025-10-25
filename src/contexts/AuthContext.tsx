import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

// ⚡ ADMIN WHITELIST - Thêm email admin vào đây
const ADMIN_EMAILS = [
  "nhatvupq205@gmail.com",
  // Thêm email admin khác ở đây nếu cần
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAdminStatus = (userEmail: string | undefined): boolean => {
    if (!userEmail) return false;
    return ADMIN_EMAILS.includes(userEmail);
  };

  const refreshAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUser(session.user);
        const adminStatus = checkAdminStatus(session.user.email);
        setIsAdmin(adminStatus);
      } else {
        setUser(null);
        setIsAdmin(false);
      }
    } catch (error) {
      console.error("Error refreshing auth:", error);
      setUser(null);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial session check
    refreshAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
        const adminStatus = checkAdminStatus(session.user.email);
        setIsAdmin(adminStatus);
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      // Set state immediately - don't wait for Supabase
      setUser(null);
      setIsAdmin(false);
      
      // Clear Supabase auth from localStorage
      const keysToRemove = Object.keys(localStorage).filter(key => 
        key.startsWith('sb-') || key.includes('supabase')
      );
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      // Fire signOut in background (don't await)
      supabase.auth.signOut().catch((error) => {
        console.error("Error signing out from Supabase:", error);
      });
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, signOut, refreshAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

