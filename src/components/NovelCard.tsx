import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock } from "lucide-react";

interface NovelCardProps {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  genre: string;
  chapters: number;
  lastUpdate: string;
}

const NovelCard = ({ id, title, description, coverImage, genre, chapters, lastUpdate }: NovelCardProps) => {
  return (
    <Link to={`/novel/${id}`}>
      <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full border-border">
        <CardHeader className="p-0">
          <div className="aspect-[3/4] overflow-hidden rounded-t-lg">
            <img 
              src={coverImage} 
              alt={title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-lg text-foreground line-clamp-2">{title}</h3>
            <Badge variant="secondary" className="shrink-0">{genre}</Badge>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">{description}</p>
        </CardContent>
        <CardFooter className="px-4 pb-4 pt-0 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            <span>{chapters} chapters</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{lastUpdate}</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default NovelCard;
