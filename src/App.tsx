import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Novels from "./pages/Novels";
import NovelDetail from "./pages/NovelDetail";
import ChapterReader from "./pages/ChapterReader";
import Auth from "./pages/Auth";
import Bookmarks from "./pages/Bookmarks";
import Admin from "./pages/Admin";
import AdminNovels from "./pages/AdminNovels";
import AdminChapters from "./pages/AdminChapters";
import NotFound from "./pages/NotFound";

const App = () => (
  <TooltipProvider>
    <Toaster />
    <Sonner />
    <Routes>
      {/* Public Routes - Anyone can access */}
      <Route path="/" element={<Index />} />
      <Route path="/novels" element={<Novels />} />
      <Route path="/novel/:id" element={<NovelDetail />} />
      <Route path="/novel/:novelId/chapter/:chapterId" element={<ChapterReader />} />
      <Route path="/auth" element={<Auth />} />
      
      {/* Protected User Routes - Require login */}
      <Route 
        path="/bookmarks" 
        element={
          <ProtectedRoute>
            <Bookmarks />
          </ProtectedRoute>
        } 
      />
      
      {/* Protected Admin Routes - Require admin role */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute requireAdmin>
            <Admin />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/novels" 
        element={
          <ProtectedRoute requireAdmin>
            <AdminNovels />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/novels/:novelId/chapters" 
        element={
          <ProtectedRoute requireAdmin>
            <AdminChapters />
          </ProtectedRoute>
        } 
      />
      
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  </TooltipProvider>
);

export default App;
