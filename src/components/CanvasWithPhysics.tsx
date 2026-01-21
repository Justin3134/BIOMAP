import { useState, useCallback, useEffect } from "react";
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
  EdgeChange,
  Connection,
  addEdge,
  Handle,
  Position,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { ResearchProject } from "@/types/research";
import { ProjectIntake } from "@/types/workspace";
import { Plus, FileText, Lightbulb, Target, AlertCircle } from "lucide-react";

interface CanvasProps {
  intake?: ProjectIntake;
  contextProjects: ResearchProject[];
  pinnedEvidenceIds?: string[];
}

// Custom node types for Canvas with FIXED text selection
const CanvasNoteNode = ({ data }: any) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(data.content || '');
  const [editTitle, setEditTitle] = useState(data.title || 'Note');

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditContent(data.content || ''); // Clear placeholder
    setEditTitle(data.title || 'Note');
    setIsEditing(true);
  };

  const handleSave = () => {
    if (data.onUpdate) {
      data.onUpdate({ title: editTitle, content: editContent });
    }
    setIsEditing(false);
  };

  return (
    <>
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-yellow-500 hover:!bg-yellow-600 transition-colors" />
      <div 
        className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-300 dark:border-yellow-700 rounded-lg p-4 min-w-[200px] max-w-[300px] shadow-lg hover:shadow-xl transition-all"
        onDoubleClick={handleDoubleClick}
        style={{ cursor: isEditing ? 'text' : 'pointer' }}
      >
        <div className="flex items-center gap-2 mb-2">
          <FileText className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
          {isEditing ? (
            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="font-semibold text-sm bg-white dark:bg-gray-800 border-b border-yellow-400 focus:outline-none px-1 flex-1"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <h4 className="font-semibold text-sm">{data.title || "Note"}</h4>
          )}
        </div>
        {isEditing ? (
          <div onClick={(e) => e.stopPropagation()}>
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="text-sm text-gray-700 dark:text-gray-300 w-full h-32 bg-white dark:bg-gray-800 border border-yellow-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              placeholder="Type your note..."
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSave();
              }}
              className="mt-2 px-4 py-1.5 bg-yellow-400 text-yellow-900 rounded text-sm font-medium hover:bg-yellow-500 transition-colors"
            >
              Save
            </button>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap select-text">
              {data.content || 'Empty note'}
            </p>
            {!data.content && (
              <p className="text-xs text-gray-400 mt-2 italic">Double-click to add content</p>
            )}
          </>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-yellow-500 hover:!bg-yellow-600 transition-colors" />
    </>
  );
};

const CanvasInsightNode = ({ data }: any) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(data.content || '');
  const [editTitle, setEditTitle] = useState(data.title || 'Insight');

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditContent(data.content || '');
    setEditTitle(data.title || 'Insight');
    setIsEditing(true);
  };

  return (
    <>
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-purple-500 hover:!bg-purple-600 transition-colors" />
      <div 
        className="bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-300 dark:border-purple-700 rounded-lg p-4 min-w-[200px] max-w-[300px] shadow-lg hover:shadow-xl transition-all"
        onDoubleClick={handleDoubleClick}
        style={{ cursor: isEditing ? 'text' : 'pointer' }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          {isEditing ? (
            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="font-semibold text-sm bg-white dark:bg-gray-800 border-b border-purple-400 focus:outline-none px-1 flex-1"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <h4 className="font-semibold text-sm">{data.title || "Insight"}</h4>
          )}
        </div>
        {isEditing ? (
          <div onClick={(e) => e.stopPropagation()}>
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="text-sm text-gray-700 dark:text-gray-300 w-full h-24 bg-white dark:bg-gray-800 border border-purple-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (data.onUpdate) data.onUpdate({ title: editTitle, content: editContent });
                setIsEditing(false);
              }}
              className="mt-2 px-4 py-1.5 bg-purple-400 text-purple-900 rounded text-sm font-medium hover:bg-purple-500 transition-colors"
            >
              Save
            </button>
          </div>
        ) : (
          <p className="text-sm text-gray-700 dark:text-gray-300 select-text">{data.content || 'Empty insight'}</p>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-purple-500 hover:!bg-purple-600 transition-colors" />
    </>
  );
};

