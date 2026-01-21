import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { BookOpen, Newspaper } from "lucide-react";

interface UserNodeData {
  label: string;
  description: string;
  mode?: 'scholars' | 'news';
}

interface UserNodeProps {
  data: UserNodeData;
}

const UserNode = memo(({ data }: UserNodeProps) => {
  const { mode = 'scholars' } = data;
  const isNewsMode = mode === 'news';
  
  return (
    <div className="relative">
      <div 
        className="border-2 rounded-2xl px-6 py-4 max-w-[320px] shadow-lg transition-all duration-300 bg-node-user border-node-user-border"
        style={{ 
          boxShadow: '0 0 30px -8px hsl(150 35% 45% / 0.25)' 
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          {isNewsMode ? (
            <Newspaper className="w-4 h-4 text-primary" />
          ) : (
            <BookOpen className="w-4 h-4 text-primary" />
          )}
          <span className="text-xs font-medium uppercase tracking-wider text-primary">
            {isNewsMode ? 'Your Research Topic' : 'Your Research Idea'}
          </span>
        </div>
        <p className="text-sm leading-relaxed text-foreground">
          {data.description}
        </p>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !border-2 !border-card !bg-node-user-border"
      />
    </div>
  );
});

UserNode.displayName = "UserNode";

export default UserNode;
