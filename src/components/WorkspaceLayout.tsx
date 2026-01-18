import { useState, useCallback } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import WorkspaceSidebar from "./WorkspaceSidebar";
import ResearchLandscape from "./ResearchLandscape";
import PinnedEvidence from "./PinnedEvidence";
import ChatSidebar from "./ChatSidebar";
import { ProjectIntake, WorkspaceState, DecisionLogEntry, PinnedEvidence as PinnedEvidenceType } from "@/types/workspace";
import { ResearchProject } from "@/types/research";
import { FileText } from "lucide-react";

interface WorkspaceLayoutProps {
  intake: ProjectIntake;
  onReset: () => void;
}

const WorkspaceLayout = ({ intake, onReset }: WorkspaceLayoutProps) => {
  const [workspaceState, setWorkspaceState] = useState<WorkspaceState>({
    intake,
    pinnedEvidence: [],
    decisionLog: [],
    weeklyLog: [],
    notes: "",
  });

  const [chatContext, setChatContext] = useState<ResearchProject[]>([]);

  // Decision Log handlers
  const handleAddDecision = useCallback((entry: Omit<DecisionLogEntry, "id" | "date">) => {
    const newEntry: DecisionLogEntry = {
      ...entry,
      id: Date.now().toString(),
      date: new Date(),
    };
    setWorkspaceState(prev => ({
      ...prev,
      decisionLog: [newEntry, ...prev.decisionLog],
    }));
  }, []);

  // Pinned Evidence handlers
  const handlePinEvidence = useCallback((project: ResearchProject) => {
    const newEvidence: PinnedEvidenceType = {
      id: Date.now().toString(),
      projectId: project.id,
      projectTitle: project.title,
      dateAdded: new Date(),
      tags: [],
      notes: "",
    };
    setWorkspaceState(prev => ({
      ...prev,
      pinnedEvidence: [newEvidence, ...prev.pinnedEvidence],
    }));
  }, []);

  const handleRemoveEvidence = useCallback((id: string) => {
    setWorkspaceState(prev => ({
      ...prev,
      pinnedEvidence: prev.pinnedEvidence.filter(e => e.id !== id),
    }));
  }, []);

  const handleUpdateEvidenceTags = useCallback((id: string, tags: string[]) => {
    setWorkspaceState(prev => ({
      ...prev,
      pinnedEvidence: prev.pinnedEvidence.map(e =>
        e.id === id ? { ...e, tags } : e
      ),
    }));
  }, []);

  // Chat context handlers
  const handleRemoveFromContext = useCallback((projectId: string) => {
    setChatContext(prev => prev.filter(p => p.id !== projectId));
  }, []);

  // Notes page component
  const NotesPage = () => (
    <div className="h-full flex flex-col p-6">
      <h1 className="font-serif text-2xl font-semibold text-foreground mb-2">Notes</h1>
      <p className="text-sm text-muted-foreground mb-4">
        Free-form notes for your research project
      </p>
      <textarea
        value={workspaceState.notes}
        onChange={(e) => setWorkspaceState(prev => ({ ...prev, notes: e.target.value }))}
        placeholder="Start typing your notes..."
        className="flex-1 w-full bg-card border border-border rounded-xl p-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
      />
    </div>
  );

  // Overview page component
  const OverviewPage = () => (
    <div className="h-full overflow-y-auto p-6">
      <h1 className="font-serif text-2xl font-semibold text-foreground mb-2">Project Overview</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Your research workspace at a glance
      </p>

      {/* Project Goal */}
      <div className="bg-card border border-border rounded-xl p-5 mb-4">
        <h3 className="font-medium text-foreground mb-2">Project Goal</h3>
        <p className="text-sm text-muted-foreground">{intake.goal}</p>
        {intake.successCriteria && (
          <div className="mt-3 pt-3 border-t border-border">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Success Criteria
            </span>
            <p className="text-sm text-foreground mt-1">{intake.successCriteria}</p>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <span className="text-2xl font-semibold text-primary">{workspaceState.pinnedEvidence.length}</span>
          <p className="text-xs text-muted-foreground mt-1">Pinned Evidence</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <span className="text-2xl font-semibold text-primary">{workspaceState.decisionLog.length}</span>
          <p className="text-xs text-muted-foreground mt-1">Decisions Logged</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <span className="text-2xl font-semibold text-primary">{workspaceState.weeklyLog.length}</span>
          <p className="text-xs text-muted-foreground mt-1">Weekly Entries</p>
        </div>
      </div>

      {/* Constraints Summary */}
      <div className="bg-card border border-border rounded-xl p-5 mb-4">
        <h3 className="font-medium text-foreground mb-3">Your Constraints</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-muted-foreground">Budget:</span>
            <span className="text-foreground ml-2">
              {intake.budget === "under_10k" ? "< $10K" : intake.budget === "10k_50k" ? "$10K-$50K" : "$50K+"}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Timeline:</span>
            <span className="text-foreground ml-2">
              {intake.timeline === "under_6m" ? "< 6 months" : intake.timeline === "6_12m" ? "6-12 months" : "12+ months"}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Skill Level:</span>
            <span className="text-foreground ml-2 capitalize">{intake.skillLevel}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Preference:</span>
            <span className="text-foreground ml-2 capitalize">{intake.preference.replace("_", " ")}</span>
          </div>
        </div>
        {intake.customConstraints && (
          <div className="mt-3 pt-3 border-t border-border">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Additional Constraints
            </span>
            <p className="text-sm text-foreground mt-1">{intake.customConstraints}</p>
          </div>
        )}
      </div>

      {/* Capabilities Summary */}
      {intake.customCapabilities && (
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-medium text-foreground mb-2">Additional Resources</h3>
          <p className="text-sm text-muted-foreground">{intake.customCapabilities}</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="h-screen flex bg-background">
      {/* Left Sidebar */}
      <WorkspaceSidebar projectGoal={intake.goal} />

      {/* Main Content */}
      <div className="flex-1 flex">
        <div className="flex-1 overflow-hidden">
          <Routes>
            <Route path="/" element={<Navigate to="/workspace/map" replace />} />
            <Route path="/map" element={
              <ResearchLandscape 
                userQuery={intake.goal} 
                onReset={onReset}
                intake={intake}
                onPinEvidence={handlePinEvidence}
                onAddDecision={handleAddDecision}
                pinnedEvidenceIds={workspaceState.pinnedEvidence.map(e => e.projectId)}
              />
            } />
            <Route path="/evidence" element={
              <PinnedEvidence
                evidence={workspaceState.pinnedEvidence}
                onRemove={handleRemoveEvidence}
                onUpdateTags={handleUpdateEvidenceTags}
              />
            } />
            <Route path="/notes" element={<NotesPage />} />
            <Route path="/overview" element={<OverviewPage />} />
          </Routes>
        </div>

        {/* Chat Sidebar - only on map view */}
        <ChatSidebar
          contextProjects={chatContext}
          onRemoveContext={handleRemoveFromContext}
        />
      </div>
    </div>
  );
};

export default WorkspaceLayout;