const CanvasDecisionNode = ({ data }: any) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(data.content || '');
  const [editTitle, setEditTitle] = useState(data.title || 'Decision');

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditContent(data.content || '');
    setEditTitle(data.title || 'Decision');
    setIsEditing(true);
  };

  return (
    <>
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-green-500 hover:!bg-green-600 transition-colors" />
      <div 
        className="bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-700 rounded-lg p-4 min-w-[200px] max-w-[300px] shadow-lg hover:shadow-xl transition-all"
        onDoubleClick={handleDoubleClick}
        style={{ cursor: isEditing ? 'text' : 'pointer' }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-4 h-4 text-green-600 dark:text-green-400" />
          {isEditing ? (
            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="font-semibold text-sm bg-white dark:bg-gray-800 border-b border-green-400 focus:outline-none px-1 flex-1"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <h4 className="font-semibold text-sm">{data.title || "Decision"}</h4>
          )}
        </div>
        {isEditing ? (
          <div onClick={(e) => e.stopPropagation()}>
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="text-sm text-gray-700 dark:text-gray-300 w-full h-24 bg-white dark:bg-gray-800 border border-green-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-green-400"
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (data.onUpdate) data.onUpdate({ title: editTitle, content: editContent });
                setIsEditing(false);
              }}
              className="mt-2 px-4 py-1.5 bg-green-400 text-green-900 rounded text-sm font-medium hover:bg-green-500 transition-colors"
            >
              Save
            </button>
          </div>
        ) : (
          <p className="text-sm text-gray-700 dark:text-gray-300 select-text">{data.content || 'Empty decision'}</p>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-green-500 hover:!bg-green-600 transition-colors" />
    </>
  );
};

const CanvasPaperNode = ({ data }: any) => (
  <>
    <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-blue-500 hover:!bg-blue-600 transition-colors" />
    <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-300 dark:border-blue-700 rounded-lg p-4 min-w-[250px] max-w-[350px] shadow-lg hover:shadow-xl transition-all">
      <h4 className="font-semibold text-sm mb-2 text-blue-900 dark:text-blue-100 select-text">{data.title}</h4>
      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 select-text">{data.authors}</p>
      <p className="text-xs text-gray-700 dark:text-gray-300 line-clamp-3 select-text">{data.summary}</p>
      {data.similarity && (
        <div className="mt-2 text-xs text-blue-600 dark:text-blue-400 font-semibold">
          {Math.round(data.similarity * 100)}% match
        </div>
      )}
    </div>
    <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-blue-500 hover:!bg-blue-600 transition-colors" />
  </>
);

const CanvasConstraintNode = ({ data }: any) => (
  <>
    <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-red-500 hover:!bg-red-600 transition-colors" />
    <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700 rounded-lg p-4 min-w-[200px] max-w-[300px] shadow-lg hover:shadow-xl transition-all">
      <div className="flex items-center gap-2 mb-2">
        <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
        <h4 className="font-semibold text-sm select-text">{data.title || "Constraint"}</h4>
      </div>
      <p className="text-sm text-gray-700 dark:text-gray-300 select-text">{data.content}</p>
    </div>
    <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-red-500 hover:!bg-red-600 transition-colors" />
  </>
);

const nodeTypes = {
  note: CanvasNoteNode,
  insight: CanvasInsightNode,
  decision: CanvasDecisionNode,
  paper: CanvasPaperNode,
  constraint: CanvasConstraintNode,
};

