import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { handleSupabaseError, validateRequired } from "@/lib/errorHandler";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Plus, Edit, Trash, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface Novel {
  id: string;
  title: string;
  description: string | null;
  cover_image: string | null;
  genre: string | null;
  status: string | null;
}

const AdminNovels = () => {
  const navigate = useNavigate();
  const [novels, setNovels] = useState<Novel[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNovel, setEditingNovel] = useState<Novel | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    cover_image: "",
    genre: "",
    status: "ongoing",
  });

  useEffect(() => {
    fetchNovels();
  }, []);

  const fetchNovels = async () => {
    try {
      const { data, error } = await supabase
        .from("novels")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Fetch novels error:", error);
        throw error;
      }
      setNovels(data || []);
    } catch (error: any) {
      console.error("Fetch novels error:", error);
      toast.error("Không thể tải danh sách truyện: " + (error.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    if (!validateRequired({ title: formData.title })) {
      return;
    }
    
    setLoading(true);

    try {
      console.log("Submitting novel:", formData);
      
      if (editingNovel) {
        const { data, error } = await supabase
          .from("novels")
          .update(formData)
          .eq("id", editingNovel.id)
          .select();

        console.log("Update result:", { data, error });
        
        if (error) {
          console.error("Update error:", error);
          throw error;
        }
        toast.success("Cập nhật truyện thành công!");
      } else {
        const { data, error } = await supabase
          .from("novels")
          .insert([formData])
          .select();

        console.log("Insert result:", { data, error });
        
        if (error) {
          console.error("Insert error:", error);
          throw error;
        }
        toast.success("Thêm truyện mới thành công!");
      }

      // Close dialog and reset form BEFORE fetching
      setIsDialogOpen(false);
      resetForm();
      setLoading(false);
      
      // Fetch novels to update list
      fetchNovels();
    } catch (error: any) {
      console.error("Submit novel error:", error);
      handleSupabaseError(error, "submit novel");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa truyện này?")) return;

    try {
      const { error } = await supabase
        .from("novels")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Đã xóa truyện");
      fetchNovels();
    } catch (error: any) {
      toast.error("Không thể xóa truyện");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      cover_image: "",
      genre: "",
      status: "ongoing",
    });
    setEditingNovel(null);
  };

  const openEditDialog = (novel: Novel) => {
    setEditingNovel(novel);
    setFormData({
      title: novel.title,
      description: novel.description || "",
      cover_image: novel.cover_image || "",
      genre: novel.genre || "",
      status: novel.status || "ongoing",
    });
    setIsDialogOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <Button
            variant="ghost"
            onClick={() => navigate("/admin")}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Về trang quản trị
          </Button>

          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-foreground font-crimson">
              Quản Lý Truyện
            </h1>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="mr-2 h-4 w-4" />
                  Thêm Truyện Mới
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingNovel ? "Chỉnh Sửa Truyện" : "Thêm Truyện Mới"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="title">Tên Truyện *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Mô Tả</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      rows={4}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cover_image">URL Ảnh Bìa</Label>
                    <Input
                      id="cover_image"
                      value={formData.cover_image}
                      onChange={(e) =>
                        setFormData({ ...formData, cover_image: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="genre">Thể Loại</Label>
                    <Input
                      id="genre"
                      value={formData.genre}
                      onChange={(e) =>
                        setFormData({ ...formData, genre: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="status">Trạng Thái</Label>
                    <Input
                      id="status"
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
                      }
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Đang xử lý..." : editingNovel ? "Cập Nhật" : "Thêm Truyện"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {loading && novels.length === 0 ? (
            <p className="text-center text-muted-foreground">Đang tải...</p>
          ) : novels.length === 0 ? (
            <p className="text-center text-muted-foreground">Chưa có truyện nào</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {novels.map((novel) => (
                <Card key={novel.id} className="p-4">
                  {novel.cover_image && (
                    <img
                      src={novel.cover_image}
                      alt={novel.title}
                      className="w-full h-48 object-cover rounded mb-4"
                    />
                  )}
                  <h3 className="font-semibold text-lg mb-2 text-foreground">
                    {novel.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {novel.description}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/admin/novels/${novel.id}/chapters`)}
                      className="flex-1"
                    >
                      Xem Chapters
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(novel)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(novel.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AdminNovels;
