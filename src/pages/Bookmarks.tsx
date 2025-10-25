import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NovelCard from "@/components/NovelCard";
import { Heart } from "lucide-react";
import { toast } from "sonner";

interface Novel {
  id: string;
  title: string;
  description: string | null;
  cover_image: string | null;
  genre: string | null;
}

interface Bookmark {
  id: string;
  novel_id: string;
  created_at: string;
  novels: Novel;
}

const Bookmarks = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [chapterCounts, setChapterCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        toast.error("Vui lòng đăng nhập để xem truyện yêu thích");
        navigate("/auth");
      } else {
        fetchBookmarks();
      }
    }
  }, [user, authLoading, navigate]);

  const fetchBookmarks = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("bookmarks")
        .select(`
          id,
          novel_id,
          created_at,
          novels (
            id,
            title,
            description,
            cover_image,
            genre
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching bookmarks:", error);
        
        // Check if table doesn't exist
        if (error.code === '42P01') {
          toast.error("Bảng bookmarks chưa được tạo. Vui lòng chạy migration!");
          setLoading(false);
          return;
        }
        
        throw error;
      }

      setBookmarks(data as any || []);

      // Fetch chapter counts
      if (data && data.length > 0) {
        const counts: Record<string, number> = {};
        for (const bookmark of data) {
          if (bookmark.novels) {
            const { count } = await supabase
              .from("chapters")
              .select("*", { count: "exact", head: true })
              .eq("novel_id", bookmark.novel_id);
            counts[bookmark.novel_id] = count || 0;
          }
        }
        setChapterCounts(counts);
      }
    } catch (error: any) {
      console.error("Error fetching bookmarks:", error);
      toast.error("Không thể tải danh sách yêu thích: " + (error.message || ""));
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
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

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Heart className="h-8 w-8 text-red-500 fill-current" />
              <h1 className="text-4xl font-bold text-foreground font-crimson">Truyện Yêu Thích</h1>
            </div>
            <p className="text-muted-foreground">
              Danh sách các truyện bạn đã đánh dấu yêu thích
            </p>
          </div>

          {bookmarks.length === 0 ? (
            <div className="text-center py-16">
              <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg text-muted-foreground mb-2">
                Chưa có truyện yêu thích nào
              </p>
              <p className="text-sm text-muted-foreground">
                Khám phá và thêm truyện vào danh sách yêu thích của bạn
              </p>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-6">
                {bookmarks.length} truyện
              </p>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bookmarks.map((bookmark) => {
                  const novel = bookmark.novels;
                  if (!novel) return null;

                  return (
                    <NovelCard 
                      key={bookmark.id}
                      id={novel.id}
                      title={novel.title}
                      description={novel.description || ""}
                      coverImage={novel.cover_image || "https://images.unsplash.com/photo-1529473814998-077b4fec6770?w=400&h=600&fit=crop"}
                      genre={novel.genre || ""}
                      chapters={chapterCounts[novel.id] || 0}
                      lastUpdate={new Date(bookmark.created_at).toLocaleDateString('vi-VN')}
                    />
                  );
                })}
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Bookmarks;