const Canvas = ({ intake, contextProjects, pinnedEvidenceIds = [] }: CanvasProps) => {
  const storageKey = `biomap-canvas-${intake?.projectId || 'default'}`;
  
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

  // Load canvas from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const { nodes: savedNodes, edges: savedEdges } = JSON.parse(saved);
        setNodes(savedNodes || []);
        setEdges(savedEdges || []);
        console.log(`📍 Loaded canvas with ${savedNodes?.length || 0} nodes`);
        return;
      } catch (e) {
        console.warn('Failed to load canvas:', e);
      }
    }
    
    // Initialize with project context
    initializeCanvas();
  }, [storageKey]);

  // Save canvas to localStorage whenever it changes
  useEffect(() => {
    if (nodes.length > 0 || edges.length > 0) {
      localStorage.setItem(storageKey, JSON.stringify({ nodes, edges }));
    }
  }, [nodes, edges, storageKey]);

  // Simple approach: Use CSS transitions for smooth movement
  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      // Apply changes directly - let CSS handle the smoothness
      onNodesChange(changes);
    },
    [onNodesChange]
  );

  // Initialize canvas with project data
  const initializeCanvas = useCallback(() => {
    const initialNodes: Node[] = [];
    const initialEdges: Edge[] = [];

    // Add project goal at top center
    if (intake) {
      initialNodes.push({
        id: 'project-goal',
        type: 'note',
        position: { x: 400, y: 50 },
        data: {
          title: 'Research Goal',
          content: intake.description,
          timestamp: Date.now(),
        },
      });

      // Add constraints
      if (intake.constraints) {
        const constraints = Object.entries(intake.constraints);
        constraints.forEach(([key, value], idx) => {
          const nodeId = `constraint-${key}`;
          initialNodes.push({
            id: nodeId,
            type: 'constraint',
            position: { x: 100 + idx * 250, y: 250 },
            data: {
              title: key.charAt(0).toUpperCase() + key.slice(1),
              content: String(value),
            },
          });
          
          initialEdges.push({
            id: `edge-goal-${nodeId}`,
            source: 'project-goal',
            target: nodeId,
            style: { stroke: '#ef4444', strokeDasharray: '5,5' },
            animated: true,
          });
        });
      }
    }

    // Add context papers
    contextProjects.forEach((project, idx) => {
      const nodeId = `paper-${project.id}`;
      initialNodes.push({
        id: nodeId,
        type: 'paper',
        position: { x: 150 + (idx % 3) * 350, y: 450 + Math.floor(idx / 3) * 200 },
        data: {
          title: project.title,
          authors: project.authors,
          summary: project.summary,
          similarity: project.similarity,
        },
      });
    });

    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [intake, contextProjects, setNodes, setEdges]);

  // Handle node content updates
  const handleUpdateNode = useCallback((nodeId: string, newData: any) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...newData } }
          : node
      )
    );
  }, [setNodes]);

  // Handle adding new nodes
  const handleAddNode = useCallback((type: string) => {
    const nodeId = `${type}-${Date.now()}`;
    const newNode: Node = {
      id: nodeId,
      type,
      position: { x: menuPosition.x, y: menuPosition.y },
      data: {
        title: type.charAt(0).toUpperCase() + type.slice(1),
        content: '', // Empty by default - no placeholder text
        timestamp: Date.now(),
        onUpdate: (data: any) => handleUpdateNode(nodeId, data),
      },
    };

    setNodes((nds) => [...nds, newNode]);
    setShowAddMenu(false);
  }, [menuPosition, setNodes, handleUpdateNode]);

  // Handle canvas click to show add menu
  const handlePaneClick = useCallback((event: React.MouseEvent) => {
    const bounds = (event.target as HTMLElement).getBoundingClientRect();
    setMenuPosition({
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
    });
    setShowAddMenu(true);
  }, []);

  // Handle connecting nodes
  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge({ ...params, animated: true }, eds));
    },
    [setEdges]
  );

  return (
    <div className="h-screen relative bg-background">
      {/* Header */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 text-center">
        <h1 className="font-serif text-xl font-semibold text-foreground">
          Research Canvas
        </h1>
        <p className="text-sm text-muted-foreground">
          A living workspace with Obsidian-style physics
        </p>
      </div>

      {/* Canvas */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        onPaneClick={handlePaneClick}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.2}
        maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom: 0.7 }}
        connectionLineType="smoothstep"
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: true,
          style: { strokeWidth: 2 },
        }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
        <Controls position="bottom-right" />
      </ReactFlow>

      {/* Add Menu */}
      {showAddMenu && (
        <div
          className="absolute z-50 bg-card border border-border rounded-lg shadow-xl p-2"
          style={{ left: menuPosition.x, top: menuPosition.y }}
        >
          <button
            onClick={() => handleAddNode('note')}
            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-accent rounded text-sm"
          >
            <FileText className="w-4 h-4" />
            Add Note
          </button>
          <button
            onClick={() => handleAddNode('insight')}
            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-accent rounded text-sm"
          >
            <Lightbulb className="w-4 h-4" />
            Add Insight
          </button>
          <button
            onClick={() => handleAddNode('decision')}
            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-accent rounded text-sm"
          >
            <Target className="w-4 h-4" />
            Add Decision
          </button>
          <button
            onClick={() => handleAddNode('constraint')}
            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-accent rounded text-sm"
          >
            <AlertCircle className="w-4 h-4" />
            Add Constraint
          </button>
          <button
            onClick={() => setShowAddMenu(false)}
            className="w-full px-3 py-2 hover:bg-accent rounded text-sm text-muted-foreground mt-1"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Instructions */}
      <div className="absolute bottom-6 left-6 z-10 bg-card/90 backdrop-blur-sm border border-border rounded-lg p-4 max-w-xs shadow-lg">
        <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
          <span className="text-primary">✨</span> Canvas Guide
        </h3>
        <ul className="text-xs text-muted-foreground space-y-1.5">
          <li>• Click anywhere to add nodes</li>
          <li>• <strong>Double-click</strong> nodes to edit</li>
          <li>• <strong>Select text</strong> by clicking and dragging</li>
          <li>• Drag from dots to connect boxes</li>
          <li>• Drag nodes to organize</li>
          <li>• Your canvas auto-saves</li>
        </ul>
      </div>

      {/* Global styles for smooth node movement */}
      <style>{`
        .react-flow__node {
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        
        .react-flow__node.dragging {
          transition: none !important;
        }
        
        .react-flow__edge {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
      `}</style>
    </div>
  );
};

export default Canvas;
