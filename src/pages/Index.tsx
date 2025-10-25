import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NovelCard from "@/components/NovelCard";
import { BookOpen } from "lucide-react";

interface Novel {
  id: string;
  title: string;
  description: string | null;
  cover_image: string | null;
  genre: string | null;
}

const Index = () => {
  const [featuredNovels, setFeaturedNovels] = useState<Novel[]>([]);
  const [chapterCounts, setChapterCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchFeaturedNovels();
  }, []);

  const fetchFeaturedNovels = async () => {
    try {
      const { data: novelsData, error } = await supabase
        .from("novels")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(3);

      if (error) throw error;
      
      if (novelsData) {
        setFeaturedNovels(novelsData);
        
        // Fetch chapter counts
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
    }
  };

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
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-card to-background py-20 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 font-crimson">
              Rảnh Thì Dịch
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed max-w-2xl mx-auto">
              Cảm ơn bạn đã ghé thăm trang Rảnh Thì Dịch. Đây là trang truyện dịch novel tiếng Anh một người làm, nên nếu có sai sót gì bạn có thể góp ý mình cải thiện nhé
            </p>
            <Link to="/novels">
              <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                <BookOpen className="mr-2 h-5 w-5" />
                Xem Truyện
              </Button>
            </Link>
          </div>
        </section>

        {/* Featured Novels */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold text-foreground mb-8 font-crimson">Truyện Nổi Bật</h2>
            {featuredNovels.length === 0 ? (
              <p className="text-center text-muted-foreground">Chưa có truyện nào</p>
            ) : (
              <>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredNovels.map((novel) => (
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
                <div className="text-center mt-10">
                  <Link to="/novels">
                    <Button variant="outline" size="lg" className="border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground">
                      Xem Tất Cả Truyện
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
