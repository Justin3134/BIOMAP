import { useState, useMemo } from "react";
import { ResearchProject, ResearchCluster } from "@/types/research";
import { TrendingUp, Compass, ChevronDown, ChevronUp } from "lucide-react";

interface InsightPanelProps {
  clusters: ResearchCluster[];
  projects: ResearchProject[];
}

const InsightPanel = ({ clusters, projects }: InsightPanelProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Generate insights from actual research data
  const insights = useMemo(() => {
    // Safety check
    if (!clusters || !projects || clusters.length === 0 || projects.length === 0) {
      return { patterns: [], suggestions: ["No data available yet"] };
    }
    
    // Find common patterns across clusters
    const patterns = clusters.map(cluster => {
      const clusterProjects = projects.filter(p => p.cluster === cluster.id);
      return {
        pattern: cluster.label,
        frequency: `${clusterProjects.length} paper${clusterProjects.length !== 1 ? 's' : ''} found`,
        avgSimilarity: clusterProjects.length > 0 
          ? clusterProjects.reduce((sum, p) => sum + p.similarity, 0) / clusterProjects.length 
          : 0
      };
    }).sort((a, b) => b.avgSimilarity - a.avgSimilarity);

    // Generate suggestions based on cluster distribution
    const suggestions: string[] = [];
    
    // Find underexplored areas
    const smallClusters = clusters.filter(c => 
      projects.filter(p => p.cluster === c.id).length <= 2
    );
    if (smallClusters.length > 0) {
      suggestions.push(`${smallClusters[0].label} appears underexplored - potential for novel contributions`);
    }

    // Find highly cited approaches
    const highCitationProjects = projects.filter(p => p.details?.year && p.details.year >= 2020);
    if (highCitationProjects.length > 0) {
      suggestions.push(`Recent advances (2020+) focus on ${highCitationProjects[0].clusterLabel?.toLowerCase()}`);
    }

    // Suggest combining approaches
    if (clusters.length >= 2) {
      suggestions.push(`Consider combining ${clusters[0].label} with ${clusters[1].label} for a hybrid approach`);
    }

    return { patterns, suggestions };
  }, [clusters, projects]);

  return (
    <div className="insight-panel overflow-hidden transition-all duration-300">
      {/* Header - always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
      >
        <span className="font-serif font-semibold text-foreground text-sm">
          Insights
        </span>
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      {/* Collapsible content */}
      {isExpanded && (
        <div className="px-4 pb-4 fade-in max-h-[250px] overflow-y-auto">
          {/* Patterns */}
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-primary" />
              <h3 className="font-medium text-foreground text-xs">Common Patterns</h3>
            </div>
            <ul className="space-y-2">
              {insights.patterns.slice(0, 3).map((insight, i) => (
                <li key={i} className="text-xs text-muted-foreground">
                  <span className="text-foreground">{insight.pattern}</span>
                  <span className="block text-muted-foreground/70 mt-0.5">{insight.frequency}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Redirections */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Compass className="w-4 h-4 text-accent" />
              <h3 className="font-medium text-foreground text-xs">Consider</h3>
            </div>
            <ul className="space-y-2">
              {insights.suggestions.slice(0, 2).map((suggestion, i) => (
                <li key={i} className="text-xs text-muted-foreground leading-relaxed">
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default InsightPanel;
