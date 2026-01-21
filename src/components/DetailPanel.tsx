import { useState, useCallback, useEffect } from "react";
import { ResearchProject } from "@/types/research";
import { X, ExternalLink, CheckCircle, XCircle, Lightbulb, Link2, MessageSquare, Pin, Loader2, Plus, ChevronDown, ChevronUp } from "lucide-react";
import { researchAPI } from "@/lib/api";
import { Button } from "./ui/button";

interface DetailPanelProps {
  project: ResearchProject | null;
  onClose: () => void;
  onAddToContext?: (project: ResearchProject) => void;
  onAskAboutText?: (text: string, project: ResearchProject) => void;
  isInContext?: boolean;
  onPinEvidence?: (project: ResearchProject) => void;
  isPinnedEvidence?: boolean;
}

const DetailPanel = ({ project, onClose, onAddToContext, onAskAboutText, isInContext, onPinEvidence, isPinnedEvidence }: DetailPanelProps) => {
  const [selectedText, setSelectedText] = useState<string>("");
  const [showAskButton, setShowAskButton] = useState(false);
  const [askButtonPosition, setAskButtonPosition] = useState({ x: 0, y: 0 });
  const [evidence, setEvidence] = useState<any>(null);
  const [isLoadingEvidence, setIsLoadingEvidence] = useState(false);
  const [justPinned, setJustPinned] = useState(false);
  const [justAddedToChat, setJustAddedToChat] = useState(false);

  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection();
    const text = selection?.toString().trim();
    
    if (text && text.length > 0) {
      setSelectedText(text);
      const range = selection?.getRangeAt(0);
      const rect = range?.getBoundingClientRect();
      if (rect) {
        setAskButtonPosition({ x: rect.left + rect.width / 2, y: rect.top - 10 });
        setShowAskButton(true);
      }
    } else {
      setShowAskButton(false);
      setSelectedText("");
    }
  }, []);

  const handleAskAboutSelection = () => {
    if (selectedText && project && onAskAboutText) {
      onAskAboutText(selectedText, project);
      setShowAskButton(false);
      setSelectedText("");
      window.getSelection()?.removeAllRanges();
    }
  };

  // Fetch evidence when project changes
  useEffect(() => {
    if (!project) return;
    
    // Get overview from either project.abstract, project.summary, or project.details.overview
    const overview = project.abstract || project.summary || project.details?.overview || '';
    
    const fetchEvidence = async () => {
      // Always try to extract evidence from the overview
      // Don't rely on pre-existing details as they may not have the evidence fields
      
      // Check if we have an overview to extract from
      if (!overview || overview === 'No abstract available' || overview.length < 20) {
        console.warn('⚠️ No sufficient overview available for evidence extraction');
        setEvidence({
          what_worked: ["Limited information available for detailed analysis"],
          limitations: ["Limited information available for detailed analysis"],
          key_lessons: ["Review the overview section for available information"],
          practical_constraints: []
        });
        setIsLoadingEvidence(false);
        return;
      }

      // Extract evidence using OpenAI
      setIsLoadingEvidence(true);
      try {
        console.log(`🔍 Extracting evidence for: ${project.title}`);
        const extractedEvidence = await researchAPI.extractEvidence(
          project.id,
          project.title,
          overview
        );
        setEvidence(extractedEvidence);
        console.log(`✅ Evidence extracted with ${extractedEvidence?.what_worked?.length || 0} insights`);
      } catch (error) {
        console.error("Error extracting evidence:", error);
        // Fallback to empty arrays if extraction fails
        setEvidence({
          what_worked: ["Evidence extraction unavailable"],
          limitations: ["Evidence extraction unavailable"],
          key_lessons: ["Evidence extraction unavailable"],
          practical_constraints: []
        });
      } finally {
        setIsLoadingEvidence(false);
      }
    };

    fetchEvidence();
  }, [project?.id]);


  if (!project) return null;

  const similarityPercent = Math.round(project.similarity * 100);

  return (
    <div className="detail-panel w-[400px] p-6 slide-in-right relative" onMouseUp={handleTextSelection}>
      {/* Floating Ask Button */}
      {showAskButton && onAskAboutText && (
        <div
          className="fixed z-50 transform -translate-x-1/2 -translate-y-full"
          style={{ left: askButtonPosition.x, top: askButtonPosition.y }}
        >
          <button
            onClick={handleAskAboutSelection}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-full shadow-lg hover:bg-primary/90 transition-colors"
          >
            <MessageSquare className="w-3 h-3" />
            Ask AI about this
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1 pr-4">
          <span className="text-xs font-medium text-accent uppercase tracking-wider">
            {project.clusterLabel}
          </span>
          <h2 className="font-serif text-xl font-semibold text-foreground mt-1 leading-tight">
            {project.title}
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            {project.year || project.details?.year} · {typeof project.authors === 'string' ? project.authors : project.details?.authors?.join(", ")}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      {/* Action Buttons */}
      {(onAddToContext || onPinEvidence) && (
        <div className="flex gap-2 mb-4">
          {onAddToContext && (
            <Button
              onClick={() => {
                onAddToContext(project);
                if (!isInContext) {
                  setJustAddedToChat(true);
                  setTimeout(() => setJustAddedToChat(false), 2000);
                }
              }}
              variant={isInContext ? "secondary" : "default"}
              size="sm"
              className={`flex items-center gap-2 transition-all ${
                justAddedToChat ? 'ring-2 ring-primary ring-offset-2' : ''
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              {justAddedToChat ? (
                <span className="font-semibold">Added! ✓</span>
              ) : isInContext ? (
                "In Chat Context"
              ) : (
                "Add to Chat"
              )}
            </Button>
          )}

          {onPinEvidence && (
            <Button
              onClick={() => {
                onPinEvidence(project);
                if (!isPinnedEvidence) {
                  setJustPinned(true);
                  setTimeout(() => setJustPinned(false), 2000);
                }
              }}
              variant={isPinnedEvidence ? "secondary" : "outline"}
              size="sm"
              className={`flex items-center gap-2 transition-all ${
                justPinned ? 'ring-2 ring-primary ring-offset-2' : ''
              }`}
            >
              <Pin className={`w-4 h-4 ${isPinnedEvidence ? 'fill-current' : ''}`} />
              {justPinned ? (
                <span className="font-semibold">Pinned! ✓</span>
              ) : isPinnedEvidence ? (
                "Pinned to Evidence"
              ) : (
                "Pin Evidence"
              )}
            </Button>
          )}
        </div>
      )}

      {/* Similarity indicator */}
      <div className="bg-secondary border border-border rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-sm text-foreground">
            Similarity to Your Idea
          </h3>
          <span className="text-lg font-bold text-primary">{similarityPercent}%</span>
        </div>
        <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden mb-2">
          <div 
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${similarityPercent}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          This paper is <span className="font-semibold text-foreground">{similarityPercent}%</span> relevant to your research idea
        </p>
      </div>

      {/* Sections */}
      <div className="space-y-6">
        {/* Overview */}
        <section>
          <h3 className="font-serif font-semibold text-foreground mb-2">Overview</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {project.abstract || project.summary || project.details?.overview || 'No abstract available'}
          </p>
        </section>

        {/* What Worked */}
        <section>
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-primary" />
            <h3 className="font-serif font-semibold text-foreground">What Worked</h3>
          </div>
          {isLoadingEvidence ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Extracting evidence...
            </div>
          ) : (
            <ul className="space-y-1.5">
              {(evidence?.what_worked || []).map((item: string, i: number) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-primary mt-2 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* What Didn't Work */}
        <section>
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="w-4 h-4 text-destructive" />
            <h3 className="font-serif font-semibold text-foreground">What Didn't Work</h3>
          </div>
          {isLoadingEvidence ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Extracting evidence...
            </div>
          ) : (
            <ul className="space-y-1.5">
              {(evidence?.limitations || []).map((item: string, i: number) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-destructive mt-2 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Key Lessons */}
        <section>
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-4 h-4 text-accent" />
            <h3 className="font-serif font-semibold text-foreground">Key Lessons</h3>
          </div>
          {isLoadingEvidence ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Extracting evidence...
            </div>
          ) : (
            <ul className="space-y-1.5">
              {(evidence?.key_lessons || []).map((item: string, i: number) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-accent mt-2 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Relation to Your Idea */}
        <section className="bg-secondary/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Link2 className="w-4 h-4 text-primary" />
            <h3 className="font-serif font-semibold text-foreground">How This Relates to Your Idea</h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {project.details?.relationToIdea || 'Relation to your research idea not yet analyzed.'}
          </p>
        </section>

        {/* External Link - Only show if URL exists */}
        {project.url ? (
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <ExternalLink className="w-4 h-4" />
            View original paper on Semantic Scholar
          </a>
        ) : (
          <div className="flex items-center gap-2 text-sm text-muted-foreground italic">
            <Lightbulb className="w-4 h-4" />
            AI-generated research paper (no external link available)
          </div>
        )}

        {/* Tip: Use + button on node to find similar papers */}
        <div className="pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            💡 Hover over the paper node and click the <span className="font-semibold text-primary">+</span> button to find similar papers
          </p>
        </div>
      </div>
    </div>
  );
};

export default DetailPanel;
