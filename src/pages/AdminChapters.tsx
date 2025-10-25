import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

interface Chapter {
  id: string;
  chapter_number: number;
  title: string;
  content: string;
  published_date: string;
}

const AdminChapters = () => {
  const { novelId } = useParams();
  const navigate = useNavigate();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [novelTitle, setNovelTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [formData, setFormData] = useState({
    chapter_number: "",
    title: "",
    content: "",
  });

  useEffect(() => {
    fetchNovelTitle();
    fetchChapters();
  }, [novelId]);

  const fetchNovelTitle = async () => {
    try {
      const { data, error } = await supabase
        .from("novels")
        .select("title")
        .eq("id", novelId)
        .single();

      if (error) throw error;
      setNovelTitle(data.title);
    } catch (error) {
      toast.error("Không thể tải thông tin truyện");
    }
  };

  const fetchChapters = async () => {
    try {
      const { data, error } = await supabase
        .from("chapters")
        .select("*")
        .eq("novel_id", novelId)
        .order("chapter_number", { ascending: true });

      if (error) throw error;
      setChapters(data || []);
    } catch (error: any) {
      toast.error("Không thể tải danh sách chapter");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    if (!validateRequired({ 
      chapter_number: formData.chapter_number,
      title: formData.title,
      content: formData.content 
    })) {
      return;
    }
    
    setLoading(true);

    try {
      const chapterData = {
        novel_id: novelId,
        chapter_number: parseInt(formData.chapter_number),
        title: formData.title,
        content: formData.content,
      };

      if (editingChapter) {
        const { error } = await supabase
          .from("chapters")
          .update(chapterData)
          .eq("id", editingChapter.id);

        if (error) throw error;
        toast.success("Cập nhật chapter thành công!");
      } else {
        const { error } = await supabase
          .from("chapters")
          .insert([chapterData]);

        if (error) throw error;
        toast.success("Thêm chapter mới thành công!");
      }

      setIsDialogOpen(false);
      resetForm();
      fetchChapters();
    } catch (error: any) {
      handleSupabaseError(error, "submit chapter");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa chapter này?")) return;

    try {
      const { error } = await supabase
        .from("chapters")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Đã xóa chapter");
      fetchChapters();
    } catch (error: any) {
      toast.error("Không thể xóa chapter");
    }
  };

  const resetForm = () => {
    setFormData({
      chapter_number: "",
      title: "",
      content: "",
    });
    setEditingChapter(null);
  };

  const openEditDialog = (chapter: Chapter) => {
    setEditingChapter(chapter);
    setFormData({
      chapter_number: chapter.chapter_number.toString(),
      title: chapter.title,
      content: chapter.content,
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
            onClick={() => navigate("/admin/novels")}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Về danh sách truyện
          </Button>

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground font-crimson mb-2">
                Quản Lý Chapter
              </h1>
              <p className="text-muted-foreground">{novelTitle}</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="mr-2 h-4 w-4" />
                  Thêm Chapter Mới
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingChapter ? "Chỉnh Sửa Chapter" : "Thêm Chapter Mới"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="chapter_number">Số Chapter *</Label>
                    <Input
                      id="chapter_number"
                      type="number"
                      value={formData.chapter_number}
                      onChange={(e) =>
                        setFormData({ ...formData, chapter_number: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="title">Tên Chapter *</Label>
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
                    <Label htmlFor="content">Nội Dung *</Label>
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) =>
                        setFormData({ ...formData, content: e.target.value })
                      }
                      rows={20}
                      required
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Mỗi đoạn văn sẽ tự động xuống dòng khi hiển thị
                    </p>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Đang xử lý..." : editingChapter ? "Cập Nhật" : "Thêm Chapter"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {loading && chapters.length === 0 ? (
            <p className="text-center text-muted-foreground">Đang tải...</p>
          ) : chapters.length === 0 ? (
            <p className="text-center text-muted-foreground">Chưa có chapter nào</p>
          ) : (
            <div className="space-y-2">
              {chapters.map((chapter) => (
                <Card key={chapter.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-baseline gap-2">
                        <span className="font-semibold text-foreground">
                          Chapter {chapter.chapter_number}
                        </span>
                        <span className="text-muted-foreground">·</span>
                        <span className="text-foreground">{chapter.title}</span>
                      </div>
                      <span className="text-xs text-muted-foreground mt-1 block">
                        {new Date(chapter.published_date).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(chapter)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(chapter.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
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

export default AdminChapters;
