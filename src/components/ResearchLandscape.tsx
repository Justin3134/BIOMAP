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
import NewsNode from "./nodes/NewsNode";
import DetailPanel from "./DetailPanel";
import NewsDetailPanel from "./NewsDetailPanel";
import InsightPanel from "./InsightPanel";
import NoveltyRadar from "./NoveltyRadar";
import FeasibilityPanel from "./FeasibilityPanel";
import { mockProjects, clusters } from "@/data/mockResearch";
import { ResearchProject } from "@/types/research";
import { ProjectIntake } from "@/types/workspace";
import { ArrowLeft, Loader2, BookOpen, Newspaper } from "lucide-react";
import { researchAPI, newsAPI } from "@/lib/api";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  newsNode: NewsNode,
};

type ViewMode = 'scholars' | 'news';

const ResearchLandscape = ({ userQuery, onReset, intake, onPinEvidence, pinnedEvidenceIds = [], hideChatSidebar, chatContext = [], onAddToContext }: ResearchLandscapeProps) => {
  const [selectedProject, setSelectedProject] = useState<ResearchProject | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [researchClusters, setResearchClusters] = useState<any[]>([]);
  const [researchProjects, setResearchProjects] = useState<ResearchProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // View mode state
  const [viewMode, setViewMode] = useState<ViewMode>('scholars');
  const [newsCategories, setNewsCategories] = useState<any[]>([]);
  const [newsArticles, setNewsArticles] = useState<any[]>([]);
  const [isLoadingNews, setIsLoadingNews] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<any | null>(null);
  
  // Store node positions and similar papers in localStorage to persist across tab changes
  const storageKey = `biomap-positions-${intake?.projectId || 'default'}-${viewMode}`;
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
              cluster: cluster.branch_id,
              clusterLabel: cluster.label,
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

  // Fetch news map when in news mode
  useEffect(() => {
    const fetchNewsMap = async () => {
      if (!intake?.projectId || viewMode !== 'news') {
        return;
      }

      try {
        setIsLoadingNews(true);
        setError(null);
        
        // Try to get existing news map first
        try {
          const map = await newsAPI.getMap(intake.projectId);
          if (map.categories && map.categories.length > 0) {
            console.log(`📰 Loaded existing news map with ${map.totalArticles} articles`);
            setNewsCategories(map.categories);
            
            // Flatten articles for easier access
            const allArticles = map.categories.flatMap((cat: any) => 
              cat.articles.map((article: any) => ({
                ...article,
                id: article.articleId,
                category: cat.label,
                categoryId: cat.category_id
              }))
            );
            setNewsArticles(allArticles);
            setIsLoadingNews(false);
            return;
          }
        } catch (e) {
          console.log('📰 No existing news map, building new one...');
        }

        // Build new news map
        console.log('📰 Building news map with OpenAI...');
        const map = await newsAPI.buildMap(intake.projectId);
        
        if (map.categories && map.categories.length > 0) {
          console.log(`✅ Built news map with ${map.totalArticles} articles in ${map.categories.length} categories`);
          setNewsCategories(map.categories);
          
          const allArticles = map.categories.flatMap((cat: any) => 
            cat.articles.map((article: any) => ({
              ...article,
              id: article.articleId,
              category: cat.label,
              categoryId: cat.category_id
            }))
          );
          setNewsArticles(allArticles);
        } else {
          setError('No news articles found for this topic.');
        }
        
        setIsLoadingNews(false);
      } catch (error: any) {
        console.error('Error fetching news:', error);
        setError('Failed to fetch news articles. Please try again.');
        setIsLoadingNews(false);
      }
    };

    fetchNewsMap();
  }, [intake?.projectId, viewMode]);

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

  // Transform news article to ResearchProject format for context/pinning
  const transformArticleToProject = useCallback((article: any): ResearchProject => {
    return {
      id: article.articleId,
      paperId: article.articleId,
      title: article.title,
      summary: article.whatHappened || article.summary || '',
      abstract: article.whatHappened || article.summary || '',
      year: new Date(article.date).getFullYear(),
      authors: article.publisher,
      cluster: article.categoryId || article.category,
      clusterLabel: article.category,
      similarity: article.similarity || 0.75,
      similarityReasons: article.whyItMatters || [`Relevant news coverage from ${article.publisher}`],
      url: article.url || null,
      isAIGenerated: false,
      details: {
        overview: article.whatHappened || article.summary || '',
        whatWorked: article.keyClaims || [],
        whatDidntWork: [],
        keyLessons: article.whatToWatch || [],
        relationToIdea: article.relationToTopic || '',
        externalLink: article.url || null,
        year: new Date(article.date).getFullYear(),
        authors: [article.publisher],
        approach: 'News Coverage',
        difficulty: 'Low',
        cost: 'Low',
        timeframe: 'Current'
      }
    };
  }, []);

  // Handle adding article to context
  const handleAddArticleToContext = useCallback((article: any) => {
    if (onAddToContext) {
      const projectFormat = transformArticleToProject(article);
      onAddToContext(projectFormat);
    }
  }, [onAddToContext, transformArticleToProject]);

  // Handle pinning article as evidence
  const handlePinArticle = useCallback((article: any) => {
    if (onPinEvidence) {
      const projectFormat = transformArticleToProject(article);
      onPinEvidence(projectFormat);
    }
  }, [onPinEvidence, transformArticleToProject]);

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
          cluster: `similar_${project.id}`,
          clusterLabel: `Similar to ${project.title.substring(0, 30)}...`,
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

  // Build news nodes and edges
  const { initialNodes: newsNodes, initialEdges: newsEdges } = useMemo(() => {
    if (viewMode !== 'news' || newsCategories.length === 0) {
      return { initialNodes: [], initialEdges: [] };
    }

    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // User node at top center (yellow for news mode)
    nodes.push({
      id: "user",
      type: "userNode",
      position: { x: 400, y: 0 },
      data: { label: "Your Topic", description: userQuery, mode: 'news' },
      draggable: true,
    });

    // Category nodes spread horizontally
    const categorySpacing = 280;
    const categoryY = 180;
    const startX = 400 - ((newsCategories.length - 1) * categorySpacing) / 2;

    newsCategories.forEach((category, index) => {
      nodes.push({
        id: category.category_id,
        type: "clusterNode",
        position: { x: startX + index * categorySpacing, y: categoryY },
        data: { 
          label: category.label, 
          description: category.label,
          projectCount: category.articles.length,
          mode: 'news'
        },
        draggable: true,
      });

      // Edge from user to category (yellow)
      edges.push({
        id: `edge-user-${category.category_id}`,
        source: "user",
        target: category.category_id,
        style: { stroke: '#fbbf24', strokeWidth: 2 },
        animated: false,
      });

      // Article nodes under each category
      const articleY = categoryY + 140;
      const articleSpacing = 100;
      const articleStartX = startX + index * categorySpacing - ((category.articles.length - 1) * articleSpacing) / 2;

      category.articles.forEach((article: any, aIndex: number) => {
        // Stagger vertically for organic look
        const yOffset = aIndex % 2 === 0 ? 0 : 60;
        
        const fullArticle = newsArticles.find(a => a.articleId === article.articleId) || article;
        
        nodes.push({
          id: article.articleId,
          type: "newsNode",
          position: { 
            x: articleStartX + aIndex * articleSpacing, 
            y: articleY + yOffset 
          },
          data: { 
            article: {
              ...fullArticle,
              id: fullArticle.articleId,
              category: category.label,
              categoryId: category.category_id
            },
            onSelect: (art: any) => setSelectedArticle(art),
            isSelected: selectedArticle?.articleId === article.articleId,
          },
          draggable: true,
        });

        edges.push({
          id: `edge-category-${category.category_id}-${article.articleId}`,
          source: category.category_id,
          target: article.articleId,
          style: { stroke: '#fde047', strokeWidth: 1.5 },
        });
      });
    });

    return { initialNodes: nodes, initialEdges: edges };
  }, [userQuery, newsCategories, newsArticles, selectedArticle, viewMode]);

  const [nodes, setNodes, onNodesChange] = useNodesState(viewMode === 'news' ? newsNodes : initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(viewMode === 'news' ? newsEdges : initialEdges);

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

  // Handle cluster/category node movement - move all children with it (works for both modes)
  const handleClusterMove = useCallback((changes: NodeChange[]) => {
    const positionChanges = changes.filter(c => c.type === 'position') as NodePositionChange[];
    
    positionChanges.forEach(change => {
      const isClusterNode = change.id.startsWith('cluster-');
      const isCategoryNode = change.id.startsWith('cat_'); // News mode categories
      
      // Handle both scholars clusters and news categories
      if ((isClusterNode || isCategoryNode) && change.position) {
        let nodeId: string;
        
        if (isClusterNode) {
          nodeId = change.id.replace('cluster-', '');
        } else {
          nodeId = change.id; // Keep category ID as-is (cat_1, cat_2, etc.)
        }
        
        // Find the original position
        const oldNode = nodes.find(n => n.id === change.id);
        if (!oldNode || !change.position) return;
        
        const deltaX = change.position.x - oldNode.position.x;
        const deltaY = change.position.y - oldNode.position.y;
        
        // Move children nodes based on mode
        setNodes(nds => nds.map(node => {
          // Scholars mode: move project nodes in this cluster
          if (isClusterNode && node.type === 'projectNode') {
            const project = (node.data as any).project;
            if (project && project.cluster === nodeId) {
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
            
            // Also move similar papers under this cluster's projects
            if (project && project.cluster?.startsWith('similar_')) {
              const parentId = project.cluster.replace('similar_', '');
              const parentNode = nds.find(n => n.id === `project-${parentId}`);
              if (parentNode) {
                const parentProject = (parentNode.data as any).project;
                if (parentProject && parentProject.cluster === nodeId) {
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
          
          // News mode: move article nodes in this category
          if (isCategoryNode && node.type === 'newsNode') {
            const article = (node.data as any).article;
            if (article && article.categoryId === nodeId) {
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

  // Update nodes when view mode changes (preserve saved positions)
  useEffect(() => {
    const targetNodes = viewMode === 'news' ? newsNodes : initialNodes;
    const targetEdges = viewMode === 'news' ? newsEdges : initialEdges;
    
    // Apply saved positions when switching modes
    const nodesWithSavedPositions = targetNodes.map(node => {
      const savedPos = savedPositionsRef.current.get(node.id);
      if (savedPos) {
        return {
          ...node,
          position: savedPos
        };
      }
      return node;
    });
    
    setNodes(nodesWithSavedPositions);
    setEdges(targetEdges);
    
    console.log(`🔄 Switched to ${viewMode} mode with ${nodesWithSavedPositions.length} nodes (${Array.from(savedPositionsRef.current.keys()).filter(k => targetNodes.some(n => n.id === k)).length} positions restored)`);
  }, [viewMode, newsNodes, newsEdges, initialNodes, initialEdges, setNodes, setEdges]);

  // Update nodes when selection or pins change
  useEffect(() => {
    if (viewMode === 'scholars') {
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
    } else if (viewMode === 'news') {
      setNodes(nds => 
        nds.map(node => {
          if (node.type === 'newsNode') {
            const nodeData = node.data as any;
            return {
              ...node,
              data: {
                ...node.data,
                isSelected: selectedArticle?.articleId === nodeData.article?.articleId,
              }
            };
          }
          return node;
        })
      );
    }
  }, [selectedProject, selectedArticle, viewMode, setNodes, handleSelectProject, handleFindSimilarFromNode]);

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

        {/* Title and Mode Toggle */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 text-center">
          <div className="mb-3">
            <h1 className="font-serif text-xl font-semibold text-foreground mb-1">
              Research Landscape
            </h1>
            <p className="text-sm text-muted-foreground">
              {viewMode === 'scholars' ? 'Academic papers from Semantic Scholar' : 'News articles & industry coverage'}
            </p>
          </div>
          
          {/* Mode Toggle */}
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)} className="w-fit mx-auto">
            <TabsList className="grid w-fit grid-cols-2 bg-card/80 backdrop-blur-sm">
              <TabsTrigger 
                value="scholars" 
                className="flex items-center gap-2 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-900 dark:data-[state=active]:bg-blue-950 dark:data-[state=active]:text-blue-100"
              >
                <BookOpen className="w-4 h-4" />
                <span className="font-medium">Scholars</span>
              </TabsTrigger>
              <TabsTrigger 
                value="news" 
                className="flex items-center gap-2 data-[state=active]:bg-yellow-100 data-[state=active]:text-yellow-900 dark:data-[state=active]:bg-yellow-950 dark:data-[state=active]:text-yellow-100"
              >
                <Newspaper className="w-4 h-4" />
                <span className="font-medium">News</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
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
          <Background 
            variant={BackgroundVariant.Dots} 
            gap={24} 
            size={1} 
            color={viewMode === 'news' ? 'hsl(48 96% 70%)' : 'hsl(220 15% 85%)'} 
          />
          <Controls 
            position="bottom-right"
            className="!bg-card !border-border !shadow-sm"
            showInteractive={true}
            onInteractiveChange={(interactive) => setIsLocked(!interactive)}
          />
        </ReactFlow>

        {/* Loading indicator */}
        {(isLoading || isLoadingNews) && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-20">
            <div className="text-center">
              <Loader2 className={`w-12 h-12 animate-spin mx-auto mb-4 ${viewMode === 'news' ? 'text-yellow-500' : 'text-primary'}`} />
              <p className="text-lg font-medium">
                {viewMode === 'news' ? 'Finding news articles...' : 'Building your research landscape...'}
              </p>
              <p className="text-sm text-muted-foreground">
                {viewMode === 'news' ? 'Searching news sources and industry coverage' : 'Analyzing papers and clustering approaches'}
              </p>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && !isLoading && !isLoadingNews && (
          <div className="absolute top-32 left-1/2 -translate-x-1/2 z-10 bg-destructive/10 border border-destructive text-destructive px-4 py-2 rounded-lg max-w-md text-center">
            {error}
          </div>
        )}

        {/* Left panels stack - scrollable container (only show in scholars mode) */}
        {viewMode === 'scholars' && (
          <div className="absolute bottom-6 left-6 z-10 flex flex-col gap-2 max-h-[calc(100vh-120px)] overflow-y-auto scrollbar-thin">
            <NoveltyRadar clusters={researchClusters} projects={researchProjects} />
            <FeasibilityPanel clusters={researchClusters} projects={researchProjects} />
            <InsightPanel clusters={researchClusters} projects={researchProjects} />
          </div>
        )}
      </div>

      {/* Detail panels - slides in from right when selected */}
      {selectedProject && viewMode === 'scholars' && (
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

      {selectedArticle && viewMode === 'news' && (
        <NewsDetailPanel
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
          onAddToContext={handleAddArticleToContext}
          isInContext={chatContext.some(p => p.id === selectedArticle.articleId)}
          onPinEvidence={handlePinArticle}
          isPinnedEvidence={pinnedEvidenceIds.includes(selectedArticle.articleId)}
        />
      )}

      {/* Chat Sidebar removed - using WorkspaceLayout's ChatSidebar only */}
    </div>
  );
};

export default ResearchLandscape;
