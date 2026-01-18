import { useState, useCallback } from "react";
import ProjectIntakeWizard from "@/components/ProjectIntakeWizard";
import WorkspaceLayout from "@/components/WorkspaceLayout";
import { ProjectIntake } from "@/types/workspace";

interface ExtendedIntake extends ProjectIntake {
  projectId?: string;
  researchMapId?: string;
}

const Index = () => {
  const [intake, setIntake] = useState<ExtendedIntake | null>(null);

  const handleIntakeComplete = useCallback((completedIntake: ExtendedIntake) => {
    console.log("Intake completed with projectId:", completedIntake.projectId);
    setIntake(completedIntake);
  }, []);

  const handleReset = useCallback(() => {
    setIntake(null);
  }, []);

  const handleUpdateIntake = useCallback((updatedIntake: ExtendedIntake) => {
    setIntake(updatedIntake);
  }, []);

  // Show wizard if no intake, otherwise show workspace
  if (!intake) {
    return <ProjectIntakeWizard onComplete={handleIntakeComplete} />;
  }

  return <WorkspaceLayout intake={intake} onReset={handleReset} onUpdateIntake={handleUpdateIntake} />;
};

export default Index;
