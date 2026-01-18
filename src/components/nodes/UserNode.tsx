import { memo } from "react";
import { Handle, Position } from "@xyflow/react";

interface UserNodeData {
  label: string;
  description: string;
}

interface UserNodeProps {
  data: UserNodeData;
}

const UserNode = memo(({ data }: UserNodeProps) => {
  return (
    <div className="relative">
      <div 
        className="bg-node-user border-2 border-node-user-border rounded-2xl px-6 py-4 max-w-[280px] shadow-lg"
        style={{ boxShadow: '0 0 30px -8px hsl(150 35% 45% / 0.25)' }}
      >
        <span className="text-xs font-medium text-primary uppercase tracking-wider block mb-2">
          Your Research Idea
        </span>
        <p className="text-sm text-foreground leading-relaxed">
          {data.description}
        </p>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-node-user-border !border-2 !border-card"
      />
    </div>
  );
});

UserNode.displayName = "UserNode";

export default UserNode;
