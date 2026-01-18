import { ResearchProject } from "@/types/research";
import { X, Calendar, Users, Tag, Lightbulb, BookOpen } from "lucide-react";
import { useEffect } from "react";

interface ProjectDetailModalProps {
  project: ResearchProject | null;
  onClose: () => void;
}

const ProjectDetailModal = ({ project, onClose }: ProjectDetailModalProps) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  if (!project) return null;

  const similarityPercent = Math.round(project.similarity * 100);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/20 backdrop-blur-sm fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-card rounded-2xl shadow-soft-xl w-full max-w-2xl max-h-[85vh] overflow-hidden scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="relative p-6 pb-4 border-b border-border">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
          
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
              {project.clusterName}
            </span>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{similarityPercent}% similarity</span>
            </div>
          </div>
          
          <h2 className="font-display text-2xl font-semibold text-foreground pr-8">
            {project.title}
          </h2>
        </header>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-200px)]">
          {/* Meta info */}
          <div className="flex flex-wrap gap-4 mb-6 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>{project.details.year}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>{project.details.authors.join(", ")}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Tag className="w-4 h-4" />
              <span>{project.method}</span>
            </div>
          </div>

          {/* Abstract */}
          <section className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-foreground">Abstract</h3>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              {project.details.abstract}
            </p>
          </section>

          {/* Key Findings */}
          <section className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4 text-accent" />
              <h3 className="font-semibold text-foreground">Key Findings</h3>
            </div>
            <ul className="space-y-2">
              {project.details.keyFindings.map((finding, index) => (
                <li 
                  key={index}
                  className="flex items-start gap-3 text-muted-foreground"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" />
                  <span>{finding}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Keywords */}
          <section>
            <h3 className="font-semibold text-foreground mb-3">Keywords</h3>
            <div className="flex flex-wrap gap-2">
              {project.details.keywords.map((keyword) => (
                <span 
                  key={keyword}
                  className="px-3 py-1.5 bg-muted text-muted-foreground text-sm rounded-lg"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </section>
        </div>

        {/* Footer */}
        <footer className="p-6 pt-4 border-t border-border bg-secondary/30">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Similarity score based on methodology, topic, and approach
            </p>
            <button
              onClick={onClose}
              className="btn-explore py-2 px-6"
            >
              Close
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default ProjectDetailModal;
