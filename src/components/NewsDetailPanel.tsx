import { X, ExternalLink, Calendar, Building2, Lightbulb, Tag } from "lucide-react";
import { Button } from "./ui/button";

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

interface NewsDetailPanelProps {
  article: NewsArticle;
  onClose: () => void;
}

const NewsDetailPanel = ({ article, onClose }: NewsDetailPanelProps) => {
  return (
    <div className="w-[500px] h-full bg-card border-l border-border overflow-hidden flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="p-6 border-b border-border bg-yellow-50 dark:bg-yellow-950/30">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 pr-4">
            <h2 className="text-2xl font-bold text-yellow-900 dark:text-yellow-100 mb-2 leading-tight">
              {article.title}
            </h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-yellow-700 hover:text-yellow-900 dark:text-yellow-300 flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-yellow-700 dark:text-yellow-300 mb-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 flex-shrink-0" />
            <span className="font-medium">{article.publisher}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 flex-shrink-0" />
            <span>{new Date(article.date).toLocaleDateString('en-US', { 
              month: 'long', 
              day: 'numeric', 
              year: 'numeric' 
            })}</span>
          </div>
        </div>

        {article.url && (
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-yellow-600 dark:text-yellow-400 hover:underline font-medium"
          >
            <ExternalLink className="w-4 h-4" />
            Read full article
          </a>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Key Takeaway */}
        <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-sm text-yellow-900 dark:text-yellow-100 mb-1">
                Key Takeaway
              </h3>
              <p className="text-sm text-yellow-800 dark:text-yellow-200 leading-relaxed">
                {article.takeaway}
              </p>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div>
          <h3 className="font-semibold text-lg mb-3 text-foreground">Summary</h3>
          <p className="text-muted-foreground leading-relaxed">
            {article.summary}
          </p>
        </div>

        {/* Category */}
        <div>
          <h3 className="font-semibold text-sm text-muted-foreground mb-2 flex items-center gap-2">
            <Tag className="w-4 h-4" />
            Category
          </h3>
          <span className="inline-block px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full text-sm font-medium">
            {article.category}
          </span>
        </div>

        {/* Why This Matters */}
        <div className="bg-muted/50 rounded-lg p-4">
          <h3 className="font-semibold text-sm mb-2">Why This Matters</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            This news article provides real-world context and recent developments related to your research topic. 
            News sources often highlight practical applications, market trends, and emerging challenges that complement 
            academic research findings.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NewsDetailPanel;
