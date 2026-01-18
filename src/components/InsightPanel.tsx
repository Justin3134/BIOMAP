import { patternInsights, redirectionSuggestions } from "@/data/mockResearch";
import { TrendingUp, Compass } from "lucide-react";

const InsightPanel = () => {
  return (
    <div className="insight-panel p-4 max-w-xs">
      {/* Patterns */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-primary" />
          <h3 className="font-serif font-semibold text-foreground text-sm">Common Patterns</h3>
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
          <h3 className="font-serif font-semibold text-foreground text-sm">Consider</h3>
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
  );
};

export default InsightPanel;
