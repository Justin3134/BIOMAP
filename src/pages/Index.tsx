import { useState, useCallback } from "react";
import ResearchInput from "@/components/ResearchInput";
import ResearchLandscape from "@/components/ResearchLandscape";
import EmptyState from "@/components/EmptyState";
import { clusters } from "@/data/mockResearch";
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
    }, 1500);
  }, []);

  const handleReset = useCallback(() => {
    setHasSearched(false);
    setUserQuery("");
  }, []);

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-xl">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-lg font-semibold text-foreground">
                Bio Research Explorer
              </h1>
              <p className="text-xs text-muted-foreground">
                Discover similar research landscapes
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="container mx-auto px-4 py-8">
        {!hasSearched ? (
          <div className="max-w-4xl mx-auto">
            {/* Hero section */}
            <section className="text-center mb-12 pt-8">
              <h2 className="font-display text-4xl md:text-5xl font-semibold text-foreground mb-4">
                Map Your Research<br />
                <span className="text-primary">Landscape</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Enter your bio research idea and explore a visual map of related projects, 
                papers, and approaches clustered by methodology
              </p>
            </section>

            {/* Search input */}
            <div className="mb-16">
              <ResearchInput onSubmit={handleSearch} isLoading={isLoading} />
            </div>

            {/* Empty state illustration */}
            <EmptyState />
          </div>
        ) : (
          <ResearchLandscape
            clusters={clusters}
            userQuery={userQuery}
            onReset={handleReset}
          />
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-border mt-auto py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          Explore bio research similarity maps
        </div>
      </footer>
    </main>
  );
};

export default Index;
