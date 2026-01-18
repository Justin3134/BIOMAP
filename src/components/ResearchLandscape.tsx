import { useState, useMemo } from "react";
import { Cluster, ResearchProject } from "@/types/research";
import ClusterSection from "./ClusterSection";
import ProjectDetailModal from "./ProjectDetailModal";
import { MapPin, Filter, ArrowLeft } from "lucide-react";

interface ResearchLandscapeProps {
  clusters: Cluster[];
  userQuery: string;
  onReset: () => void;
}

const ResearchLandscape = ({ clusters, userQuery, onReset }: ResearchLandscapeProps) => {
  const [selectedProject, setSelectedProject] = useState<ResearchProject | null>(null);
  const [activeFilter, setActiveFilter] = useState<number | null>(null);

  const filteredClusters = useMemo(() => {
    if (activeFilter === null) return clusters;
    return clusters.filter(c => c.id === activeFilter);
  }, [clusters, activeFilter]);

  const totalProjects = clusters.reduce((acc, c) => acc + c.projects.length, 0);

  return (
    <div className="w-full max-w-6xl mx-auto fade-in">
      {/* Header */}
      <header className="mb-8">
        <button
          onClick={onReset}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">New search</span>
        </button>
        
        <div className="flex items-start gap-3 mb-6">
          <div className="p-3 bg-primary/10 rounded-xl">
            <MapPin className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-semibold text-foreground mb-1">
              Research Landscape
            </h1>
            <p className="text-muted-foreground">
              Found <span className="font-medium text-foreground">{totalProjects} related projects</span> across {clusters.length} research directions
            </p>
          </div>
        </div>

        {/* User query display */}
        <div className="bg-secondary rounded-xl p-4 mb-6">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-1">
            Your research idea
          </span>
          <p className="text-foreground">{userQuery}</p>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <span className="text-sm text-muted-foreground flex items-center gap-1.5">
            <Filter className="w-4 h-4" />
            Filter:
          </span>
          <button
            onClick={() => setActiveFilter(null)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeFilter === null
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            All
          </button>
          {clusters.map((cluster) => (
            <button
              key={cluster.id}
              onClick={() => setActiveFilter(cluster.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                activeFilter === cluster.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {cluster.name}
            </button>
          ))}
        </div>
      </header>

      {/* Clusters grid */}
      <div className="space-y-6">
        {filteredClusters.map((cluster, index) => (
          <ClusterSection
            key={cluster.id}
            cluster={cluster}
            onProjectClick={setSelectedProject}
            animationDelay={index * 150}
          />
        ))}
      </div>

      {/* Project detail modal */}
      <ProjectDetailModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </div>
  );
};

export default ResearchLandscape;
