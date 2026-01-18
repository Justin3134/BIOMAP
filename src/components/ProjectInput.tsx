import { useState, useCallback } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";

interface ProjectInputProps {
  onSubmit: (query: string, options: { level: string; focus: string }) => void;
  isLoading?: boolean;
}

const ProjectInput = ({ onSubmit, isLoading }: ProjectInputProps) => {
  const [query, setQuery] = useState("");
  const [showOptions, setShowOptions] = useState(false);
  const [level, setLevel] = useState("intermediate");
  const [focus, setFocus] = useState("mixed");

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSubmit(query.trim(), { level, focus });
    }
  }, [query, level, focus, onSubmit]);

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      {/* Main card */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        {/* Textarea */}
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Describe your bio project idea or research goal in plain language…"
          className="research-input min-h-[140px] mb-4"
          rows={5}
        />

        {/* Optional settings toggle */}
        <button
          type="button"
          onClick={() => setShowOptions(!showOptions)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ChevronDown className={`w-4 h-4 transition-transform ${showOptions ? 'rotate-180' : ''}`} />
          Advanced options
        </button>

        {/* Optional settings */}
        {showOptions && (
          <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-secondary/30 rounded-xl fade-in">
            {/* Research level */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-2">
                Research Level
              </label>
              <div className="flex gap-2">
                {["beginner", "intermediate", "advanced"].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setLevel(opt)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      level === opt 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {opt.charAt(0).toUpperCase() + opt.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Focus type */}
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-2">
                Focus Type
              </label>
              <div className="flex gap-2">
                {["experimental", "computational", "mixed"].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setFocus(opt)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      focus === opt 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {opt.charAt(0).toUpperCase() + opt.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={!query.trim() || isLoading}
          className="btn-primary w-full"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Analyzing research landscape…
            </span>
          ) : (
            <>
              Map Similar Research
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default ProjectInput;
