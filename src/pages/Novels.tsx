import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NovelCard from "@/components/NovelCard";

interface Novel {
  id: string;
  title: string;
  description: string | null;
  cover_image: string | null;
  genre: string | null;
}

const Novels = () => {
  const [novels, setNovels] = useState<Novel[]>([]);
  const [loading, setLoading] = useState(true);
  const [chapterCounts, setChapterCounts] = useState<Record<string, number>>({});
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchNovels();
  }, []);

  const fetchNovels = async () => {
    try {
      const { data: novelsData, error: novelsError } = await supabase
        .from("novels")
        .select("*")
        .order("created_at", { ascending: false });

      if (novelsError) throw novelsError;
      
      if (novelsData) {
        setNovels(novelsData);
        
        // Fetch chapter counts for each novel
        const counts: Record<string, number> = {};
        for (const novel of novelsData) {
          const { count } = await supabase
            .from("chapters")
            .select("*", { count: "exact", head: true })
            .eq("novel_id", novel.id);
          counts[novel.id] = count || 0;
        }
        setChapterCounts(counts);
      }
    } catch (error) {
      console.error("Error fetching novels:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter novels based on search query
  const filteredNovels = novels.filter(novel =>
    novel.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (novel.description && novel.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (novel.genre && novel.genre.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const mockNovels = [
    {
      id: "1",
      title: "Chronicles of the Eternal Realm",
      description: "A tale of adventure, magic, and destiny in a world where ancient powers awaken.",
      coverImage: "https://images.unsplash.com/photo-1529473814998-077b4fec6770?w=400&h=600&fit=crop",
      genre: "Fantasy",
      chapters: 127,
      lastUpdate: "2 days ago"
    },
    {
      id: "2",
      title: "Shadows of Tomorrow",
      description: "In a dystopian future, one person's choice could change the fate of humanity.",
      coverImage: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop",
      genre: "Sci-Fi",
      chapters: 89,
      lastUpdate: "1 week ago"
    },
    {
      id: "3",
      title: "The Forgotten Empire",
      description: "History repeats itself when a lost civilization's secrets resurface in modern times.",
      coverImage: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=600&fit=crop",
      genre: "Mystery",
      chapters: 156,
      lastUpdate: "3 days ago"
    },
    {
      id: "4",
      title: "Moonlight Sonata",
      description: "A romantic tale of music, love, and second chances under the moonlit sky.",
      coverImage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600&fit=crop",
      genre: "Romance",
      chapters: 78,
      lastUpdate: "4 days ago"
    },
    {
      id: "5",
      title: "The Last Cultivation",
      description: "Journey through ancient martial arts and spiritual cultivation in a world of immortals.",
      coverImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop",
      genre: "Cultivation",
      chapters: 203,
      lastUpdate: "1 day ago"
    },
    {
      id: "6",
      title: "Digital Awakening",
      description: "When virtual reality becomes indistinguishable from reality itself.",
      coverImage: "https://images.unsplash.com/photo-1519337265831-281ec6cc8514?w=400&h=600&fit=crop",
      genre: "Sci-Fi",
      chapters: 112,
      lastUpdate: "5 days ago"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4 font-crimson">Danh Sách Truyện</h1>
            
            {/* Search Bar */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Tìm kiếm truyện theo tên, mô tả, thể loại..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {loading ? (
            <p className="text-center text-muted-foreground">Đang tải...</p>
          ) : filteredNovels.length === 0 ? (
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                {searchQuery ? `Không tìm thấy truyện nào với từ khóa "${searchQuery}"` : "Chưa có truyện nào"}
              </p>
              <p className="text-sm text-muted-foreground">
                {searchQuery ? "Thử tìm kiếm với từ khóa khác" : "Danh sách truyện sẽ hiển thị ở đây khi có truyện được thêm vào"}
              </p>
            </div>
          ) : (
            <>
              {searchQuery && (
                <p className="text-sm text-muted-foreground mb-4">
                  Tìm thấy {filteredNovels.length} truyện
                </p>
              )}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredNovels.map((novel) => (
                <NovelCard 
                  key={novel.id} 
                  id={novel.id}
                  title={novel.title}
                  description={novel.description || ""}
                  coverImage={novel.cover_image || "https://images.unsplash.com/photo-1529473814998-077b4fec6770?w=400&h=600&fit=crop"}
                  genre={novel.genre || ""}
                  chapters={chapterCounts[novel.id] || 0}
                  lastUpdate="Gần đây"
                />
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Novels;
