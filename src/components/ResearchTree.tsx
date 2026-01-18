import { useState } from "react";
import { ResearchProject } from "@/types/research";
import ProjectDetailModal from "./ProjectDetailModal";
import { mockProjects } from "@/data/mockResearch";

interface ResearchTreeProps {
  userQuery: string;
  onReset: () => void;
}

const ResearchTree = ({ userQuery, onReset }: ResearchTreeProps) => {
  const [selectedProject, setSelectedProject] = useState<ResearchProject | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Group projects by cluster for branch layout
  const clusters = [
    { id: 1, name: "Genetic Therapies", projects: mockProjects.filter(p => p.cluster === 1) },
    { id: 2, name: "In Vitro Models", projects: mockProjects.filter(p => p.cluster === 2) },
    { id: 3, name: "Microbiome", projects: mockProjects.filter(p => p.cluster === 3) },
    { id: 4, name: "Computational", projects: mockProjects.filter(p => p.cluster === 4) },
    { id: 5, name: "Drug Delivery", projects: mockProjects.filter(p => p.cluster === 5) },
  ];

  const clusterColors = [
    "from-cluster-border-1 to-cluster-border-1/60",
    "from-cluster-border-2 to-cluster-border-2/60",
    "from-cluster-border-3 to-cluster-border-3/60",
    "from-cluster-border-4 to-cluster-border-4/60",
    "from-cluster-border-5 to-cluster-border-5/60",
  ];

  const nodeBgColors = [
    "bg-cluster-1 border-cluster-border-1",
    "bg-cluster-2 border-cluster-border-2",
    "bg-cluster-3 border-cluster-border-3",
    "bg-cluster-4 border-cluster-border-4",
    "bg-cluster-5 border-cluster-border-5",
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Back button */}
      <button
        onClick={onReset}
        className="fixed top-6 left-6 z-50 text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        New search
      </button>

      {/* Tree container */}
      <div className="flex-1 flex flex-col items-center pt-20 pb-32 px-4 overflow-x-auto">
        
        {/* Root node - User's idea */}
        <div className="relative mb-8 animate-fade-in">
          <div className="bg-primary text-primary-foreground px-8 py-4 rounded-2xl shadow-soft-lg max-w-md text-center">
            <span className="text-xs uppercase tracking-wider opacity-70 block mb-1">Your Research Idea</span>
            <p className="font-medium">{userQuery}</p>
          </div>
          {/* Main trunk line */}
          <div className="absolute left-1/2 -translate-x-1/2 top-full w-0.5 h-12 bg-gradient-to-b from-primary to-border" />
        </div>

        {/* Branch junction */}
        <div className="relative w-full max-w-5xl mb-8" style={{ animationDelay: '200ms' }}>
          {/* Horizontal connector line */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 bg-border" style={{ width: '80%' }} />
          
          {/* Branch labels */}
          <div className="flex justify-around pt-6 animate-fade-in" style={{ animationDelay: '300ms' }}>
            {clusters.map((cluster, index) => (
              <div key={cluster.id} className="flex flex-col items-center">
                {/* Vertical connector from horizontal line */}
                <div className={`w-0.5 h-6 -mt-6 bg-gradient-to-b ${clusterColors[index]}`} />
                {/* Cluster label node */}
                <div className={`${nodeBgColors[index]} border-2 px-4 py-2 rounded-xl text-sm font-medium text-foreground whitespace-nowrap`}>
                  {cluster.name}
                </div>
                {/* Line down to projects */}
                <div className={`w-0.5 h-8 bg-gradient-to-b ${clusterColors[index]}`} />
              </div>
            ))}
          </div>
        </div>

        {/* Research nodes grid */}
        <div className="flex justify-around w-full max-w-6xl gap-4">
          {clusters.map((cluster, clusterIndex) => (
            <div 
              key={cluster.id} 
              className="flex flex-col items-center gap-3 flex-1 animate-fade-in"
              style={{ animationDelay: `${400 + clusterIndex * 100}ms` }}
            >
              {cluster.projects.map((project, projectIndex) => {
                const isHovered = hoveredId === project.id;
                const similarityPercent = Math.round(project.similarity * 100);
                
                return (
                  <div key={project.id} className="flex flex-col items-center">
                    {/* Connector line between nodes */}
                    {projectIndex > 0 && (
                      <div className={`w-0.5 h-3 bg-gradient-to-b ${clusterColors[clusterIndex]} opacity-40`} />
                    )}
                    
                    {/* Research node */}
                    <button
                      onClick={() => setSelectedProject(project)}
                      onMouseEnter={() => setHoveredId(project.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      className={`
                        relative group w-full max-w-[180px] p-4 rounded-xl border-2 text-left
                        transition-all duration-300 cursor-pointer
                        ${nodeBgColors[clusterIndex]}
                        ${isHovered ? 'scale-105 shadow-soft-xl -translate-y-1' : 'shadow-soft-md hover:shadow-soft-lg'}
                      `}
                    >
                      {/* Similarity indicator */}
                      <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-card border-2 border-border flex items-center justify-center text-xs font-bold text-primary shadow-soft-sm">
                        {similarityPercent}
                      </div>
                      
                      <h4 className="font-medium text-sm leading-tight text-foreground mb-2 line-clamp-2">
                        {project.title}
                      </h4>
                      <span className="text-xs text-muted-foreground">
                        {project.method}
                      </span>
                      
                      {/* Hover expand indicator */}
                      <div className={`absolute inset-0 rounded-xl border-2 border-primary/50 transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />
                    </button>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-card/90 backdrop-blur-sm px-6 py-3 rounded-full shadow-soft-lg border border-border flex items-center gap-4 text-sm">
        <span className="text-muted-foreground">Similarity:</span>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary/30" />
          <span className="text-xs text-muted-foreground">Lower</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary" />
          <span className="text-xs text-muted-foreground">Higher</span>
        </div>
      </div>

      <ProjectDetailModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </div>
  );
};

export default ResearchTree;
