import { MessageCircle } from "lucide-react";

const CommentSection = () => {
  return (
    <div className="mt-12 space-y-6">
      <div className="flex items-center gap-2">
        <MessageCircle className="h-5 w-5 text-secondary" />
        <h2 className="text-2xl font-semibold text-foreground">Bình Luận</h2>
      </div>

      <div className="text-center py-12 bg-muted/30 rounded-lg border border-border">
        <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">
          Chức năng bình luận sẽ được bổ sung trong thời gian tới.
        </p>
      </div>
    </div>
  );
};

export default CommentSection;
