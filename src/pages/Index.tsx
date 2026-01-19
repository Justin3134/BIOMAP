import { useState, useCallback } from "react";
import ProjectIntakeWizard from "@/components/ProjectIntakeWizard";
import WorkspaceLayout from "@/components/WorkspaceLayout";
import { ProjectIntake } from "@/types/workspace";

const Index = () => {
  const [intake, setIntake] = useState<ProjectIntake | null>(null);

  const handleIntakeComplete = useCallback((completedIntake: ProjectIntake) => {
    console.log("Intake completed with projectId:", completedIntake.projectId);
    setIntake(completedIntake);
  }, []);

  const handleReset = useCallback(() => {
    setIntake(null);
  }, []);

  const handleUpdateIntake = useCallback((updatedIntake: ProjectIntake) => {
    setIntake(updatedIntake);
  }, []);

  // Show wizard if no intake, otherwise show workspace
  if (!intake) {
    return <ProjectIntakeWizard onComplete={handleIntakeComplete} />;
  }

  return <WorkspaceLayout intake={intake} onReset={handleReset} onUpdateIntake={handleUpdateIntake} />;
};

export default Index;
