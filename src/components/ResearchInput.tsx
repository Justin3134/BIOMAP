import { useState } from "react";
import { Search, Sparkles } from "lucide-react";

interface ResearchInputProps {
  onSubmit: (query: string) => void;
  isLoading?: boolean;
}

const ResearchInput = ({ onSubmit, isLoading }: ResearchInputProps) => {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSubmit(query.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto">
      <div className="relative">
        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground">
          <Search className="w-5 h-5" />
        </div>
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Describe your bio research idea..."
          className="input-research pl-14 pr-36 min-h-[120px] resize-none"
          rows={3}
        />
        <button
          type="submit"
          disabled={!query.trim() || isLoading}
          className="btn-explore absolute right-4 bottom-4 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Explore
            </>
          )}
        </button>
      </div>
      <p className="text-sm text-muted-foreground mt-3 text-center">
        Enter a research concept to discover related projects and papers
      </p>
    </form>
  );
};

export default ResearchInput;
