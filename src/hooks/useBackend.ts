import { useState, useEffect } from 'react';
import { projectAPI, researchAPI, notesAPI, chatAPI, healthCheck } from '@/lib/api';

/**
 * Hook to check backend connectivity
 */
export function useBackendHealth() {
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const result = await healthCheck();
        setIsHealthy(result.status === 'ok');
        setError(null);
      } catch (err) {
        setIsHealthy(false);
        setError(err instanceof Error ? err.message : 'Backend not responding');
      }
    };

    checkHealth();
    
    // Check every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return { isHealthy, error };
}

/**
 * Example usage hook for projects
 */
export function useProject(projectId: string | null) {
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;

    const fetchProject = async () => {
      setLoading(true);
      try {
        const data = await projectAPI.get(projectId);
        setProject(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load project');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  return { project, loading, error };
}

// Export APIs for direct use
export { projectAPI, researchAPI, notesAPI, chatAPI };

