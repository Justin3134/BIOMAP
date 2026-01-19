import { useState, useCallback } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import WorkspaceSidebar from "./WorkspaceSidebar";
import ResearchLandscape from "./ResearchLandscape";
import PinnedEvidence from "./PinnedEvidence";
import ChatSidebar from "./ChatSidebar";
import { ProjectIntake, WorkspaceState, DecisionLogEntry, PinnedEvidence as PinnedEvidenceType } from "@/types/workspace";
import { ResearchProject } from "@/types/research";
import { FileText, Save } from "lucide-react";

interface WorkspaceLayoutProps {
  intake: ProjectIntake;
  onReset: () => void;
  onUpdateIntake: (intake: ProjectIntake) => void;
}

const WorkspaceLayout = ({ intake, onReset, onUpdateIntake }: WorkspaceLayoutProps) => {
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

  // Pinned Evidence handlers - toggle pin/unpin
  const handlePinEvidence = useCallback((project: ResearchProject) => {
    setWorkspaceState(prev => {
      const existingIndex = prev.pinnedEvidence.findIndex(e => e.projectId === project.id);
      if (existingIndex >= 0) {
        // Unpin - remove from list
        return {
          ...prev,
          pinnedEvidence: prev.pinnedEvidence.filter(e => e.projectId !== project.id),
        };
      } else {
        // Pin - add to list
        const newEvidence: PinnedEvidenceType = {
          id: Date.now().toString(),
          projectId: project.id,
          projectTitle: project.title,
          dateAdded: new Date(),
          tags: [],
          notes: "",
        };
        return {
          ...prev,
          pinnedEvidence: [newEvidence, ...prev.pinnedEvidence],
        };
      }
    });
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
  const handleAddToContext = useCallback((project: ResearchProject) => {
    setChatContext(prev => {
      const isAlreadyInContext = prev.some(p => p.id === project.id);
      if (isAlreadyInContext) {
        return prev.filter(p => p.id !== project.id);
      }
      if (prev.length >= 3) {
        return [...prev.slice(1), project];
      }
      return [...prev, project];
    });
  }, []);

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

  // Overview page component with editing
  const OverviewPage = () => {
    const [editedIntake, setEditedIntake] = useState<ProjectIntake>(intake);
    const [hasChanges, setHasChanges] = useState(false);

    const updateField = (field: keyof ProjectIntake, value: string) => {
      setEditedIntake(prev => ({ ...prev, [field]: value }));
      setHasChanges(true);
    };

    const handleSave = () => {
      onUpdateIntake(editedIntake);
      setHasChanges(false);
    };

    return (
      <div className="h-full overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-serif text-2xl font-semibold text-foreground mb-1">Project Overview</h1>
            <p className="text-sm text-muted-foreground">
              Edit your project details below
            </p>
          </div>
        </div>

        {/* Project Goal */}
        <div className="bg-card border border-border rounded-xl p-5 mb-4">
          <label className="block font-medium text-foreground mb-2">Project Goal</label>
          <textarea
            value={editedIntake.goal}
            onChange={(e) => updateField("goal", e.target.value)}
            className="w-full h-24 bg-secondary border-0 rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
          />
          
          <div className="mt-4">
            <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Success Criteria
            </label>
            <textarea
              value={editedIntake.successCriteria}
              onChange={(e) => updateField("successCriteria", e.target.value)}
              placeholder="What would count as success?"
              className="w-full h-16 bg-secondary border-0 rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
            />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <span className="text-2xl font-semibold text-primary">{workspaceState.pinnedEvidence.length}</span>
            <p className="text-xs text-muted-foreground mt-1">Pinned Evidence</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <span className="text-2xl font-semibold text-primary">{workspaceState.decisionLog.length}</span>
            <p className="text-xs text-muted-foreground mt-1">Decisions Logged</p>
          </div>
        </div>

        {/* Constraints Summary */}
        <div className="bg-card border border-border rounded-xl p-5 mb-4">
          <h3 className="font-medium text-foreground mb-3">Your Constraints</h3>
          
          {/* Budget */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Budget</label>
            <div className="flex gap-2">
              {[
                { id: "under_10k", label: "< $10K" },
                { id: "10k_50k", label: "$10K - $50K" },
                { id: "50k_plus", label: "$50K+" },
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => {
                    setEditedIntake(prev => ({ ...prev, budget: opt.id as ProjectIntake["budget"] }));
                    setHasChanges(true);
                  }}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    editedIntake.budget === opt.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Timeline</label>
            <div className="flex gap-2">
              {[
                { id: "under_6m", label: "< 6 months" },
                { id: "6_12m", label: "6-12 months" },
                { id: "over_12m", label: "12+ months" },
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => {
                    setEditedIntake(prev => ({ ...prev, timeline: opt.id as ProjectIntake["timeline"] }));
                    setHasChanges(true);
                  }}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    editedIntake.timeline === opt.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Skill Level */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Skill Level</label>
            <div className="flex gap-2">
              {[
                { id: "beginner", label: "Beginner" },
                { id: "intermediate", label: "Intermediate" },
                { id: "advanced", label: "Advanced" },
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => {
                    setEditedIntake(prev => ({ ...prev, skillLevel: opt.id as ProjectIntake["skillLevel"] }));
                    setHasChanges(true);
                  }}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    editedIntake.skillLevel === opt.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Preference */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Approach Preference</label>
            <div className="flex gap-2">
              {[
                { id: "wet_lab", label: "Wet Lab" },
                { id: "computational", label: "Computational" },
                { id: "mixed", label: "Mixed" },
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => {
                    setEditedIntake(prev => ({ ...prev, preference: opt.id as ProjectIntake["preference"] }));
                    setHasChanges(true);
                  }}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    editedIntake.preference === opt.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Constraints */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Additional Constraints
            </label>
            <textarea
              value={editedIntake.customConstraints}
              onChange={(e) => updateField("customConstraints", e.target.value)}
              placeholder="Any other constraints..."
              className="w-full h-16 bg-secondary border-0 rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
            />
          </div>
        </div>

        {/* Additional Resources */}
        <div className="bg-card border border-border rounded-xl p-5 mb-6">
          <label className="block font-medium text-foreground mb-2">Additional Resources</label>
          <textarea
            value={editedIntake.customCapabilities}
            onChange={(e) => updateField("customCapabilities", e.target.value)}
            placeholder="Equipment, software, or other resources you have access to..."
            className="w-full h-16 bg-secondary border-0 rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
          />
        </div>

        {/* Update Button */}
        <button
          onClick={handleSave}
          disabled={!hasChanges}
          className={`w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-medium transition-colors ${
            hasChanges
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "bg-secondary text-muted-foreground cursor-not-allowed"
          }`}
        >
          <Save className="w-4 h-4" />
          Update Project
        </button>
      </div>
    );
  };

  return (
    <div className="h-screen flex bg-background">
      {/* Left Sidebar */}
      <WorkspaceSidebar projectTitle={intake.title} />

      {/* Main Content */}
      <div className="flex-1 flex">
        <div className="flex-1 overflow-hidden">
          <Routes>
            <Route index element={<Navigate to="map" replace />} />
            <Route path="map" element={
              <ResearchLandscape 
                userQuery={intake.goal} 
                onReset={onReset}
                intake={intake}
                onPinEvidence={handlePinEvidence}
                pinnedEvidenceIds={workspaceState.pinnedEvidence.map(e => e.projectId)}
                chatContext={chatContext}
                onAddToContext={handleAddToContext}
              />
            } />
            <Route path="evidence" element={
              <PinnedEvidence
                evidence={workspaceState.pinnedEvidence}
                onRemove={handleRemoveEvidence}
                onUpdateTags={handleUpdateEvidenceTags}
              />
            } />
            <Route path="notes" element={<NotesPage />} />
            <Route path="overview" element={<OverviewPage />} />
          </Routes>
        </div>

        {/* Chat Sidebar - only on map view */}
        <ChatSidebar
          projectId={intake.projectId}
          contextProjects={chatContext}
          onRemoveContext={handleRemoveFromContext}
        />
      </div>
    </div>
  );
};

export default WorkspaceLayout;
