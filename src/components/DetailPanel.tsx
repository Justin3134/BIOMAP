import { ResearchProject } from "@/types/research";
import { X, ExternalLink, CheckCircle, XCircle, Lightbulb, Link2 } from "lucide-react";

interface DetailPanelProps {
  project: ResearchProject | null;
  onClose: () => void;
}

const DetailPanel = ({ project, onClose }: DetailPanelProps) => {
  if (!project) return null;

  const similarityPercent = Math.round(project.similarity * 100);

  return (
    <div className="detail-panel w-[400px] p-6 slide-in-right">
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
            {project.details.year} · {project.details.authors.join(", ")}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      {/* Similarity indicator */}
      <div className="bg-secondary rounded-lg p-3 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-muted-foreground">Similarity to your idea</span>
          <span className="text-sm font-semibold text-primary">{similarityPercent}%</span>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${similarityPercent}%` }}
          />
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-6">
        {/* Overview */}
        <section>
          <h3 className="font-serif font-semibold text-foreground mb-2">Overview</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {project.details.overview}
          </p>
        </section>

        {/* What Worked */}
        <section>
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-primary" />
            <h3 className="font-serif font-semibold text-foreground">What Worked</h3>
          </div>
          <ul className="space-y-1.5">
            {project.details.whatWorked.map((item, i) => (
              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="w-1 h-1 rounded-full bg-primary mt-2 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* What Didn't Work */}
        <section>
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="w-4 h-4 text-destructive" />
            <h3 className="font-serif font-semibold text-foreground">What Didn't Work</h3>
          </div>
          <ul className="space-y-1.5">
            {project.details.whatDidntWork.map((item, i) => (
              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="w-1 h-1 rounded-full bg-destructive mt-2 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* Key Lessons */}
        <section>
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-4 h-4 text-accent" />
            <h3 className="font-serif font-semibold text-foreground">Key Lessons</h3>
          </div>
          <ul className="space-y-1.5">
            {project.details.keyLessons.map((item, i) => (
              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="w-1 h-1 rounded-full bg-accent mt-2 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* Relation to Your Idea */}
        <section className="bg-secondary/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Link2 className="w-4 h-4 text-primary" />
            <h3 className="font-serif font-semibold text-foreground">How This Relates to Your Idea</h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {project.details.relationToIdea}
          </p>
        </section>

        {/* External Link */}
        {project.details.externalLink && (
          <a
            href={project.details.externalLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <ExternalLink className="w-4 h-4" />
            View original paper
          </a>
        )}
      </div>
    </div>
  );
};

export default DetailPanel;
