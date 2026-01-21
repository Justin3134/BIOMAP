export interface ResearchProject {
  id: string;
  paperId?: string;
  title: string;
  summary: string;
  abstract?: string; // Research paper abstract
  year?: number; // Publication year (can be at top level or in details)
  authors?: string | string[]; // Authors (can be string or array)
  cluster: string;
  clusterLabel: string;
  similarity: number;
  similarityReasons: string[]; // Why this is similar to user's idea
  url?: string; // External URL (for real Semantic Scholar papers)
  isAIGenerated?: boolean; // Whether this is an AI-generated paper
  details: {
    overview: string;
    whatWorked: string[];
    whatDidntWork: string[];
    keyLessons: string[];
    relationToIdea: string;
    externalLink?: string;
    year: number;
    authors: string[];
    approach: string;
    difficulty: "Low" | "Medium" | "High";
    cost: "Low" | "Medium" | "High";
    timeframe: string;
  };
}

export interface ResearchCluster {
  id: string;
  label: string;
  description: string;
}

export interface PatternInsight {
  pattern: string;
  frequency: string;
}
