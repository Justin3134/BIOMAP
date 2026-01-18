import { memo } from "react";
import { Handle, Position } from "@xyflow/react";

interface ClusterNodeData {
  label: string;
  description: string;
  projectCount: number;
}

interface ClusterNodeProps {
  data: ClusterNodeData;
}

const ClusterNode = memo(({ data }: ClusterNodeProps) => {
  return (
    <div className="relative">
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2 !h-2 !bg-node-cluster-border !border-2 !border-card"
      />
      <div className="bg-node-cluster border border-node-cluster-border rounded-xl px-5 py-3 min-w-[160px] text-center node-card">
        <h3 className="font-serif font-semibold text-foreground text-sm mb-1">
          {data.label}
        </h3>
        <p className="text-xs text-muted-foreground">
          {data.projectCount} projects
        </p>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2 !h-2 !bg-node-cluster-border !border-2 !border-card"
      />
    </div>
  );
});

ClusterNode.displayName = "ClusterNode";

export default ClusterNode;
