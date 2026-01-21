import { X, ExternalLink, Calendar, Building2, Lightbulb, AlertCircle, TrendingUp, Eye, MessageSquare, Pin } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";

interface NewsArticle {
  id: string;
  articleId: string;
  title: string;
  publisher: string;
  date: string;
  url: string | null;
  whatHappened?: string;
  whyItMatters?: string[];
  keyClaims?: string[];
  whatToWatch?: string[];
  relationToTopic?: string;
  summary?: string;
  takeaway?: string;
  category: string;
  similarity?: number;
}

interface NewsDetailPanelProps {
  article: NewsArticle;
  onClose: () => void;
  onAddToContext?: (article: any) => void;
  isInContext?: boolean;
  onPinEvidence?: (article: any) => void;
  isPinnedEvidence?: boolean;
}

const NewsDetailPanel = ({ 
  article, 
  onClose,
  onAddToContext,
  isInContext = false,
  onPinEvidence,
  isPinnedEvidence = false
}: NewsDetailPanelProps) => {
  const [justPinned, setJustPinned] = useState(false);
  const [justAddedToChat, setJustAddedToChat] = useState(false);

  const handlePinEvidence = () => {
    if (onPinEvidence) {
      onPinEvidence(article);
      setJustPinned(true);
      setTimeout(() => setJustPinned(false), 2000);
    }
  };

  const handleAddToChat = () => {
    if (onAddToContext) {
      onAddToContext(article);
      setJustAddedToChat(true);
      setTimeout(() => setJustAddedToChat(false), 2000);
    }
  };

  // Calculate similarity (default to 75% if not provided)
  const similarity = article.similarity || 0.75;
  const similarityPercent = Math.round(similarity * 100);

  // Use new fields if available, fallback to old fields
  const whatHappened = article.whatHappened || article.summary || '';
  const whyItMatters = article.whyItMatters || [];
  const keyClaims = article.keyClaims || [];
  const whatToWatch = article.whatToWatch || [];
  const relationToTopic = article.relationToTopic || '';

  return (
    <div className="w-[500px] h-full bg-card border-l border-border overflow-hidden flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="p-6 border-b border-border bg-muted/30">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 pr-4">
            <h2 className="text-2xl font-bold text-foreground mb-2 leading-tight">
              {article.title}
            </h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
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

        {/* Action Buttons */}
        {(onAddToContext || onPinEvidence) && (
          <div className="flex gap-2">
            {onAddToContext && (
              <Button
                onClick={handleAddToChat}
                variant={isInContext ? "secondary" : "default"}
                size="sm"
                className="flex items-center gap-2"
                disabled={isInContext}
              >
                <MessageSquare className="w-4 h-4" />
                {justAddedToChat ? "Added!" : isInContext ? "In Chat" : "Add to Chat"}
              </Button>
            )}

            {onPinEvidence && (
              <Button
                onClick={handlePinEvidence}
                variant={isPinnedEvidence ? "secondary" : "outline"}
                size="sm"
                className="flex items-center gap-2"
                disabled={isPinnedEvidence}
              >
                <Pin className="w-4 h-4" />
                {justPinned ? "Pinned!" : isPinnedEvidence ? "Pinned" : "Pin Evidence"}
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Similarity Badge */}
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-lg font-bold text-primary">{similarityPercent}%</span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm text-foreground mb-1">
                Similarity to Your Idea
              </h3>
              <p className="text-xs text-muted-foreground">
                This article has {similarityPercent}% relevance to your research topic
              </p>
            </div>
          </div>
        </div>

        {/* What Happened */}
        {whatHappened && (
          <div>
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-foreground">
              <AlertCircle className="w-5 h-5" />
              What Happened
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              {whatHappened}
            </p>
          </div>
        )}

        {/* Why It Matters */}
        {whyItMatters.length > 0 && (
          <div>
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-foreground">
              <TrendingUp className="w-5 h-5" />
              Why It Matters
            </h3>
            <ul className="space-y-2">
              {whyItMatters.map((point, idx) => (
                <li key={idx} className="flex gap-3">
                  <span className="text-primary mt-1">•</span>
                  <span className="text-muted-foreground leading-relaxed flex-1">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Key Claims */}
        {keyClaims.length > 0 && (
          <div>
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-foreground">
              <Lightbulb className="w-5 h-5" />
              Key Claims (with source)
            </h3>
            <ul className="space-y-3">
              {keyClaims.map((claim, idx) => (
                <li key={idx} className="bg-muted/50 rounded-lg p-3">
                  <p className="text-sm text-foreground leading-relaxed mb-2">{claim}</p>
                  <p className="text-xs text-muted-foreground">
                    — {article.publisher}, {new Date(article.date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      year: 'numeric' 
                    })}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* What to Watch Next */}
        {whatToWatch.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2 text-blue-900 dark:text-blue-100">
              <Eye className="w-5 h-5" />
              What to Watch Next
            </h3>
            <ul className="space-y-2">
              {whatToWatch.map((item, idx) => (
                <li key={idx} className="flex gap-3">
                  <span className="text-blue-600 dark:text-blue-400 mt-1">→</span>
                  <span className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed flex-1">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* How This Relates to Your Idea */}
        {relationToTopic && (
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <h3 className="font-semibold text-sm mb-3 text-foreground">
              How This Relates to Your Idea
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {relationToTopic}
            </p>
          </div>
        )}

        {/* Fallback to old format if no new fields */}
        {!whatHappened && article.takeaway && (
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
        )}

        {/* View Original Article */}
        {article.url && (
          <div className="pt-4 border-t border-border">
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 text-sm text-primary hover:underline font-medium py-3 px-4 bg-primary/5 hover:bg-primary/10 rounded-lg transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              View original article
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsDetailPanel;
