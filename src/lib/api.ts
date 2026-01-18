/**
 * BioMap API Client
 * Connects frontend to the intelligent backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Helper function for API calls
async function apiCall(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || `API error: ${response.status}`);
  }

  return response.json();
}

// ===== PROJECT APIs =====

export interface ProjectInput {
  description: string;
  capabilities?: Record<string, any>;
  constraints?: Record<string, any>;
}

export interface Project {
  id: string;
  description: string;
  capabilities: Record<string, any>;
  constraints: Record<string, any>;
  summary: string;
  createdAt: string;
  updatedAt: string;
}

export const projectAPI = {
  create: async (data: ProjectInput): Promise<Project> => {
    const result = await apiCall('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return result.project;
  },

  get: async (id: string): Promise<Project> => {
    return apiCall(`/projects/${id}`);
  },

  getAll: async (): Promise<Project[]> => {
    return apiCall('/projects');
  },

  update: async (id: string, data: Partial<ProjectInput>): Promise<Project> => {
    return apiCall(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

// ===== RESEARCH APIs =====

export interface ResearchCluster {
  branch_id: string;
  label: string;
  papers: Array<{
    paperId: string;
    title: string;
    year: number;
    authors: string;
    abstract: string;
    citationCount: number;
    similarity: number;
    venue: string;
  }>;
  avgSimilarity: number;
}

export interface EvidenceCard {
  what_worked: string[];
  limitations: string[];
  key_lessons: string[];
  practical_constraints: string[];
}

export const researchAPI = {
  // Step 2: Build Research Landscape (THE CORE)
  buildMap: async (projectId: string): Promise<{ clusters: ResearchCluster[]; totalPapers: number }> => {
    return apiCall(`/research/map/${projectId}`, {
      method: 'POST',
    });
  },

  getMap: async (projectId: string): Promise<{ clusters: ResearchCluster[]; totalPapers: number }> => {
    return apiCall(`/research/map/${projectId}`);
  },

  // Step 3: Extract Evidence Card
  extractEvidence: async (paperId: string, title: string, abstract: string): Promise<EvidenceCard> => {
    const result = await apiCall('/research/evidence', {
      method: 'POST',
      body: JSON.stringify({ paperId, title, abstract }),
    });
    return result.evidence;
  },
};

// ===== NOTES APIs =====

export interface Note {
  id: string;
  projectId: string;
  content: string;
  linkedSources: Array<{ type: string; id: string; title?: string }>;
  createdAt: string;
  updatedAt: string;
}

export const notesAPI = {
  create: async (projectId: string, content: string, linkedSources: any[] = []): Promise<Note> => {
    const result = await apiCall('/notes', {
      method: 'POST',
      body: JSON.stringify({ projectId, content, linkedSources }),
    });
    return result.note;
  },

  getByProject: async (projectId: string): Promise<Note[]> => {
    return apiCall(`/notes/project/${projectId}`);
  },

  get: async (id: string): Promise<Note> => {
    return apiCall(`/notes/${id}`);
  },

  update: async (id: string, content: string, linkedSources?: any[]): Promise<Note> => {
    return apiCall(`/notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ content, linkedSources }),
    });
  },

  // Step 4: AI Refinement
  refine: async (id: string, action: 'clarify' | 'summarize' | 'next_steps'): Promise<string> => {
    const result = await apiCall(`/notes/${id}/refine`, {
      method: 'POST',
      body: JSON.stringify({ action }),
    });
    return result.refinedContent;
  },

  delete: async (id: string): Promise<void> => {
    await apiCall(`/notes/${id}`, { method: 'DELETE' });
  },
};

// ===== CHAT APIs =====

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  contextUsed?: {
    papersCount: number;
    notesCount: number;
  };
}

export const chatAPI = {
  // Step 5: Context-Aware Chat (MOST IMPORTANT)
  send: async (
    projectId: string,
    message: string,
    selectedPaperIds?: string[]
  ): Promise<{ response: string; contextUsed: { papers: number; notes: number } }> => {
    return apiCall('/chat', {
      method: 'POST',
      body: JSON.stringify({ projectId, message, selectedPaperIds }),
    });
  },

  getHistory: async (projectId: string): Promise<{ messages: ChatMessage[] }> => {
    return apiCall(`/chat/history/${projectId}`);
  },

  clearHistory: async (projectId: string): Promise<void> => {
    await apiCall(`/chat/history/${projectId}`, { method: 'DELETE' });
  },
};

// Health check
export const healthCheck = async (): Promise<{ status: string; message: string }> => {
  return apiCall('/health', { method: 'GET' });
};

