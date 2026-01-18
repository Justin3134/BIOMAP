export interface ResearchProject {
  id: string;
  title: string;
  summary: string;
  method: string;
  cluster: number;
  clusterName: string;
  similarity: number;
  details: {
    abstract: string;
    keyFindings: string[];
    year: number;
    authors: string[];
    keywords: string[];
  };
}

export interface Cluster {
  id: number;
  name: string;
  description: string;
  projects: ResearchProject[];
}
