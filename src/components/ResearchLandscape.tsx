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
  
  // Store node positions and similar papers in localStorage to persist across tab changes
  const storageKey = `biomap-positions-${intake?.projectId || 'default'}`;
  const similarPapersKey = `biomap-similar-${intake?.projectId || 'default'}`;
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
              paperId: paper.paperId, // Add paperId explicitly
              title: paper.title,
              year: paper.year,
              authors: paper.authors || "Unknown",
              abstract: paper.abstract, // Add abstract at top level
              url: paper.url, // Add URL at top level (from backend)
              isAIGenerated: paper.isAIGenerated, // Add isAIGenerated flag (from backend)
              similarity: paper.similarity,
              novelty: paper.similarity > 0.8 ? "high" : paper.similarity > 0.6 ? "medium" : "low",
              feasibility: "medium",
              cluster: cluster.branch_id,
              clusterLabel: cluster.label,
              tags: [],
              summary: paper.abstract?.substring(0, 200) + '...' || paper.title,
              similarityReasons: [`${Math.round(paper.similarity * 100)}% semantic similarity to your research goal`],
              details: {
                overview: paper.abstract || 'No abstract available',
                whatWorked: [],
                whatDidntWork: [],
                keyLessons: [],
                relationToIdea: `This paper explores ${cluster.label.toLowerCase()} which relates to your research goal.`,
                externalLink: paper.url || `https://www.semanticscholar.org/paper/${paper.paperId}`,
                year: paper.year,
                authors: paper.authors ? paper.authors.split(', ') : [],
                approach: cluster.label,
                difficulty: paper.similarity > 0.7 ? "Medium" : "High",
                cost: "Medium",
                timeframe: "6-12 months"
              }
            });
          });
        });

        // Load saved similar papers from localStorage and merge them
        try {
          const savedSimilar = localStorage.getItem(similarPapersKey);
          if (savedSimilar) {
            const similarPapers = JSON.parse(savedSimilar);
            console.log(`📍 Loaded ${similarPapers.length} saved similar papers`);
            transformedProjects.push(...similarPapers);
          }
        } catch (e) {
          console.warn('Failed to load saved similar papers:', e);
        }

        setResearchClusters(transformedClusters);
        setResearchProjects(transformedProjects);
        setIsLoading(false);
        
        console.log(`Loaded ${transformedProjects.length} papers in ${transformedClusters.length} clusters`);
      } catch (err) {
        console.error("Failed to load research map:", err);
        setError("API temporarily unavailable. Using example data. Try again in a moment.");
        // Fallback to mock data
        setResearchClusters(clusters);
        setResearchProjects(mockProjects);
        setIsLoading(false);
      }
    };

    fetchResearchMap();
  }, [intake?.projectId, similarPapersKey]);

  const handleSelectProject = useCallback((project: ResearchProject) => {
    setSelectedProject(project);
  }, []);

  const handleAskAboutText = useCallback((text: string, project: ResearchProject) => {
    // Add project to context if not already there
    if (onAddToContext && !chatContext.some(p => p.id === project.id)) {
      onAddToContext(project);
    }
    console.log("Ask about:", text, "from project:", project.title);
  }, [onAddToContext, chatContext]);

  // Handle finding similar papers from a node
  const handleFindSimilarFromNode = useCallback(async (project: ResearchProject) => {
    console.log(`🔍 Finding similar papers for: ${project.title}`);
    
    try {
      const similarPapers = await researchAPI.findSimilar(
        project.id,
        project.title,
        project.details?.overview || project.summary
      );
      
      if (similarPapers && similarPapers.length > 0) {
        console.log(`📍 Adding ${similarPapers.length} similar papers below ${project.title}`);
        
        // Transform similar papers to ResearchProject format (REAL papers from Semantic Scholar)
        const newProjects: ResearchProject[] = similarPapers.map((paper: any) => ({
          id: paper.paperId,
          paperId: paper.paperId,
          title: paper.title,
          year: paper.year,
          authors: paper.authors,
          abstract: paper.abstract,
          url: paper.url, // Real URL from Semantic Scholar
          isAIGenerated: paper.isAIGenerated === true, // Use actual value from backend (should be false)
          similarity: 0.7 + Math.random() * 0.2,
          novelty: "medium",
          feasibility: "medium",
          cluster: `similar_${project.id}`,
          clusterLabel: `Similar to ${project.title.substring(0, 30)}...`,
          tags: ["Similar"], // Just "Similar", not "AI-generated"
          summary: paper.abstract?.substring(0, 200) + '...' || paper.title,
          similarityReasons: [`Similar to ${project.title}`],
          details: {
            overview: paper.abstract || "No abstract available",
            whatWorked: [],
            whatDidntWork: [],
            keyLessons: [],
            relationToIdea: `This paper is similar to ${project.title}`,
            externalLink: paper.url || `https://www.semanticscholar.org/paper/${paper.paperId}`,
            year: paper.year,
            authors: paper.authors?.split(', ') || [],
            approach: "Similar research",
            difficulty: "Medium",
            cost: "Medium",
            timeframe: "6-12 months"
          }
        }));

        // Add to research projects
        setResearchProjects(prev => {
          const updated = [...prev, ...newProjects];
          
          // Save all similar papers to localStorage
          const allSimilarPapers = updated.filter(p => p.cluster?.startsWith('similar_'));
          try {
            localStorage.setItem(similarPapersKey, JSON.stringify(allSimilarPapers));
            console.log(`💾 Saved ${allSimilarPapers.length} similar papers to localStorage`);
          } catch (e) {
            console.warn('Failed to save similar papers:', e);
          }
          
          return updated;
        });
        
        console.log(`✅ Added ${newProjects.length} similar paper nodes`);
      } else {
        console.warn('No similar papers found');
      }
    } catch (error) {
      console.error('Failed to find similar papers:', error);
    }
  }, [similarPapersKey]);

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
                y: similarY 
              },
              data: {
                project: similarPaper,
                isSelected: selectedProject?.id === similarPaper.id,
                onSelect: handleSelectProject,
                onFindSimilar: handleFindSimilarFromNode,
              },
              draggable: true,
            });

            // Edge from parent project to similar paper (dashed green line)
            edges.push({
              id: `edge-similar-${similarPaper.id}`,
              source: `project-${project.id}`,
              target: `project-${similarPaper.id}`,
              style: { stroke: 'hsl(150 60% 60%)', strokeWidth: 2, strokeDasharray: '5,5' },
              animated: true,
            });
          });
        }
      });
    });

    return { initialNodes: nodes, initialEdges: edges };
  }, [userQuery, handleSelectProject, handleFindSimilarFromNode, researchClusters, researchProjects]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Load saved positions from localStorage on mount (run early)
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const positions = JSON.parse(saved);
        savedPositionsRef.current = new Map(Object.entries(positions));
        console.log(`📍 Loaded ${savedPositionsRef.current.size} saved node positions from localStorage`);
        // Log a sample to verify
        if (savedPositionsRef.current.size > 0) {
          const [firstKey, firstPos] = savedPositionsRef.current.entries().next().value;
          console.log(`   Example: ${firstKey} -> (${firstPos.x}, ${firstPos.y})`);
        }
      } catch (e) {
        console.warn('Failed to load saved positions:', e);
      }
    } else {
      console.log('📍 No saved positions found for this project');
    }
  }, [storageKey]);

  // Save positions to localStorage whenever nodes move
  const handleNodesChange = useCallback((changes: NodeChange[]) => {
    onNodesChange(changes);
    
    // Save position changes (save both during drag and after)
    let savedCount = 0;
    changes.forEach(change => {
      if (change.type === 'position' && change.position) {
        const posChange = change as NodePositionChange;
        if (posChange.position) {
          savedPositionsRef.current.set(posChange.id, posChange.position);
          savedCount++;
        }
      }
    });
    
    // Save to localStorage
    if (savedCount > 0) {
      const positions = Object.fromEntries(savedPositionsRef.current);
      localStorage.setItem(storageKey, JSON.stringify(positions));
      console.log(`💾 Saved ${savedCount} node position(s) (total: ${savedPositionsRef.current.size})`);
    }
  }, [onNodesChange, storageKey]);

  // Handle cluster node movement - move all children with it (Obsidian-style with smooth animation)
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
        
        // Move all project nodes in this cluster smoothly
        setNodes(nds => nds.map(node => {
          if (node.type === 'projectNode') {
            const project = (node.data as any).project;
            if (project && project.cluster === clusterId) {
              return {
                ...node,
                position: {
                  x: node.position.x + deltaX,
                  y: node.position.y + deltaY,
                },
                // Add smooth transition
                style: {
                  ...node.style,
                  transition: change.dragging ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
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
                      transition: change.dragging ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
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

  // Force update nodes and edges when data changes (preserve positions)
  useEffect(() => {
    console.log(`Updating React Flow with ${initialNodes.length} nodes and ${initialEdges.length} edges`);
    
    // Preserve existing node positions when updating (prioritize saved positions)
    setNodes(nds => {
      const currentPositionMap = new Map(nds.map(n => [n.id, n.position]));
      let restoredCount = 0;
      
      const updatedNodes = initialNodes.map(node => {
        // Priority: saved position > current position > initial position
        const savedPos = savedPositionsRef.current.get(node.id);
        const currentPos = currentPositionMap.get(node.id);
        const finalPos = savedPos || currentPos || node.position;
        
        if (savedPos) {
          restoredCount++;
        }
        
        return {
          ...node,
          position: finalPos,
        };
      });
      
      if (restoredCount > 0) {
        console.log(`✅ Restored ${restoredCount} node positions from saved data`);
      }
      
      return updatedNodes;
    });
    
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

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
              onSelect: handleSelectProject,
              onFindSimilar: handleFindSimilarFromNode,
            }
          };
        }
        return node;
      })
    );
  }, [selectedProject, setNodes, handleSelectProject, handleFindSimilarFromNode]);

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
        >
          <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="hsl(220 15% 85%)" />
          <Controls 
            position="bottom-right"
            className="!bg-card !border-border !shadow-sm"
            showInteractive={true}
            onInteractiveChange={(interactive) => setIsLocked(!interactive)}
          />
        </ReactFlow>

        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-20">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-lg font-medium">Building your research landscape...</p>
              <p className="text-sm text-muted-foreground">Analyzing papers and clustering approaches</p>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && !isLoading && (
          <div className="absolute top-24 left-1/2 -translate-x-1/2 z-10 bg-destructive/10 border border-destructive text-destructive px-4 py-2 rounded-lg">
            {error}
          </div>
        )}

        {/* Left panels stack - scrollable container */}
        <div className="absolute bottom-6 left-6 z-10 flex flex-col gap-2 max-h-[calc(100vh-120px)] overflow-y-auto scrollbar-thin">
          <NoveltyRadar clusters={researchClusters} projects={researchProjects} />
          <FeasibilityPanel clusters={researchClusters} projects={researchProjects} />
          <InsightPanel clusters={researchClusters} projects={researchProjects} />
        </div>
      </div>

      {/* Detail panel - slides in from right when project selected */}
      {selectedProject && (
        <DetailPanel
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onAddToContext={onAddToContext}
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
