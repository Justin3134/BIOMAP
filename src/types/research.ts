export interface ResearchProject {
  id: string;
  title: string;
  summary: string;
  cluster: string;
  clusterLabel: string;
  similarity: number;
  similarityReasons: string[]; // Why this is similar to user's idea
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
