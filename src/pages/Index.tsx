import { useState, useCallback } from "react";
import ProjectInput from "@/components/ProjectInput";
import ResearchLandscape from "@/components/ResearchLandscape";
import { Leaf } from "lucide-react";

const Index = () => {
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userQuery, setUserQuery] = useState("");

  const handleSearch = useCallback((query: string, options: { level: string; focus: string }) => {
    setIsLoading(true);
    setUserQuery(query);
    
    // Thoughtful loading delay
    setTimeout(() => {
      setIsLoading(false);
      setHasSearched(true);
    }, 1800);
  }, []);

  const handleReset = useCallback(() => {
    setHasSearched(false);
    setUserQuery("");
  }, []);

  if (hasSearched) {
    return <ResearchLandscape userQuery={userQuery} onReset={handleReset} />;
  }

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      {/* Centered content */}
      <div className="w-full max-w-2xl text-center fade-in">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Leaf className="w-6 h-6 text-primary" />
          </div>
          <span className="font-serif text-xl font-semibold text-foreground">
            BioPath Explorer
          </span>
        </div>

        {/* Headline */}
        <h1 className="font-serif text-4xl md:text-5xl font-semibold text-foreground mb-4 leading-tight">
          Explore Your Research<br />Landscape
        </h1>
        <p className="text-lg text-muted-foreground mb-10 max-w-lg mx-auto">
          Discover similar projects, understand what worked and what didn't, 
          and find your research direction.
        </p>

        {/* Input form */}
        <ProjectInput onSubmit={handleSearch} isLoading={isLoading} />

        {/* Subtle footer hint */}
        <p className="text-sm text-muted-foreground/50 mt-12">
          Not another AI chat. A research map.
        </p>
      </div>
    </main>
  );
};

export default Index;
