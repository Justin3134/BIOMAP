export interface ResearchProject {
  id: string;
  title: string;
  summary: string;
  cluster: string;
  clusterLabel: string;
  similarity: number;
  details: {
    overview: string;
    whatWorked: string[];
    whatDidntWork: string[];
    keyLessons: string[];
    relationToIdea: string;
    externalLink?: string;
    year: number;
    authors: string[];
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
