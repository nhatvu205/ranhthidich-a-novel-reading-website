import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";

interface Chapter {
  id: string;
  number: number;
  title: string;
  publishedDate: string;
}

interface ChapterListProps {
  novelId: string;
  chapters: Chapter[];
}

const ChapterList = ({ novelId, chapters }: ChapterListProps) => {
  return (
    <div className="space-y-2">
      {chapters.map((chapter) => (
        <Link key={chapter.id} to={`/novel/${novelId}/chapter/${chapter.id}`}>
          <Card className="p-4 hover:shadow-md hover:border-secondary transition-all duration-200 border-border">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="font-semibold text-foreground">Chapter {chapter.number}</span>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-foreground">{chapter.title}</span>
                </div>
                <span className="text-xs text-muted-foreground mt-1 block">{chapter.publishedDate}</span>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
};

export default ChapterList;
