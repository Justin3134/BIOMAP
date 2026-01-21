import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import {
  ReactFlow,
  Node,
  Edge,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  NodeChange,
  NodePositionChange,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import UserNode from "./nodes/UserNode";
import ClusterNode from "./nodes/ClusterNode";
import ProjectNode from "./nodes/ProjectNode";
import DetailPanel from "./DetailPanel";
import InsightPanel from "./InsightPanel";
import NoveltyRadar from "./NoveltyRadar";
import FeasibilityPanel from "./FeasibilityPanel";
import { mockProjects, clusters } from "@/data/mockResearch";
import { ResearchProject } from "@/types/research";
import { ProjectIntake } from "@/types/workspace";
import { ArrowLeft, Loader2 } from "lucide-react";
import { researchAPI } from "@/lib/api";

interface ResearchLandscapeProps {
  userQuery: string;
  onReset: () => void;
  intake?: ProjectIntake & { projectId?: string };
  onPinEvidence?: (project: ResearchProject) => void;
  pinnedEvidenceIds?: string[];
  hideChatSidebar?: boolean;
  chatContext?: ResearchProject[];
  onAddToContext?: (project: ResearchProject) => void;
}

const nodeTypes = {
  userNode: UserNode,
  clusterNode: ClusterNode,
  projectNode: ProjectNode,
};

const ResearchLandscape = ({ userQuery, onReset, intake, onPinEvidence, pinnedEvidenceIds = [], hideChatSidebar, chatContext = [], onAddToContext }: ResearchLandscapeProps) => {
  const [selectedProject, setSelectedProject] = useState<ResearchProject | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [researchClusters, setResearchClusters] = useState<any[]>([]);
  const [researchProjects, setResearchProjects] = useState<ResearchProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Store node positions in localStorage to persist across tab changes
  const storageKey = `biomap-positions-${intake?.projectId || 'default'}`;
  const savedPositionsRef = useRef<Map<string, { x: number; y: number }>>(new Map());

  // Fetch real research map from backend
  useEffect(() => {
    const fetchResearchMap = async () => {
      if (!intake?.projectId) {
        // No projectId - use mock data
        setResearchClusters(clusters);
        setResearchProjects(mockProjects);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        const map = await researchAPI.getMap(intake.projectId);
        
        // Check if we have any papers
        if (!map.clusters || map.clusters.length === 0) {
          console.warn("Research map is empty, using mock data as fallback");
          setError("No papers found. Using example data. Try a different research topic or wait a moment for API rate limits to reset.");
          setResearchClusters(clusters);
          setResearchProjects(mockProjects);
          setIsLoading(false);
          return;
        }
        
        // Transform backend data to frontend format
        const transformedClusters = map.clusters.map((cluster: any) => ({
          id: cluster.branch_id,
          label: cluster.label,
          description: `${cluster.papers.length} papers (avg similarity: ${(cluster.avgSimilarity * 100).toFixed(0)}%)`,
        }));

        const transformedProjects: ResearchProject[] = [];
        map.clusters.forEach((cluster: any) => {
          cluster.papers.forEach((paper: any) => {
            transformedProjects.push({
              id: paper.paperId,
              title: paper.title,
              year: paper.year,
              authors: paper.authors || "Unknown",
              similarity: paper.similarity,
              summary: paper.abstract || "No abstract available",
              abstract: paper.abstract || "No abstract available",
              cluster: cluster.branch_id,
              venue: paper.venue || "Unknown",
              citationCount: paper.citationCount || 0,
              approach: "Research approach not specified",
              methods: [],
              findings: [],
              feasibility: { score: 0.7, factors: [] },
              limitations: [],
              potentialImpact: "",
            });
          });
        });

        console.log(`📊 Loaded ${transformedClusters.length} clusters with ${transformedProjects.length} papers`);
        setResearchClusters(transformedClusters);
        setResearchProjects(transformedProjects);
        setIsLoading(false);
      } catch (err: any) {
        console.error("Failed to load research map:", err);
        setError(`Failed to load research map: ${err.message}`);
        // Fallback to mock data
        setResearchClusters(clusters);
        setResearchProjects(mockProjects);
        setIsLoading(false);
      }
    };

    fetchResearchMap();
  }, [intake?.projectId]);

  const handleSelectProject = useCallback((project: ResearchProject) => {
    setSelectedProject(project);
    console.log("Selected project:", project.title);
  }, []);

  // Handle finding similar papers from the + button on ProjectNode
  const handleFindSimilarFromNode = useCallback(async (project: ResearchProject) => {
    console.log("🔍 Finding similar papers for:", project.title);
    
    try {
      const similarPapers = await researchAPI.findSimilar(
        project.id,
        project.title,
        project.abstract || project.summary,
        5
      );
      
      if (similarPapers && similarPapers.length > 0) {
        console.log(`✅ Found ${similarPapers.length} similar papers`);
        
        // Transform similar papers to ResearchProject format
        const newProjects: ResearchProject[] = similarPapers.map((paper: any, idx: number) => ({
          id: paper.paperId,
          title: paper.title,
          year: paper.year || new Date().getFullYear(),
          authors: paper.authors || "Unknown",
          similarity: paper.similarity || 0.8,
          summary: paper.abstract || "No abstract available",
          abstract: paper.abstract || "No abstract available",
          cluster: `similar_${project.id}`, // Mark as similar to this project
          venue: paper.venue || "Unknown",
          citationCount: paper.citationCount || 0,
          approach: "Similar research approach",
          methods: [],
          findings: [],
          feasibility: { score: 0.7, factors: [] },
          limitations: [],
          potentialImpact: "",
        }));
        
        // Add to research projects
        setResearchProjects(prev => [...prev, ...newProjects]);
        
        console.log(`✅ Added ${newProjects.length} similar paper nodes`);
      } else {
        console.warn('No similar papers found');
      }
    } catch (error) {
      console.error('Failed to find similar papers:', error);
    }
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
    const startX = 400 - ((researchClusters.length - 1) * clusterSpacing) / 2;

    researchClusters.forEach((cluster, index) => {
      const projectsInCluster = researchProjects.filter(p => p.cluster === cluster.id);
      
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
            isSelected: selectedProject?.id === project.id,
            onFindSimilar: handleFindSimilarFromNode,
          },
          draggable: true,
        });

        edges.push({
          id: `edge-cluster-${cluster.id}-${project.id}`,
          source: `cluster-${cluster.id}`,
          target: `project-${project.id}`,
          style: { stroke: 'hsl(220 15% 80%)', strokeWidth: 1.5 },
        });

        // Add similar papers below this project if they exist
        const similarPapers = researchProjects.filter(p => 
          p.cluster === `similar_${project.id}`
        );
        
        if (similarPapers.length > 0) {
          // Position similar papers directly below the parent paper
          const parentX = projectStartX + pIndex * projectSpacing;
          const parentY = projectY + yOffset;
          const similarY = parentY + 150; // 150px below parent
          const similarSpacing = 90;
          const similarStartX = parentX - ((similarPapers.length - 1) * similarSpacing) / 2;
          
          similarPapers.forEach((similarPaper, sIndex) => {
            nodes.push({
              id: `project-${similarPaper.id}`,
              type: "projectNode",
              position: {
                x: similarStartX + sIndex * similarSpacing,
                y: similarY,
              },
              data: {
                project: similarPaper,
                onSelect: handleSelectProject,
                isSelected: selectedProject?.id === similarPaper.id,
                onFindSimilar: handleFindSimilarFromNode,
              },
              draggable: true,
            });

            // Connect similar paper to parent
            edges.push({
              id: `edge-similar-${project.id}-${similarPaper.id}`,
              source: `project-${project.id}`,
              target: `project-${similarPaper.id}`,
              style: { stroke: 'hsl(280 70% 65%)', strokeWidth: 2, strokeDasharray: '5,5' },
              animated: true,
            });
          });
        }
      });
    });

    return { initialNodes: nodes, initialEdges: edges };
  }, [researchClusters, researchProjects, userQuery, selectedProject, handleSelectProject, handleFindSimilarFromNode]);

  // Apply saved positions to initial nodes
  const nodesWithSavedPositions = useMemo(() => {
    return initialNodes.map(node => {
      const saved = savedPositionsRef.current.get(node.id);
      if (saved) {
        return { ...node, position: saved };
      }
      return node;
    });
  }, [initialNodes]);

  const [nodes, setNodes, onNodesChange] = useNodesState(nodesWithSavedPositions);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes when initial nodes change
  useEffect(() => {
    setNodes(nodesWithSavedPositions);
  }, [nodesWithSavedPositions, setNodes]);

  // Update edges when initial edges change
  useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);

  // Load saved positions from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const positions = JSON.parse(saved);
        savedPositionsRef.current = new Map(Object.entries(positions));
        console.log(`📍 Loaded ${savedPositionsRef.current.size} saved node positions`);
      } catch (e) {
        console.warn('Failed to load saved positions:', e);
      }
    }
  }, [storageKey]);

  // Save positions to localStorage whenever nodes move
  const handleNodesChange = useCallback((changes: NodeChange[]) => {
    onNodesChange(changes);
    
    // Save position changes
    changes.forEach(change => {
      if (change.type === 'position' && change.position && !change.dragging) {
        const posChange = change as NodePositionChange;
        if (posChange.position) {
          savedPositionsRef.current.set(posChange.id, posChange.position);
        }
      }
    });
    
    // Debounced save to localStorage
    const positions = Object.fromEntries(savedPositionsRef.current);
    localStorage.setItem(storageKey, JSON.stringify(positions));
  }, [onNodesChange, storageKey]);

  // Handle cluster node movement - SIMPLE and SMOOTH approach
  const handleClusterMove = useCallback((changes: NodeChange[]) => {
    const positionChanges = changes.filter(c => c.type === 'position') as NodePositionChange[];
    
    positionChanges.forEach(change => {
      if (change.id.startsWith('cluster-') && change.position) {
        const clusterId = change.id.replace('cluster-', '');
        
        // Find the original position
        const oldNode = nodes.find(n => n.id === change.id);
        if (!oldNode || !change.position) return;
        
        const deltaX = change.position.x - oldNode.position.x;
        const deltaY = change.position.y - oldNode.position.y;
        
        // Move all connected nodes with smooth, bouncy animation
        setNodes(nds => nds.map(node => {
          if (node.type === 'projectNode') {
            const project = (node.data as any).project;
            
            // Move direct children
            if (project && project.cluster === clusterId) {
              return {
                ...node,
                position: {
                  x: node.position.x + deltaX,
                  y: node.position.y + deltaY,
                },
                style: {
                  ...node.style,
                  // Bouncy spring animation - key to Obsidian feel!
                  transition: change.dragging 
                    ? 'none' 
                    : 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                },
              };
            }
            
            // Also move similar papers under this cluster's projects
            if (project && project.cluster?.startsWith('similar_')) {
              const parentId = project.cluster.replace('similar_', '');
              const parentNode = nds.find(n => n.id === `project-${parentId}`);
              if (parentNode) {
                const parentProject = (parentNode.data as any).project;
                if (parentProject && parentProject.cluster === clusterId) {
                  return {
                    ...node,
                    position: {
                      x: node.position.x + deltaX,
                      y: node.position.y + deltaY,
                    },
                    style: {
                      ...node.style,
                      transition: change.dragging 
                        ? 'none' 
                        : 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    },
                  };
                }
              }
            }
          }
          return node;
        }));
      }
    });
    
    handleNodesChange(changes);
  }, [nodes, setNodes, handleNodesChange]);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg font-medium text-foreground">Building your research landscape...</p>
          <p className="text-sm text-muted-foreground mt-2">Analyzing papers and clustering approaches</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col relative">
      {/* Header */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-3">
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-4 py-2 bg-card hover:bg-accent rounded-lg border border-border transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-medium">New Search</span>
        </button>
        
        {error && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200 px-4 py-2 rounded-lg text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Lock toggle */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={() => setIsLocked(!isLocked)}
          className={`px-4 py-2 rounded-lg border transition-colors ${
            isLocked
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-card hover:bg-accent border-border'
          }`}
        >
          {isLocked ? '🔒 Locked' : '🔓 Unlocked'}
        </button>
      </div>

      {/* Main Canvas */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={isLocked ? undefined : handleClusterMove}
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
          connectionLineType="smoothstep"
          defaultEdgeOptions={{
            type: 'smoothstep',
            animated: false,
            style: { strokeWidth: 2 },
          }}
        >
          <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="hsl(220 15% 85%)" />
          <Controls position="bottom-right" className="!bg-card !border-border !shadow-sm" />
        </ReactFlow>

        {/* Detail Panel */}
        {selectedProject && !hideChatSidebar && (
          <DetailPanel
            project={selectedProject}
            onClose={() => setSelectedProject(null)}
            onPinEvidence={onPinEvidence}
            isPinned={pinnedEvidenceIds.includes(selectedProject.id)}
            onAddToContext={onAddToContext}
            isInContext={chatContext.some(p => p.id === selectedProject.id)}
          />
        )}

        {/* Insight Panels */}
        <InsightPanel clusters={researchClusters} projects={researchProjects} />
        <NoveltyRadar clusters={researchClusters} projects={researchProjects} />
        <FeasibilityPanel clusters={researchClusters} projects={researchProjects} />
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-10 bg-card/90 backdrop-blur-sm border border-border rounded-lg p-4 shadow-lg max-w-xs">
        <h3 className="font-semibold text-sm mb-2">Obsidian-Style Map</h3>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Drag clusters → Children bounce smoothly</li>
          <li>• Click papers to view details</li>
          <li>• Hover papers → Click + for similar papers</li>
          <li>• Lock/unlock to freeze positions</li>
        </ul>
      </div>
    </div>
  );
};

export default ResearchLandscape;
