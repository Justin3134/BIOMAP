export interface ProjectIntake {
  // Step 1: Project Goal
  title: string;
  goal: string;
  successCriteria: string;
  
  // Step 2: Capabilities
  capabilities: string[];
  customCapabilities: string;
  
  // Step 3: Constraints
  budget: "under_10k" | "10k_50k" | "50k_plus";
  timeline: "under_6m" | "6_12m" | "over_12m";
  skillLevel: "beginner" | "intermediate" | "advanced";
  preference: "wet_lab" | "computational" | "mixed";
  customConstraints: string;
  
  // Step 4: Intent
  intents: string[];
}

export interface DecisionLogEntry {
  id: string;
  date: Date;
  decision: string;
  reasoning: string;
  rejected: string;
  openQuestions: string;
  relatedProjectId?: string;
}

export interface WeeklyLogEntry {
  id: string;
  weekOf: Date;
  learned: string;
  hypothesisChanges: string;
  nextSteps: string;
}

export interface PinnedEvidence {
  id: string;
  projectId: string;
  projectTitle: string;
  dateAdded: Date;
  tags: string[];
  notes: string;
}

export interface WorkspaceState {
  intake: ProjectIntake | null;
  pinnedEvidence: PinnedEvidence[];
  decisionLog: DecisionLogEntry[];
  weeklyLog: WeeklyLogEntry[];
  notes: string;
}
