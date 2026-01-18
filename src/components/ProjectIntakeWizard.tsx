import { useState } from "react";
import { ProjectIntake } from "@/types/workspace";
import { ArrowRight, ArrowLeft, Beaker, FlaskConical, Microscope, Cpu, TestTube, Wrench, DollarSign, Clock, Users, Sparkles, BookOpen, Target, CalendarCheck, Search } from "lucide-react";

interface ProjectIntakeWizardProps {
  onComplete: (intake: ProjectIntake) => void;
}

const CAPABILITIES = [
  { id: "pcr", label: "PCR Machine", icon: Beaker, tooltip: "Polymerase chain reaction equipment" },
  { id: "culture", label: "Cell Culture Hood", icon: FlaskConical, tooltip: "Sterile work environment for cell work" },
  { id: "sequencing", label: "Sequencing Access", icon: Cpu, tooltip: "DNA/RNA sequencing services" },
  { id: "compute", label: "Compute Resources", icon: Cpu, tooltip: "High-performance computing access" },
  { id: "microscopy", label: "Microscopy", icon: Microscope, tooltip: "Advanced imaging equipment" },
  { id: "basic_bench", label: "Basic Lab Bench Only", icon: TestTube, tooltip: "Standard lab equipment only" },
];

const INTENTS = [
  { id: "explore", label: "Explore literature", icon: BookOpen, desc: "Find and understand related research" },
  { id: "novelty", label: "Find novelty gaps", icon: Search, desc: "Discover unexplored opportunities" },
  { id: "plan", label: "Build plan + milestones", icon: Target, desc: "Create actionable research plan" },
  { id: "track", label: "Track progress weekly", icon: CalendarCheck, desc: "Log and reflect on progress" },
];

