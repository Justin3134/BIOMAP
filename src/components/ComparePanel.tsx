import { ResearchProject } from "@/types/research";
import { X, Pin, CheckCircle, XCircle, Clock, DollarSign, Gauge } from "lucide-react";

interface ComparePanelProps {
  projects: ResearchProject[];
  onRemove: (projectId: string) => void;
  onClear: () => void;
}

const ComparePanel = ({ projects, onRemove, onClear }: ComparePanelProps) => {
  if (projects.length === 0) return null;

  const comparisonRows = [
    { 
      label: "Approach", 
      icon: Gauge,
      getValue: (p: ResearchProject) => p.details.approach 
    },
    { 
      label: "Difficulty", 
      icon: Gauge,
      getValue: (p: ResearchProject) => p.details.difficulty,
      getColor: (val: string) => 
        val === "Low" ? "text-green-600" : val === "Medium" ? "text-yellow-600" : "text-red-500"
    },
    { 
      label: "Cost", 
      icon: DollarSign,
      getValue: (p: ResearchProject) => p.details.cost,
      getColor: (val: string) => 
        val === "Low" ? "text-green-600" : val === "Medium" ? "text-yellow-600" : "text-red-500"
    },
    { 
      label: "Timeframe", 
      icon: Clock,
      getValue: (p: ResearchProject) => p.details.timeframe 
    },
    { 
      label: "Key Success", 
      icon: CheckCircle,
      getValue: (p: ResearchProject) => p.details.whatWorked[0] 
    },
    { 
      label: "Main Challenge", 
      icon: XCircle,
      getValue: (p: ResearchProject) => p.details.whatDidntWork[0] 
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border shadow-lg z-40 slide-up">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Pin className="w-4 h-4 text-primary" />
          <h3 className="font-serif font-semibold text-foreground">
            Compare {projects.length} Project{projects.length > 1 ? 's' : ''}
          </h3>
        </div>
        <button
          onClick={onClear}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Clear all
        </button>
      </div>

      {/* Comparison Table */}
      <div className="px-6 py-4 overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider pb-3 w-32">
                Attribute
              </th>
              {projects.map((project) => (
                <th key={project.id} className="text-left pb-3 px-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-primary">
                          {Math.round(project.similarity * 100)}%
                        </span>
                      </div>
                      <h4 className="font-medium text-sm text-foreground line-clamp-1">
                        {project.title}
                      </h4>
                      <span className="text-xs text-muted-foreground">
                        {project.clusterLabel}
                      </span>
                    </div>
                    <button
                      onClick={() => onRemove(project.id)}
                      className="p-1 hover:bg-muted rounded transition-colors shrink-0"
                    >
                      <X className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {comparisonRows.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-t border-border/50">
                <td className="py-3 text-xs font-medium text-muted-foreground flex items-center gap-2">
                  <row.icon className="w-3.5 h-3.5" />
                  {row.label}
                </td>
                {projects.map((project) => {
                  const value = row.getValue(project);
                  const colorClass = row.getColor ? row.getColor(value) : "text-foreground";
                  return (
                    <td key={project.id} className={`py-3 px-3 text-sm ${colorClass}`}>
                      {value}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Hint */}
      {projects.length < 3 && (
        <div className="px-6 pb-3">
          <p className="text-xs text-muted-foreground">
            Pin up to 3 projects for comparison. Click the pin icon on any project node.
          </p>
        </div>
      )}
    </div>
  );
};

export default ComparePanel;
