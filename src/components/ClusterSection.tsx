import { Cluster, ResearchProject } from "@/types/research";
import ResearchCard from "./ResearchCard";
import { Layers } from "lucide-react";

interface ClusterSectionProps {
  cluster: Cluster;
  onProjectClick: (project: ResearchProject) => void;
  animationDelay: number;
}

const clusterStyles: Record<number, string> = {
  1: "bg-cluster-1 border-l-4 border-l-cluster-border-1",
  2: "bg-cluster-2 border-l-4 border-l-cluster-border-2",
  3: "bg-cluster-3 border-l-4 border-l-cluster-border-3",
  4: "bg-cluster-4 border-l-4 border-l-cluster-border-4",
  5: "bg-cluster-5 border-l-4 border-l-cluster-border-5",
};

const ClusterSection = ({ cluster, onProjectClick, animationDelay }: ClusterSectionProps) => {
  return (
    <section 
      className={`cluster-container ${clusterStyles[cluster.id]} slide-up`}
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <header className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-card rounded-lg shadow-soft-sm">
          <Layers className="w-5 h-5 text-foreground" />
        </div>
        <div>
          <h2 className="font-display text-xl font-semibold text-foreground">
            {cluster.name}
          </h2>
          <p className="text-sm text-muted-foreground">{cluster.description}</p>
        </div>
        <span className="ml-auto bg-card px-3 py-1 rounded-full text-sm font-medium text-muted-foreground shadow-soft-sm">
          {cluster.projects.length} projects
        </span>
      </header>
      
      <div className="grid gap-4 md:grid-cols-2">
        {cluster.projects.map((project, index) => (
          <ResearchCard
            key={project.id}
            project={project}
            onClick={() => onProjectClick(project)}
            delay={animationDelay + (index + 1) * 100}
          />
        ))}
      </div>
    </section>
  );
};

export default ClusterSection;
