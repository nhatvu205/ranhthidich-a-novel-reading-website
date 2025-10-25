import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChapterList from "@/components/ChapterList";
import { ArrowLeft, BookOpen, Heart } from "lucide-react";
import { toast } from "sonner";

interface Novel {
  id: string;
  title: string;
  description: string | null;
  cover_image: string | null;
  genre: string | null;
  status: string | null;
}

interface Chapter {
  id: string;
  chapter_number: number;
  title: string;
  published_date: string;
}

const NovelDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [novel, setNovel] = useState<Novel | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchNovel();
      fetchChapters();
      if (user) {
        checkBookmark();
      }
    }
  }, [id, user]);

  const fetchNovel = async () => {
    try {
      const { data, error } = await supabase
        .from("novels")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching novel:", error);
        throw error;
      }
      setNovel(data);
    } catch (error) {
      console.error("Error fetching novel:", error);
      setNovel(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchChapters = async () => {
    try {
      const { data, error } = await supabase
        .from("chapters")
        .select("id, chapter_number, title, published_date")
        .eq("novel_id", id)
        .order("chapter_number", { ascending: true });

      if (error) {
        console.error("Error fetching chapters:", error);
        throw error;
      }
      setChapters(data || []);
    } catch (error) {
      console.error("Error fetching chapters:", error);
      setChapters([]);
    }
  };

  const checkBookmark = async () => {
    if (!user || !id) return;

    try {
      const { data, error } = await supabase
        .from("bookmarks")
        .select("id")
        .eq("user_id", user.id)
        .eq("novel_id", id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error("Error checking bookmark:", error);
      }
      setIsBookmarked(!!data);
    } catch (error) {
      console.error("Error checking bookmark:", error);
    }
  };

  const toggleBookmark = async () => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để yêu thích truyện");
      return;
    }

    if (!id) return;

    setBookmarkLoading(true);

    try {
      if (isBookmarked) {
        // Remove bookmark
        const { error } = await supabase
          .from("bookmarks")
          .delete()
          .eq("user_id", user.id)
          .eq("novel_id", id);

        if (error) throw error;
        setIsBookmarked(false);
        toast.success("Đã xóa khỏi danh sách yêu thích");
      } else {
        // Add bookmark
        const { error } = await supabase
          .from("bookmarks")
          .insert([{ user_id: user.id, novel_id: id }]);

        if (error) throw error;
        setIsBookmarked(true);
        toast.success("Đã thêm vào danh sách yêu thích");
      }
    } catch (error: any) {
      console.error("Error toggling bookmark:", error);
      toast.error("Có lỗi xảy ra: " + (error.message || "Unknown error"));
    } finally {
      setBookmarkLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Đang tải...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!novel) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Không tìm thấy truyện</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <Link to="/novels">
            <Button variant="ghost" className="mb-6 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Về danh sách truyện
            </Button>
          </Link>

          <div className="grid md:grid-cols-[300px_1fr] gap-8 mb-12">
            <div>
              <img 
                src={novel.cover_image || "https://images.unsplash.com/photo-1529473814998-077b4fec6770?w=400&h=600&fit=crop"} 
                alt={novel.title}
                className="w-full rounded-lg shadow-lg border border-border"
              />
            </div>

            <div>
              <div className="flex items-start gap-3 mb-4">
                <h1 className="text-4xl font-bold text-foreground font-crimson flex-1">{novel.title}</h1>
                {novel.genre && <Badge variant="secondary" className="mt-2">{novel.genre}</Badge>}
              </div>
              
              <div className="space-y-2 mb-6 text-muted-foreground">
                {novel.status && <p><span className="font-semibold text-foreground">Trạng thái:</span> {novel.status}</p>}
              </div>

              <div className="prose prose-stone max-w-none">
                <h2 className="text-xl font-semibold text-foreground mb-3">Mô tả</h2>
                <p className="text-foreground leading-relaxed">{novel.description || "Không có mô tả"}</p>
              </div>

              <div className="flex gap-3 mt-6">
                {chapters.length > 0 && (
                  <Link to={`/novel/${novel.id}/chapter/${chapters[0].id}`}>
                    <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                      <BookOpen className="mr-2 h-5 w-5" />
                      Bắt Đầu Đọc
                    </Button>
                  </Link>
                )}
                <Button 
                  size="lg" 
                  variant={isBookmarked ? "default" : "outline"}
                  onClick={toggleBookmark}
                  disabled={bookmarkLoading}
                  className={isBookmarked ? "bg-red-500 hover:bg-red-600 text-white" : ""}
                >
                  <Heart className={`mr-2 h-5 w-5 ${isBookmarked ? "fill-current" : ""}`} />
                  {isBookmarked ? "Đã Yêu Thích" : "Yêu Thích"}
                </Button>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6 font-crimson">Các Chapter</h2>
            {chapters.length === 0 ? (
              <p className="text-center text-muted-foreground">Chưa có chapter nào</p>
            ) : (
              <ChapterList 
                novelId={id || ""} 
                chapters={chapters.map(ch => ({
                  ...ch,
                  number: ch.chapter_number,
                  publishedDate: new Date(ch.published_date).toLocaleDateString('vi-VN')
                }))} 
              />
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NovelDetail;
