import { useState } from "react";
import { Search, ArrowRight } from "lucide-react";

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
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative">
        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground">
          <Search className="w-5 h-5" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Describe your research idea..."
          className="input-research pl-14 pr-16"
        />
        <button
          type="submit"
          disabled={!query.trim() || isLoading}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-primary text-primary-foreground rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
          ) : (
            <ArrowRight className="w-5 h-5" />
          )}
        </button>
      </div>
    </form>
  );
};

export default ResearchInput;
