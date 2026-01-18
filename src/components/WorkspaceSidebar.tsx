import { NavLink, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Map, 
  Pin, 
  FileText, 
  Target, 
  CalendarDays,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useState } from "react";

const NAV_ITEMS = [
  { path: "/workspace", label: "Overview", icon: LayoutDashboard },
  { path: "/workspace/map", label: "Research Map", icon: Map },
  { path: "/workspace/evidence", label: "Pinned Evidence", icon: Pin },
  { path: "/workspace/notes", label: "Notes", icon: FileText },
  { path: "/workspace/decisions", label: "Decision Log", icon: Target },
  { path: "/workspace/weekly", label: "Weekly Log", icon: CalendarDays },
];

interface WorkspaceSidebarProps {
  projectGoal: string;
}

const WorkspaceSidebar = ({ projectGoal }: WorkspaceSidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  return (
    <div className={`h-full bg-card border-r border-border flex flex-col transition-all duration-300 ${
      isCollapsed ? "w-16" : "w-56"
    }`}>
      {/* Header */}
      <div className="p-4 border-b border-border">
        {!isCollapsed && (
          <div className="mb-3">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Project
            </span>
            <h2 className="font-serif font-semibold text-foreground text-sm mt-1 line-clamp-2">
              {projectGoal.slice(0, 50)}{projectGoal.length > 50 ? "..." : ""}
            </h2>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-secondary transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1">
        {NAV_ITEMS.map(item => {
          const isActive = location.pathname === item.path || 
            (item.path === "/workspace/map" && location.pathname === "/workspace");
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {!isCollapsed && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            BioPath Workspace
          </p>
        </div>
      )}
    </div>
  );
};

export default WorkspaceSidebar;
