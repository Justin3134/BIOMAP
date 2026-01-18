import { useState, useCallback, useMemo, useEffect } from "react";
import {
  ReactFlow,
  Node,
  Edge,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import UserNode from "./nodes/UserNode";
import ClusterNode from "./nodes/ClusterNode";
import ProjectNode from "./nodes/ProjectNode";
import DetailPanel from "./DetailPanel";
import InsightPanel from "./InsightPanel";
import ComparePanel from "./ComparePanel";
import ChatSidebar from "./ChatSidebar";
import NoveltyRadar from "./NoveltyRadar";
import FeasibilityPanel from "./FeasibilityPanel";
import { mockProjects, clusters } from "@/data/mockResearch";
import { ResearchProject } from "@/types/research";
import { ProjectIntake } from "@/types/workspace";
import { ArrowLeft } from "lucide-react";

interface ResearchLandscapeProps {
  userQuery: string;
  onReset: () => void;
  intake?: ProjectIntake;
  onPinEvidence?: (project: ResearchProject) => void;
  pinnedEvidenceIds?: string[];
  hideChatSidebar?: boolean;
}

const nodeTypes = {
  userNode: UserNode,
  clusterNode: ClusterNode,
  projectNode: ProjectNode,
};

const ResearchLandscape = ({ userQuery, onReset, intake, onPinEvidence, pinnedEvidenceIds = [], hideChatSidebar }: ResearchLandscapeProps) => {
  const [selectedProject, setSelectedProject] = useState<ResearchProject | null>(null);
  const [pinnedProjects, setPinnedProjects] = useState<ResearchProject[]>([]);
  const [chatContext, setChatContext] = useState<ResearchProject[]>([]);
  const [isLocked, setIsLocked] = useState(false);

  const handleSelectProject = useCallback((project: ResearchProject) => {
    setSelectedProject(project);
  }, []);

  const handlePinProject = useCallback((project: ResearchProject) => {
    setPinnedProjects(prev => {
      const isAlreadyPinned = prev.some(p => p.id === project.id);
      if (isAlreadyPinned) {
        return prev.filter(p => p.id !== project.id);
      }
      if (prev.length >= 3) {
        return [...prev.slice(1), project];
      }
      return [...prev, project];
    });
  }, []);

  const handleRemovePin = useCallback((projectId: string) => {
    setPinnedProjects(prev => prev.filter(p => p.id !== projectId));
  }, []);

  const handleClearPins = useCallback(() => {
    setPinnedProjects([]);
  }, []);

  // Chat context handlers
  const handleAddToContext = useCallback((project: ResearchProject) => {
    setChatContext(prev => {
      const isAlreadyInContext = prev.some(p => p.id === project.id);
      if (isAlreadyInContext) {
        return prev.filter(p => p.id !== project.id);
      }
      if (prev.length >= 3) {
        return [...prev.slice(1), project];
      }
      return [...prev, project];
    });
  }, []);

  const handleRemoveFromContext = useCallback((projectId: string) => {
    setChatContext(prev => prev.filter(p => p.id !== projectId));
  }, []);

  const handleAskAboutText = useCallback((text: string, project: ResearchProject) => {
    // Add project to context if not already there
    setChatContext(prev => {
      if (!prev.some(p => p.id === project.id)) {
        if (prev.length >= 3) {
          return [...prev.slice(1), project];
        }
        return [...prev, project];
      }
      return prev;
    });
    // The chat will handle the highlighted text through its own state
    console.log("Ask about:", text, "from project:", project.title);
  }, []);

  // Build nodes and edges
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // User node at top center
    nodes.push({
      id: "user",
      type: "userNode",
      position: { x: 400, y: 0 },
      data: { label: "Your Idea", description: userQuery },
      draggable: true,
    });

    // Cluster nodes spread horizontally
    const clusterSpacing = 280;
    const clusterY = 180;
    const startX = 400 - ((clusters.length - 1) * clusterSpacing) / 2;

    clusters.forEach((cluster, index) => {
      const projectsInCluster = mockProjects.filter(p => p.cluster === cluster.id);
      
      nodes.push({
        id: `cluster-${cluster.id}`,
        type: "clusterNode",
        position: { x: startX + index * clusterSpacing, y: clusterY },
        data: { 
          label: cluster.label, 
          description: cluster.description,
          projectCount: projectsInCluster.length 
        },
        draggable: true,
      });

      // Edge from user to cluster
      edges.push({
        id: `edge-user-${cluster.id}`,
        source: "user",
        target: `cluster-${cluster.id}`,
        style: { stroke: 'hsl(220 15% 75%)', strokeWidth: 2 },
        animated: false,
      });

      // Project nodes under each cluster
      const projectY = clusterY + 140;
      const projectSpacing = 100;
      const projectStartX = startX + index * clusterSpacing - ((projectsInCluster.length - 1) * projectSpacing) / 2;

      projectsInCluster.forEach((project, pIndex) => {
        // Stagger vertically for organic look
        const yOffset = pIndex % 2 === 0 ? 0 : 60;
        
        nodes.push({
          id: `project-${project.id}`,
          type: "projectNode",
          position: { 
            x: projectStartX + pIndex * projectSpacing, 
            y: projectY + yOffset 
          },
          data: { 
            project, 
            onSelect: handleSelectProject,
            onPin: handlePinProject,
            isSelected: selectedProject?.id === project.id,
            isPinned: pinnedProjects.some(p => p.id === project.id)
          },
          draggable: true,
        });

        edges.push({
          id: `edge-cluster-${cluster.id}-${project.id}`,
          source: `cluster-${cluster.id}`,
          target: `project-${project.id}`,
          style: { stroke: 'hsl(220 15% 80%)', strokeWidth: 1.5 },
        });
      });
    });

    return { initialNodes: nodes, initialEdges: edges };
  }, [userQuery, selectedProject, pinnedProjects, handleSelectProject, handlePinProject]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes when selection or pins change
  useEffect(() => {
    setNodes(nds => 
      nds.map(node => {
        if (node.type === 'projectNode') {
          const nodeData = node.data as { project: ResearchProject };
          return {
            ...node,
            data: {
              ...node.data,
              isSelected: selectedProject?.id === nodeData.project?.id,
              isPinned: pinnedProjects.some(p => p.id === nodeData.project?.id),
              onSelect: handleSelectProject,
              onPin: handlePinProject,
            }
          };
        }
        return node;
      })
    );
  }, [selectedProject, pinnedProjects, setNodes, handleSelectProject, handlePinProject]);

  return (
    <div className="h-screen flex bg-background">
      {/* Main canvas */}
      <div className="flex-1 relative">
        {/* Back button */}
        <button
          onClick={onReset}
          className="absolute top-6 left-6 z-10 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors bg-card/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-border"
        >
          <ArrowLeft className="w-4 h-4" />
          New exploration
        </button>

        {/* Title */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 text-center">
          <h1 className="font-serif text-xl font-semibold text-foreground">
            Research Landscape
          </h1>
          <p className="text-sm text-muted-foreground">
            Drag nodes to explore · Click to see details · Pin to compare
          </p>
        </div>

        {/* React Flow Canvas */}
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={isLocked ? undefined : onNodesChange}
          onEdgesChange={isLocked ? undefined : onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          minZoom={0.3}
          maxZoom={1.5}
          defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
          panOnDrag={!isLocked}
          zoomOnScroll={!isLocked}
          zoomOnPinch={!isLocked}
          zoomOnDoubleClick={!isLocked}
          nodesDraggable={!isLocked}
        >
          <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="hsl(220 15% 85%)" />
          <Controls 
            position="bottom-right"
            className="!bg-card !border-border !shadow-sm"
            showInteractive={true}
            onInteractiveChange={(interactive) => setIsLocked(!interactive)}
          />
        </ReactFlow>

        {/* Left panels stack - scrollable container */}
        <div 
          className="absolute bottom-6 left-6 z-10 flex flex-col gap-2 max-h-[calc(100vh-120px)] overflow-y-auto scrollbar-thin" 
          style={{ marginBottom: pinnedProjects.length > 0 ? '200px' : '0' }}
        >
          <NoveltyRadar clusters={clusters} projects={mockProjects} />
          <FeasibilityPanel clusters={clusters} projects={mockProjects} />
          <InsightPanel />
        </div>

        {/* Compare Panel - bottom */}
        <ComparePanel 
          projects={pinnedProjects}
          onRemove={handleRemovePin}
          onClear={handleClearPins}
        />
      </div>

      {/* Detail panel - slides in from right when project selected */}
      {selectedProject && (
        <DetailPanel
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onAddToContext={handleAddToContext}
          onAskAboutText={handleAskAboutText}
          isInContext={chatContext.some(p => p.id === selectedProject.id)}
          onPinEvidence={onPinEvidence}
          isPinnedEvidence={pinnedEvidenceIds.includes(selectedProject.id)}
        />
      )}

      {/* Chat Sidebar removed - using WorkspaceLayout's ChatSidebar only */}
    </div>
  );
};

export default ResearchLandscape;
