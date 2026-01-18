import { useState } from "react";
import { Settings2, ChevronDown, ChevronUp, Check, AlertTriangle, X, Beaker, Clock, DollarSign, Cpu } from "lucide-react";
import { ResearchCluster, ResearchProject } from "@/types/research";

interface Constraint {
  id: string;
  label: string;
  icon: typeof Beaker;
}

interface FeasibilityPanelProps {
  clusters: ResearchCluster[];
  projects: ResearchProject[];
}

const CONSTRAINTS: Constraint[] = [
  { id: "pcr", label: "PCR Machine", icon: Beaker },
  { id: "culture", label: "Cell Culture Hood", icon: Beaker },
  { id: "sequencing", label: "Sequencing Access", icon: Cpu },
  { id: "compute", label: "Compute Resources", icon: Cpu },
  { id: "budget_low", label: "Budget < $10K", icon: DollarSign },
  { id: "budget_mid", label: "Budget $10K-50K", icon: DollarSign },
  { id: "time_short", label: "< 6 months", icon: Clock },
  { id: "time_mid", label: "6-12 months", icon: Clock },
];

// Equipment requirements per approach type
const APPROACH_REQUIREMENTS: Record<string, string[]> = {
  "CRISPR-Cas9 gene editing": ["pcr", "culture", "sequencing"],
  "Lipid nanoparticle delivery": ["pcr", "culture"],
  "Directed evolution": ["pcr", "culture", "compute"],
  "Immobilized enzyme systems": ["culture"],
  "AI-guided rational design": ["compute", "sequencing"],
  "Genome-scale metabolic modeling": ["compute"],
  "Longitudinal field observation": [],
  "Engineered microbe field trials": ["pcr", "culture"],
};

interface ClusterFeasibility {
  cluster: ResearchCluster;
  status: "feasible" | "upgrades_needed" | "not_feasible";
  missingRequirements: string[];
  projects: ResearchProject[];
}

const FeasibilityPanel = ({ clusters, projects }: FeasibilityPanelProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedConstraints, setSelectedConstraints] = useState<string[]>(["compute", "budget_mid", "time_mid"]);

  const toggleConstraint = (id: string) => {
    setSelectedConstraints(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  // Calculate feasibility per cluster
  const clusterFeasibility: ClusterFeasibility[] = clusters.map(cluster => {
    const clusterProjects = projects.filter(p => p.cluster === cluster.id);
    
    // Get all requirements for this cluster's approaches
    const allRequirements = new Set<string>();
    clusterProjects.forEach(project => {
      const reqs = APPROACH_REQUIREMENTS[project.details.approach] || [];
      reqs.forEach(r => allRequirements.add(r));
    });

    // Check what's missing
    const missingRequirements = [...allRequirements].filter(r => !selectedConstraints.includes(r));
    
    // Determine status
    let status: "feasible" | "upgrades_needed" | "not_feasible" = "feasible";
    if (missingRequirements.length > 2) {
      status = "not_feasible";
    } else if (missingRequirements.length > 0) {
      status = "upgrades_needed";
    }

    return {
      cluster,
      status,
      missingRequirements,
      projects: clusterProjects
    };
  });

  const feasibleCount = clusterFeasibility.filter(c => c.status === "feasible").length;

  return (
    <div className="bg-card/95 backdrop-blur-sm border border-border rounded-xl shadow-lg overflow-hidden w-72">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 hover:bg-secondary/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-primary" />
          <span className="font-serif font-semibold text-sm text-foreground">Feasibility Check</span>
          <span className="px-1.5 py-0.5 bg-primary/20 text-primary text-[10px] font-semibold rounded-full">
            {feasibleCount}/{clusters.length}
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      {isExpanded && (
        <div className="p-3 pt-0 space-y-3">
          {/* Constraints Selection */}
          <div className="space-y-2">
            <span className="text-xs font-medium text-muted-foreground">What you have:</span>
            <div className="flex flex-wrap gap-1.5">
              {CONSTRAINTS.map(constraint => {
                const isSelected = selectedConstraints.includes(constraint.id);
                return (
                  <button
                    key={constraint.id}
                    onClick={() => toggleConstraint(constraint.id)}
                    className={`px-2 py-1 text-[10px] rounded-full transition-colors flex items-center gap-1 ${
                      isSelected 
                        ? "bg-primary/20 text-primary border border-primary/30" 
                        : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                    }`}
                  >
                    <constraint.icon className="w-2.5 h-2.5" />
                    {constraint.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Feasibility Results */}
          <div className="space-y-2 pt-2 border-t border-border">
            <span className="text-xs font-medium text-muted-foreground">Branch Feasibility</span>
            {clusterFeasibility.map(item => (
              <div key={item.cluster.id} className="p-2 bg-secondary/50 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-foreground">{item.cluster.label}</span>
                  <span className={`flex items-center gap-1 text-[10px] font-semibold ${
                    item.status === "feasible" ? "text-green-600" :
                    item.status === "upgrades_needed" ? "text-yellow-600" :
                    "text-red-500"
                  }`}>
                    {item.status === "feasible" && <><Check className="w-3 h-3" /> Feasible</>}
                    {item.status === "upgrades_needed" && <><AlertTriangle className="w-3 h-3" /> Upgrades</>}
                    {item.status === "not_feasible" && <><X className="w-3 h-3" /> Not feasible</>}
                  </span>
                </div>
                {item.missingRequirements.length > 0 && (
                  <div className="mt-1">
                    <span className="text-[10px] text-muted-foreground">Missing: </span>
                    <span className="text-[10px] text-yellow-600">
                      {item.missingRequirements.map(r => 
                        CONSTRAINTS.find(c => c.id === r)?.label || r
                      ).join(", ")}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Recommendation */}
          <div className="p-2 bg-primary/5 border border-primary/20 rounded-lg">
            <span className="text-xs font-medium text-primary block mb-1">Recommendation</span>
            <p className="text-[10px] text-foreground leading-relaxed">
              {feasibleCount === clusters.length 
                ? "All approaches are feasible with your current resources!"
                : feasibleCount > 0
                  ? `Focus on ${clusterFeasibility.filter(c => c.status === "feasible")[0]?.cluster.label} for fastest results with current setup.`
                  : "Consider acquiring compute resources or sequencing access to unlock more approaches."
              }
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeasibilityPanel;
