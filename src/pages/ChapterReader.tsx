import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CommentSection from "@/components/CommentSection";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";

interface Chapter {
  id: string;
  chapter_number: number;
  title: string;
  content: string;
  published_date: string;
  novel_id: string;
}

interface Novel {
  title: string;
}

const ChapterReader = () => {
  const { novelId, chapterId } = useParams();
  const navigate = useNavigate();
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [novel, setNovel] = useState<Novel | null>(null);
  const [loading, setLoading] = useState(true);
  const [prevChapterId, setPrevChapterId] = useState<string | null>(null);
  const [nextChapterId, setNextChapterId] = useState<string | null>(null);

  useEffect(() => {
    if (novelId && chapterId) {
      fetchChapter();
      fetchNovel();
    }
  }, [novelId, chapterId]);

  const fetchChapter = async () => {
    try {
      const { data, error } = await supabase
        .from("chapters")
        .select("*")
        .eq("id", chapterId)
        .single();

      if (error) {
        console.error("Error fetching chapter:", error);
        throw error;
      }
      setChapter(data);

      // Fetch prev and next chapters
      if (data) {
        const { data: prevData } = await supabase
          .from("chapters")
          .select("id")
          .eq("novel_id", novelId)
          .lt("chapter_number", data.chapter_number)
          .order("chapter_number", { ascending: false })
          .limit(1)
          .maybeSingle();

        const { data: nextData } = await supabase
          .from("chapters")
          .select("id")
          .eq("novel_id", novelId)
          .gt("chapter_number", data.chapter_number)
          .order("chapter_number", { ascending: true })
          .limit(1)
          .maybeSingle();

        setPrevChapterId(prevData?.id || null);
        setNextChapterId(nextData?.id || null);
      }
    } catch (error) {
      console.error("Error fetching chapter:", error);
      setChapter(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchNovel = async () => {
    try {
      const { data, error } = await supabase
        .from("novels")
        .select("title")
        .eq("id", novelId)
        .single();

      if (error) {
        console.error("Error fetching novel:", error);
        throw error;
      }
      setNovel(data);
    } catch (error) {
      console.error("Error fetching novel:", error);
      setNovel(null);
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

  if (!chapter) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Không tìm thấy chapter</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-8 px-4">
        <div className="container mx-auto max-w-3xl">
          <Link to={`/novel/${novelId}`}>
            <Button variant="ghost" className="mb-6 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Về trang truyện
            </Button>
          </Link>

          <article className="bg-card rounded-lg p-8 md:p-12 shadow-sm border border-border">
            <header className="mb-8 pb-6 border-b border-border">
              <p className="text-sm text-muted-foreground mb-2">{novel?.title}</p>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2 font-crimson">
                Chapter {chapter.chapter_number}: {chapter.title}
              </h1>
              <p className="text-sm text-muted-foreground">
                Xuất bản ngày {new Date(chapter.published_date).toLocaleDateString('vi-VN')}
              </p>
            </header>

            <div className="novel-text text-lg leading-relaxed space-y-6 text-foreground">
              {chapter.content.split('\n\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </article>

          <div className="flex items-center justify-between mt-8 gap-4">
            <Button 
              variant="outline" 
              className="flex-1 border-border hover:bg-muted" 
              disabled={!prevChapterId}
              onClick={() => prevChapterId && navigate(`/novel/${novelId}/chapter/${prevChapterId}`)}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Chương trước
            </Button>
            <Button 
              variant="outline" 
              className="flex-1 border-border hover:bg-muted"
              disabled={!nextChapterId}
              onClick={() => nextChapterId && navigate(`/novel/${novelId}/chapter/${nextChapterId}`)}
            >
              Chương sau
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <CommentSection />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ChapterReader;
