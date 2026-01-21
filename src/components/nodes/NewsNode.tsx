import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { Newspaper } from "lucide-react";

interface NewsArticle {
  id: string;
  articleId: string;
  title: string;
  publisher: string;
  date: string;
  url: string | null;
  summary: string;
  takeaway: string;
  category: string;
}

interface NewsNodeData {
  article: NewsArticle;
  onSelect: (article: NewsArticle) => void;
  isSelected: boolean;
}

interface NewsNodeProps {
  data: NewsNodeData;
}

const NewsNode = memo(({ data }: NewsNodeProps) => {
  const { article, onSelect, isSelected } = data;

  return (
    <div className="relative group">
      <Handle type="target" position={Position.Top} className="!bg-gray-400" />
      
      <div
        onClick={() => onSelect(article)}
        className={`
          px-4 py-3 rounded-lg border-2 cursor-pointer
          transition-all duration-200 min-w-[220px] max-w-[280px]
          ${isSelected 
            ? 'bg-card border-primary shadow-lg scale-105 ring-4 ring-primary/10' 
            : 'bg-card border-border hover:border-primary/50 hover:shadow-md'
          }
        `}
      >
        <div className="flex items-start gap-2">
          <Newspaper className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm text-foreground leading-tight mb-1 line-clamp-2">
              {article.title}
            </h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <span className="font-medium truncate">{article.publisher}</span>
              <span>•</span>
              <span className="whitespace-nowrap">
                {new Date(article.date).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </span>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {article.takeaway}
            </p>
          </div>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-gray-400" />
    </div>
  );
});

NewsNode.displayName = "NewsNode";

export default NewsNode;
