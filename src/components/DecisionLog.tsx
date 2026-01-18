import { useState } from "react";
import { DecisionLogEntry } from "@/types/workspace";
import { Plus, Target, ChevronRight, Calendar, HelpCircle, X } from "lucide-react";

interface DecisionLogProps {
  entries: DecisionLogEntry[];
  onAddEntry: (entry: Omit<DecisionLogEntry, "id" | "date">) => void;
}

const DecisionLog = ({ entries, onAddEntry }: DecisionLogProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newEntry, setNewEntry] = useState({
    decision: "",
    reasoning: "",
    rejected: "",
    openQuestions: "",
  });

  const handleSubmit = () => {
    if (!newEntry.decision.trim()) return;
    onAddEntry(newEntry);
    setNewEntry({ decision: "", reasoning: "", rejected: "", openQuestions: "" });
    setIsAdding(false);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-border">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-foreground">Decision Log</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track your research decisions and reasoning
          </p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Decision
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Add new entry form */}
        {isAdding && (
          <div className="bg-card border border-border rounded-xl p-5 mb-6 fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-foreground">New Decision</h3>
              <button
                onClick={() => setIsAdding(false)}
                className="p-1 hover:bg-secondary rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  What did you decide?
                </label>
                <input
                  type="text"
                  value={newEntry.decision}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, decision: e.target.value }))}
                  placeholder="e.g., Focus on enzyme optimization over genetic modification"
                  className="w-full bg-secondary border-0 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Why did you choose this?
                </label>
                <textarea
                  value={newEntry.reasoning}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, reasoning: e.target.value }))}
                  placeholder="Lower regulatory burden, faster iteration cycles, existing team expertise..."
                  className="w-full h-20 bg-secondary border-0 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  What did you reject?
                </label>
                <textarea
                  value={newEntry.rejected}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, rejected: e.target.value }))}
                  placeholder="CRISPR approach - too long regulatory timeline, higher cost..."
                  className="w-full h-20 bg-secondary border-0 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Open questions
                </label>
                <textarea
                  value={newEntry.openQuestions}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, openQuestions: e.target.value }))}
                  placeholder="Need to validate enzyme stability at scale, unclear if substrate availability..."
                  className="w-full h-20 bg-secondary border-0 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!newEntry.decision.trim()}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  Save Decision
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Timeline */}
        {entries.length === 0 && !isAdding ? (
          <div className="text-center py-16">
            <Target className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="font-medium text-foreground mb-2">No decisions logged yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Start documenting your research decisions to build a clear trail.
            </p>
            <button
              onClick={() => setIsAdding(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Log Your First Decision
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map((entry, index) => (
              <div key={entry.id} className="relative pl-8">
                {/* Timeline line */}
                {index < entries.length - 1 && (
                  <div className="absolute left-3 top-10 bottom-0 w-0.5 bg-border" />
                )}
                
                {/* Timeline dot */}
                <div className="absolute left-0 top-2 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                </div>

                {/* Card */}
                <div className="bg-card border border-border rounded-xl p-4">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-medium text-foreground">{entry.decision}</h4>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(entry.date).toLocaleDateString()}
                    </span>
                  </div>

                  {entry.reasoning && (
                    <div className="mb-3">
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Why
                      </span>
                      <p className="text-sm text-foreground mt-1">{entry.reasoning}</p>
                    </div>
                  )}

                  {entry.rejected && (
                    <div className="mb-3">
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Rejected
                      </span>
                      <p className="text-sm text-muted-foreground mt-1">{entry.rejected}</p>
                    </div>
                  )}

                  {entry.openQuestions && (
                    <div className="flex items-start gap-2 p-2 bg-secondary/50 rounded-lg">
                      <HelpCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <p className="text-sm text-muted-foreground">{entry.openQuestions}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DecisionLog;
