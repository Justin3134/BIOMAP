import { NavLink, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Map, 
  Pin, 
  FileText,
  ChevronLeft,
  ChevronRight,
  Layers
} from "lucide-react";
import { useState } from "react";

const NAV_ITEMS = [
  { path: "overview", label: "Overview", icon: LayoutDashboard },
  { path: "map", label: "Research Map", icon: Map },
  { path: "canvas", label: "Canvas", icon: Layers },
  { path: "evidence", label: "Pinned Evidence", icon: Pin },
  { path: "notes", label: "Notes", icon: FileText },
];

interface WorkspaceSidebarProps {
  projectTitle: string;
}

const WorkspaceSidebar = ({ projectTitle }: WorkspaceSidebarProps) => {
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
              {projectTitle || "Untitled Project"}
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

      <nav className="flex-1 p-2 space-y-1">
        {NAV_ITEMS.map(item => {
          const isActive = location.pathname.endsWith(item.path) || 
            (item.path === "map" && (location.pathname === "/" || location.pathname === "/workspace"));
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
