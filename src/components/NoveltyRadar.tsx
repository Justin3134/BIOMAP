import { useState } from "react";
import { Compass, ChevronDown, ChevronUp, Sparkles, TrendingUp, AlertCircle } from "lucide-react";
import { ResearchProject, ResearchCluster } from "@/types/research";

interface NoveltyRadarProps {
  clusters: ResearchCluster[];
  projects: ResearchProject[];
}

interface ClusterNovelty {
  cluster: ResearchCluster;
  projectCount: number;
  avgSimilarity: number;
  noveltyScore: number; // Higher = more opportunity
  status: "overcrowded" | "balanced" | "whitespace";
}

const NoveltyRadar = ({ clusters, projects }: NoveltyRadarProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Calculate novelty scores per cluster
  const clusterNovelty: ClusterNovelty[] = clusters.map(cluster => {
    const clusterProjects = projects.filter(p => p.cluster === cluster.id);
    const projectCount = clusterProjects.length;
    const avgSimilarity = projectCount > 0 
      ? clusterProjects.reduce((sum, p) => sum + p.similarity, 0) / projectCount 
      : 0;
    
    // Novelty heuristic: high relevance + few papers = high opportunity
    // Low papers + high similarity = whitespace
    // Many papers + high similarity = overcrowded
    let noveltyScore = 0;
    let status: "overcrowded" | "balanced" | "whitespace" = "balanced";
    
    if (projectCount <= 1 && avgSimilarity > 0.6) {
      noveltyScore = 90 + Math.random() * 10;
      status = "whitespace";
    } else if (projectCount >= 3) {
      noveltyScore = 20 + Math.random() * 20;
      status = "overcrowded";
    } else {
      noveltyScore = 50 + avgSimilarity * 30;
      status = "balanced";
    }

    return {
      cluster,
      projectCount,
      avgSimilarity,
      noveltyScore: Math.round(noveltyScore),
      status
    };
  });

  // Sort by novelty score (highest first)
  const sortedClusters = [...clusterNovelty].sort((a, b) => b.noveltyScore - a.noveltyScore);
  
  // Find whitespace opportunities
  const whitespaceOpportunities = sortedClusters.filter(c => c.status === "whitespace");
  const hasHighNovelty = whitespaceOpportunities.length > 0;

  // Generate whitespace suggestions
  const whitespaceSuggestions = [
    "Combine enzyme optimization with computational pre-screening for faster iteration",
    "Explore transient modification approaches to bypass regulatory constraints",
    "Apply field observation methods to validate lab-based predictions"
  ];

  return (
    <div className="bg-card/95 backdrop-blur-sm border border-border rounded-xl shadow-lg overflow-hidden w-72">
      {/* Header with high novelty alert */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 hover:bg-secondary/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-primary" />
          <span className="font-serif font-semibold text-sm text-foreground">Novelty Radar</span>
          {hasHighNovelty && (
            <span className="px-1.5 py-0.5 bg-green-500/20 text-green-600 text-[10px] font-semibold rounded-full">
              OPPORTUNITY
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      {isExpanded && (
        <div className="p-3 pt-0 space-y-3 max-h-[300px] overflow-y-auto">
          {/* Gap Map */}
          <div className="space-y-2">
            <span className="text-xs font-medium text-muted-foreground">Gap Analysis</span>
            {sortedClusters.map(item => (
              <div key={item.cluster.id} className="flex items-center gap-2">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-foreground truncate max-w-[120px]">
                      {item.cluster.label}
                    </span>
                    <span className={`text-xs font-semibold ${
                      item.status === "whitespace" ? "text-green-600" :
                      item.status === "overcrowded" ? "text-red-500" :
                      "text-yellow-600"
                    }`}>
                      {item.noveltyScore}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        item.status === "whitespace" ? "bg-green-500" :
                        item.status === "overcrowded" ? "bg-red-400" :
                        "bg-yellow-500"
                      }`}
                      style={{ width: `${item.noveltyScore}%` }}
                    />
                  </div>
                </div>
                <div className="shrink-0">
                  {item.status === "whitespace" && <Sparkles className="w-3.5 h-3.5 text-green-600" />}
                  {item.status === "overcrowded" && <AlertCircle className="w-3.5 h-3.5 text-red-500" />}
                  {item.status === "balanced" && <TrendingUp className="w-3.5 h-3.5 text-yellow-600" />}
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex gap-3 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500" /> Whitespace
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-yellow-500" /> Balanced
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-400" /> Crowded
            </span>
          </div>

          {/* Whitespace Suggestions */}
          <div className="pt-2 border-t border-border">
            <span className="text-xs font-medium text-muted-foreground block mb-2">
              Unexplored Directions
            </span>
            <ul className="space-y-1.5">
              {whitespaceSuggestions.map((suggestion, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-foreground">
                  <Sparkles className="w-3 h-3 text-green-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default NoveltyRadar;
