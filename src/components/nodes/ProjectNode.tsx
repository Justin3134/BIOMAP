import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { ResearchProject } from "@/types/research";

interface ProjectNodeData {
  project: ResearchProject;
  onSelect: (project: ResearchProject) => void;
  isSelected: boolean;
}

interface ProjectNodeProps {
  data: ProjectNodeData;
}

const ProjectNode = memo(({ data }: ProjectNodeProps) => {
  const { project, onSelect, isSelected } = data;
  const similarityPercent = Math.round(project.similarity * 100);
  
  return (
    <div className="relative group">
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2 !h-2 !bg-node-project-border !border-2 !border-card"
      />
      <button
        onClick={() => onSelect(project)}
        className={`
          bg-node-project border rounded-xl px-4 py-3 max-w-[200px] text-left node-card
          transition-all duration-200
          ${isSelected 
            ? 'border-primary border-2 ring-4 ring-primary/10' 
            : 'border-node-project-border hover:border-primary/50'
          }
        `}
      >
        {/* Similarity badge */}
        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center text-xs font-semibold text-primary shadow-sm">
          {similarityPercent}
        </div>
        
        <h4 className="font-medium text-sm text-foreground leading-tight mb-1.5 line-clamp-2">
          {project.title}
        </h4>
        <p className="text-xs text-muted-foreground line-clamp-2">
          {project.summary}
        </p>
      </button>
    </div>
  );
});

ProjectNode.displayName = "ProjectNode";

export default ProjectNode;
