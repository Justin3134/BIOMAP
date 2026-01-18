import { useState } from "react";
import { patternInsights, redirectionSuggestions } from "@/data/mockResearch";
import { TrendingUp, Compass, ChevronDown, ChevronUp } from "lucide-react";

const InsightPanel = () => {
  const [isExpanded, setIsExpanded] = useState(true);

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
        <div className="px-4 pb-4 fade-in">
          {/* Patterns */}
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-primary" />
              <h3 className="font-medium text-foreground text-xs">Common Patterns</h3>
            </div>
            <ul className="space-y-2">
              {patternInsights.slice(0, 3).map((insight, i) => (
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
              {redirectionSuggestions.slice(0, 2).map((suggestion, i) => (
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
