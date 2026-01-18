import { ResearchProject } from "@/types/research";
import { ArrowRight, ExternalLink } from "lucide-react";

interface ResearchCardProps {
  project: ResearchProject;
  onClick: () => void;
  delay?: number;
}

const methodColors: Record<string, string> = {
  "Gene Editing": "bg-cluster-1 text-cluster-border-1 border border-cluster-border-1/20",
  "mRNA Technology": "bg-cluster-1 text-cluster-border-1 border border-cluster-border-1/20",
  "Organoid Culture": "bg-cluster-2 text-cluster-border-2 border border-cluster-border-2/20",
  "Synthetic Biology": "bg-cluster-3 text-cluster-border-3 border border-cluster-border-3/20",
  "Metabolomics": "bg-cluster-3 text-cluster-border-3 border border-cluster-border-3/20",
  "Machine Learning": "bg-cluster-4 text-cluster-border-4 border border-cluster-border-4/20",
  "Multi-Omics": "bg-cluster-4 text-cluster-border-4 border border-cluster-border-4/20",
  "Nanomedicine": "bg-cluster-5 text-cluster-border-5 border border-cluster-border-5/20",
  "Organ-on-Chip": "bg-cluster-2 text-cluster-border-2 border border-cluster-border-2/20",
  "Lipid Nanoparticles": "bg-cluster-5 text-cluster-border-5 border border-cluster-border-5/20",
};

const ResearchCard = ({ project, onClick, delay = 0 }: ResearchCardProps) => {
  const similarityPercent = Math.round(project.similarity * 100);
  
  return (
    <article
      onClick={onClick}
      className="research-card group slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <span className={`method-tag ${methodColors[project.method] || 'bg-muted text-muted-foreground'}`}>
          {project.method}
        </span>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${similarityPercent}%` }}
            />
          </div>
          <span className="text-xs font-medium">{similarityPercent}%</span>
        </div>
      </div>
      
      <h3 className="font-display font-semibold text-lg leading-tight mb-2 text-foreground group-hover:text-primary transition-colors">
        {project.title}
      </h3>
      
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        {project.summary}
      </p>
      
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {project.details.year} • {project.details.authors.length} authors
        </span>
        <span className="text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-sm font-medium">
          View details
          <ArrowRight className="w-4 h-4" />
        </span>
      </div>
    </article>
  );
};

export default ResearchCard;
