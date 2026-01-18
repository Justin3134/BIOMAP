import { Dna, FlaskConical, Brain, Microscope } from "lucide-react";

const EmptyState = () => {
  return (
    <div className="text-center py-12">
      <div className="flex justify-center gap-6 mb-8">
        <div className="p-4 bg-cluster-1 rounded-2xl animate-float" style={{ animationDelay: "0s" }}>
          <Dna className="w-8 h-8 text-cluster-border-1" />
        </div>
        <div className="p-4 bg-cluster-2 rounded-2xl animate-float" style={{ animationDelay: "0.5s" }}>
          <FlaskConical className="w-8 h-8 text-cluster-border-2" />
        </div>
        <div className="p-4 bg-cluster-3 rounded-2xl animate-float" style={{ animationDelay: "1s" }}>
          <Brain className="w-8 h-8 text-cluster-border-3" />
        </div>
        <div className="p-4 bg-cluster-4 rounded-2xl animate-float" style={{ animationDelay: "1.5s" }}>
          <Microscope className="w-8 h-8 text-cluster-border-4" />
        </div>
      </div>
      
      <h2 className="font-display text-2xl font-semibold text-foreground mb-2">
        Discover Related Research
      </h2>
      <p className="text-muted-foreground max-w-md mx-auto">
        Enter your bio research idea above to explore a visual map of related projects, papers, and approaches
      </p>
    </div>
  );
};

export default EmptyState;
