import { useState, useCallback } from "react";
import ResearchInput from "@/components/ResearchInput";
import ResearchTree from "@/components/ResearchTree";
import { Sparkles } from "lucide-react";

const Index = () => {
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userQuery, setUserQuery] = useState("");

  const handleSearch = useCallback((query: string) => {
    setIsLoading(true);
    setUserQuery(query);
    
    // Simulate API call delay
    setTimeout(() => {
      setIsLoading(false);
      setHasSearched(true);
    }, 1200);
  }, []);

  const handleReset = useCallback(() => {
    setHasSearched(false);
    setUserQuery("");
  }, []);

  if (hasSearched) {
    return <ResearchTree userQuery={userQuery} onReset={handleReset} />;
  }

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      {/* Minimal centered layout */}
      <div className="w-full max-w-2xl text-center">
        {/* Logo/Title */}
        <div className="flex items-center justify-center gap-3 mb-12">
          <div className="p-3 bg-primary rounded-2xl">
            <Sparkles className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="font-display text-2xl font-semibold text-foreground">
            Bio Research Explorer
          </h1>
        </div>

        {/* Main heading */}
        <h2 className="font-display text-4xl md:text-5xl font-semibold text-foreground mb-4 leading-tight">
          Map Your Research Idea
        </h2>
        <p className="text-lg text-muted-foreground mb-12">
          Discover related projects as a visual branch map
        </p>

        {/* Input */}
        <ResearchInput onSubmit={handleSearch} isLoading={isLoading} />

        {/* Subtle hint */}
        <p className="text-sm text-muted-foreground/60 mt-16">
          Try: "CRISPR gene therapy for cancer" or "microbiome and mental health"
        </p>
      </div>
    </main>
  );
};

export default Index;
