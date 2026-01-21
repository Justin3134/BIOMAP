import { memo } from "react";
import { Handle, Position } from "@xyflow/react";

interface ClusterNodeData {
  label: string;
  description: string;
  projectCount: number;
  mode?: 'scholars' | 'news';
}

interface ClusterNodeProps {
  data: ClusterNodeData;
}

const ClusterNode = memo(({ data }: ClusterNodeProps) => {
  const { mode = 'scholars' } = data;
  const isNewsMode = mode === 'news';
  
  return (
    <div className="relative">
      <Handle
        type="target"
        position={Position.Top}
        className={`
          !w-2 !h-2 !border-2 !border-card transition-colors
          ${isNewsMode ? '!bg-yellow-500' : '!bg-blue-500'}
        `}
      />
      <div className={`
        border rounded-xl px-5 py-3 min-w-[160px] text-center node-card transition-all duration-300
        ${isNewsMode 
          ? 'bg-yellow-50 dark:bg-yellow-950/50 border-yellow-400 dark:border-yellow-600' 
          : 'bg-blue-50 dark:bg-blue-950/50 border-blue-400 dark:border-blue-600'
        }
      `}>
        <h3 className={`
          font-serif font-semibold text-sm mb-1
          ${isNewsMode ? 'text-yellow-900 dark:text-yellow-100' : 'text-blue-900 dark:text-blue-100'}
        `}>
          {data.label}
        </h3>
        <p className={`
          text-xs
          ${isNewsMode ? 'text-yellow-700 dark:text-yellow-300' : 'text-blue-700 dark:text-blue-300'}
        `}>
          {data.projectCount} {isNewsMode ? 'articles' : 'projects'}
        </p>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className={`
          !w-2 !h-2 !border-2 !border-card transition-colors
          ${isNewsMode ? '!bg-yellow-500' : '!bg-blue-500'}
        `}
      />
    </div>
  );
});

ClusterNode.displayName = "ClusterNode";

export default ClusterNode;
