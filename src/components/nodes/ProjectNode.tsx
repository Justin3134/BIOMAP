import { memo, useState } from "react";
import { Handle, Position } from "@xyflow/react";
import { ResearchProject } from "@/types/research";
import { HelpCircle, X, Plus } from "lucide-react";

interface ProjectNodeData {
  project: ResearchProject;
  onSelect: (project: ResearchProject) => void;
  isSelected: boolean;
  onFindSimilar?: (project: ResearchProject) => void;
}

interface ProjectNodeProps {
  data: ProjectNodeData;
}

const ProjectNode = memo(({ data }: ProjectNodeProps) => {
  const { project, onSelect, isSelected, onFindSimilar } = data;
  const [showWhySimilar, setShowWhySimilar] = useState(false);
  const [isLoadingSimilar, setIsLoadingSimilar] = useState(false);
  const similarityPercent = Math.round(project.similarity * 100);
  
  const handleFindSimilar = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onFindSimilar && !isLoadingSimilar) {
      setIsLoadingSimilar(true);
      await onFindSimilar(project);
      setIsLoadingSimilar(false);
    }
  };
  
  return (
    <div className="relative group">
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2 !h-2 !bg-node-project-border !border-2 !border-card"
      />
      
      {/* Similarity badge - top right */}
      <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center text-xs font-semibold text-primary shadow-sm z-10">
        {similarityPercent}
      </div>

      {/* + Button at bottom - shows on hover */}
      {onFindSimilar && (
        <button
          onClick={handleFindSimilar}
          disabled={isLoadingSimilar}
          className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-primary text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center shadow-lg hover:scale-110 disabled:opacity-50 z-20"
          title="Find similar papers"
        >
          {isLoadingSimilar ? (
            <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
        </button>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2 !h-2 !bg-node-project-border !border-2 !border-card"
      />

      <div
        onClick={() => onSelect(project)}
        className={`
          bg-node-project border rounded-xl px-4 py-3 max-w-[200px] text-left node-card cursor-pointer
          transition-all duration-200
          ${isSelected 
            ? 'border-primary border-2 ring-4 ring-primary/10' 
            : 'border-node-project-border hover:border-primary/50'
          }
        `}
      >
        <h4 className="font-medium text-sm text-foreground leading-tight mb-1.5 line-clamp-2">
          {project.title}
        </h4>
        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
          {project.summary}
        </p>
        
        {/* Why similar toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowWhySimilar(!showWhySimilar);
          }}
          className="flex items-center gap-1 text-xs text-primary/70 hover:text-primary transition-colors"
        >
          <HelpCircle className="w-3 h-3" />
          <span>Why similar?</span>
        </button>
      </div>

      {/* Why Similar Popup */}
      {showWhySimilar && (
        <div 
          className="absolute top-full left-0 mt-2 w-64 bg-card border border-border rounded-lg shadow-lg p-3 z-50 fade-in"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-foreground">Similarity Breakdown</span>
            <button 
              onClick={() => setShowWhySimilar(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          <ul className="space-y-1.5">
            {project.similarityReasons.map((reason, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                {reason}
              </li>
            ))}
          </ul>
          <div className="mt-2 pt-2 border-t border-border">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Match score</span>
              <span className="font-semibold text-primary">{similarityPercent}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

ProjectNode.displayName = "ProjectNode";

export default ProjectNode;