const ProjectIntakeWizard = ({ onComplete }: ProjectIntakeWizardProps) => {
  const [step, setStep] = useState(1);
  const [intake, setIntake] = useState<ProjectIntake>({
    title: "",
    goal: "",
    successCriteria: "",
    capabilities: [],
    customCapabilities: "",
    budget: "10k_50k",
    timeline: "6_12m",
    skillLevel: "intermediate",
    preference: "mixed",
    customConstraints: "",
    intents: [],
  });

  const updateIntake = (updates: Partial<ProjectIntake>) => {
    setIntake(prev => ({ ...prev, ...updates }));
  };

  const toggleCapability = (id: string) => {
    setIntake(prev => ({
      ...prev,
      capabilities: prev.capabilities.includes(id)
        ? prev.capabilities.filter(c => c !== id)
        : [...prev.capabilities, id]
    }));
  };

  const toggleIntent = (id: string) => {
    setIntake(prev => ({
      ...prev,
      intents: prev.intents.includes(id)
        ? prev.intents.filter(i => i !== id)
        : [...prev.intents, id]
    }));
  };

  const canProceed = () => {
    switch (step) {
      case 1: return intake.title.trim().length > 0 && intake.goal.trim().length > 0;
      case 2: return intake.capabilities.length > 0;
      case 3: return true;
      case 4: return intake.intents.length > 0;
      default: return false;
    }
  };

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
    else onComplete(intake);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                s === step ? "bg-primary text-primary-foreground" :
                s < step ? "bg-primary/20 text-primary" :
                "bg-secondary text-muted-foreground"
              }`}>
                {s}
              </div>
              {s < 4 && <div className={`w-12 h-0.5 ${s < step ? "bg-primary/20" : "bg-secondary"}`} />}
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-lg">
          {/* Step 1: Project Goal */}
          {step === 1 && (
            <div className="space-y-6 fade-in">
              <div className="text-center mb-8">
                <h2 className="font-serif text-2xl font-semibold text-foreground mb-2">
                  What's your research about?
                </h2>
                <p className="text-muted-foreground">
                  Give your project a name and describe your goal.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Research Title
                </label>
                <input
                  type="text"
                  value={intake.title}
                  onChange={(e) => updateIntake({ title: e.target.value })}
                  placeholder="e.g., Drought-Resistant Crop Development"
                  className="w-full bg-secondary border-0 rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Research Goal
                </label>
                <textarea
                  value={intake.goal}
                  onChange={(e) => updateIntake({ goal: e.target.value })}
                  placeholder="e.g., Developing drought-resistant crops using gene editing techniques..."
                  className="w-full h-28 bg-secondary border-0 rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  What would count as success? <span className="text-muted-foreground">(optional)</span>
                </label>
                <textarea
                  value={intake.successCriteria}
                  onChange={(e) => updateIntake({ successCriteria: e.target.value })}
                  placeholder="e.g., A validated proof-of-concept in greenhouse conditions..."
                  className="w-full h-20 bg-secondary border-0 rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>
            </div>
          )}

          {/* Step 2: Capabilities */}
          {step === 2 && (
            <div className="space-y-6 fade-in">
              <div className="text-center mb-8">
                <h2 className="font-serif text-2xl font-semibold text-foreground mb-2">
                  What do you have access to?
                </h2>
                <p className="text-muted-foreground">
                  Select the resources available to you. This helps us filter realistic approaches.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {CAPABILITIES.map(cap => {
                  const isSelected = intake.capabilities.includes(cap.id);
                  return (
                    <button
                      key={cap.id}
                      onClick={() => toggleCapability(cap.id)}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/30 bg-secondary/50"
                      }`}
                      title={cap.tooltip}
                    >
                      <cap.icon className={`w-5 h-5 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                      <span className={`text-sm font-medium ${isSelected ? "text-foreground" : "text-muted-foreground"}`}>
                        {cap.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Custom capabilities input */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Other resources or equipment <span className="text-muted-foreground">(optional)</span>
                </label>
                <textarea
                  value={intake.customCapabilities}
                  onChange={(e) => updateIntake({ customCapabilities: e.target.value })}
                  placeholder="e.g., Access to a greenhouse, HPLC machine, specific software licenses..."
                  className="w-full h-20 bg-secondary border-0 rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>
            </div>
          )}

          {/* Step 3: Constraints */}
          {step === 3 && (
            <div className="space-y-6 fade-in">
              <div className="text-center mb-8">
                <h2 className="font-serif text-2xl font-semibold text-foreground mb-2">
                  What are your constraints?
                </h2>
                <p className="text-muted-foreground">
                  Help us understand your practical limitations.
                </p>
              </div>

              <div className="space-y-5">
                {/* Budget */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-3">
                    <DollarSign className="w-4 h-4 text-primary" />
                    Budget Range
                  </label>
                  <div className="flex gap-2">
                    {[
                      { id: "under_10k", label: "< $10K" },
                      { id: "10k_50k", label: "$10K - $50K" },
                      { id: "50k_plus", label: "$50K+" },
                    ].map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => updateIntake({ budget: opt.id as ProjectIntake["budget"] })}
                        className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors ${
                          intake.budget === opt.id
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
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-3">
                    <Clock className="w-4 h-4 text-primary" />
                    Timeline
                  </label>
                  <div className="flex gap-2">
                    {[
                      { id: "under_6m", label: "< 6 months" },
                      { id: "6_12m", label: "6-12 months" },
                      { id: "over_12m", label: "12+ months" },
                    ].map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => updateIntake({ timeline: opt.id as ProjectIntake["timeline"] })}
                        className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors ${
                          intake.timeline === opt.id
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
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-3">
                    <Users className="w-4 h-4 text-primary" />
                    Team Skill Level
                  </label>
                  <div className="flex gap-2">
                    {[
                      { id: "beginner", label: "Beginner" },
                      { id: "intermediate", label: "Intermediate" },
                      { id: "advanced", label: "Advanced" },
                    ].map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => updateIntake({ skillLevel: opt.id as ProjectIntake["skillLevel"] })}
                        className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors ${
                          intake.skillLevel === opt.id
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
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-3">
                    <Wrench className="w-4 h-4 text-primary" />
                    Approach Preference
                  </label>
                  <div className="flex gap-2">
                    {[
                      { id: "wet_lab", label: "Wet Lab" },
                      { id: "computational", label: "Computational" },
                      { id: "mixed", label: "Mixed" },
                    ].map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => updateIntake({ preference: opt.id as ProjectIntake["preference"] })}
                        className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-colors ${
                          intake.preference === opt.id
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom constraints input */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Other constraints or considerations <span className="text-muted-foreground">(optional)</span>
                  </label>
                  <textarea
                    value={intake.customConstraints}
                    onChange={(e) => updateIntake({ customConstraints: e.target.value })}
                    placeholder="e.g., Limited access to certain reagents, regulatory requirements, geographic limitations..."
                    className="w-full h-20 bg-secondary border-0 rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Intent */}
          {step === 4 && (
            <div className="space-y-6 fade-in">
              <div className="text-center mb-8">
                <h2 className="font-serif text-2xl font-semibold text-foreground mb-2">
                  What do you want from BioPath?
                </h2>
                <p className="text-muted-foreground">
                  Select all that apply. This shapes your workspace experience.
                </p>
              </div>

              <div className="space-y-3">
                {INTENTS.map(intent => {
                  const isSelected = intake.intents.includes(intent.id);
                  return (
                    <button
                      key={intent.id}
                      onClick={() => toggleIntent(intent.id)}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/30 bg-secondary/50"
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isSelected ? "bg-primary/20" : "bg-secondary"
                      }`}>
                        <intent.icon className={`w-5 h-5 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                      </div>
                      <div>
                        <span className={`block font-medium ${isSelected ? "text-foreground" : "text-muted-foreground"}`}>
                          {intent.label}
                        </span>
                        <span className="text-xs text-muted-foreground">{intent.desc}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
            <button
              onClick={() => setStep(step - 1)}
              disabled={step === 1}
              className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-0"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {step === 4 ? (
                <>
                  <Sparkles className="w-4 h-4" />
                  Enter Workspace
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Step label */}
        <p className="text-center text-sm text-muted-foreground mt-4">
          Step {step} of 4 · {step === 1 ? "Project Goal" : step === 2 ? "Capabilities" : step === 3 ? "Constraints" : "Intent"}
        </p>
      </div>
    </div>
  );
};

export default ProjectIntakeWizard;
