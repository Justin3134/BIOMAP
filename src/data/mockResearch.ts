import { ResearchProject, Cluster } from "@/types/research";

export const mockProjects: ResearchProject[] = [
  {
    id: "1",
    title: "CRISPR-Cas9 Gene Editing for Sickle Cell Disease",
    summary: "Targeted gene correction in hematopoietic stem cells using CRISPR technology to treat genetic blood disorders.",
    method: "Gene Editing",
    cluster: 1,
    clusterName: "Genetic Therapies",
    similarity: 0.94,
    details: {
      abstract: "This research explores the application of CRISPR-Cas9 gene editing technology to correct the genetic mutation responsible for sickle cell disease. By targeting and editing the HBB gene in patient-derived hematopoietic stem cells, we demonstrate the potential for a one-time curative treatment approach.",
      keyFindings: [
        "92% editing efficiency in stem cells",
        "Stable gene correction maintained over 18 months",
        "No off-target effects detected in clinical trials"
      ],
      year: 2024,
      authors: ["Dr. Emily Chen", "Dr. Marcus Williams", "Dr. Sarah Johnson"],
      keywords: ["CRISPR", "sickle cell", "gene therapy", "stem cells"]
    }
  },
  {
    id: "2",
    title: "mRNA Vaccines for Cancer Immunotherapy",
    summary: "Personalized mRNA-based cancer vaccines targeting patient-specific neoantigens for enhanced immune response.",
    method: "mRNA Technology",
    cluster: 1,
    clusterName: "Genetic Therapies",
    similarity: 0.87,
    details: {
      abstract: "Development of personalized cancer vaccines using mRNA technology to encode patient-specific tumor neoantigens. This approach stimulates a targeted immune response against cancer cells while minimizing damage to healthy tissue.",
      keyFindings: [
        "65% of patients showed tumor regression",
        "Personalized vaccine production in under 4 weeks",
        "Enhanced T-cell activation observed"
      ],
      year: 2024,
      authors: ["Dr. Lisa Park", "Dr. James Morrison"],
      keywords: ["mRNA", "cancer", "immunotherapy", "neoantigens"]
    }
  },
  {
    id: "3",
    title: "Neural Organoids for Drug Screening",
    summary: "Brain organoids derived from patient iPSCs for personalized neurological drug testing and disease modeling.",
    method: "Organoid Culture",
    cluster: 2,
    clusterName: "In Vitro Models",
    similarity: 0.82,
    details: {
      abstract: "This study presents a high-throughput platform for generating patient-specific brain organoids from induced pluripotent stem cells. These 3D neural structures accurately recapitulate brain development and disease pathology, enabling personalized drug screening.",
      keyFindings: [
        "Organoids develop mature neural circuits within 6 months",
        "Disease phenotypes accurately modeled in 85% of cases",
        "Reduced drug development timeline by 40%"
      ],
      year: 2023,
      authors: ["Dr. Nina Rodriguez", "Dr. Alex Turner"],
      keywords: ["organoids", "iPSC", "neurology", "drug screening"]
    }
  },
  {
    id: "4",
    title: "Microbiome Engineering for Metabolic Disorders",
    summary: "Synthetic biology approaches to engineer gut bacteria for treatment of obesity and diabetes.",
    method: "Synthetic Biology",
    cluster: 3,
    clusterName: "Microbiome",
    similarity: 0.79,
    details: {
      abstract: "Engineering of gut microbiome consortia using synthetic biology tools to produce therapeutic molecules. This approach targets metabolic pathways disrupted in obesity and type 2 diabetes, offering a novel treatment modality.",
      keyFindings: [
        "Engineered bacteria survive gut transit",
        "Significant improvement in glucose tolerance",
        "Long-term colonization achieved in animal models"
      ],
      year: 2024,
      authors: ["Dr. Michael Chang", "Dr. Rebecca Foster"],
      keywords: ["microbiome", "synthetic biology", "metabolism", "diabetes"]
    }
  },
  {
    id: "5",
    title: "Gut-Brain Axis in Neurodegenerative Disease",
    summary: "Investigating microbial metabolites and their influence on Alzheimer's disease progression.",
    method: "Metabolomics",
    cluster: 3,
    clusterName: "Microbiome",
    similarity: 0.75,
    details: {
      abstract: "Comprehensive metabolomic analysis of gut-derived compounds and their effects on neuroinflammation and protein aggregation in Alzheimer's disease. This research reveals potential therapeutic targets in the gut-brain communication pathway.",
      keyFindings: [
        "Identified 12 key metabolites linked to disease progression",
        "Dietary intervention showed cognitive improvements",
        "Novel biomarkers discovered for early detection"
      ],
      year: 2023,
      authors: ["Dr. Jennifer Liu", "Dr. Thomas Brown"],
      keywords: ["gut-brain axis", "Alzheimer's", "metabolomics", "neurodegeneration"]
    }
  },
  {
    id: "6",
    title: "AI-Driven Protein Structure Prediction",
    summary: "Deep learning models for accurate prediction of protein folding and drug-binding interactions.",
    method: "Machine Learning",
    cluster: 4,
    clusterName: "Computational Biology",
    similarity: 0.71,
    details: {
      abstract: "Development of novel deep learning architectures inspired by AlphaFold for predicting protein structures and their interactions with small molecules. This computational approach accelerates drug discovery pipelines significantly.",
      keyFindings: [
        "Accuracy within 0.5 Å RMSD for most proteins",
        "Reduced structure determination time from months to hours",
        "Successfully predicted novel drug targets"
      ],
      year: 2024,
      authors: ["Dr. David Kim", "Dr. Anna Petrov"],
      keywords: ["AI", "protein folding", "drug discovery", "deep learning"]
    }
  },
  {
    id: "7",
    title: "Single-Cell Multi-Omics in Cancer Evolution",
    summary: "Integrated analysis of genome, transcriptome, and proteome at single-cell resolution to track tumor evolution.",
    method: "Multi-Omics",
    cluster: 4,
    clusterName: "Computational Biology",
    similarity: 0.68,
    details: {
      abstract: "Novel single-cell multi-omics platform enabling simultaneous profiling of DNA, RNA, and proteins in individual cancer cells. This technology reveals the complex dynamics of tumor heterogeneity and treatment resistance.",
      keyFindings: [
        "Identified rare drug-resistant cell populations",
        "Mapped tumor evolution during treatment",
        "Discovered new biomarkers for treatment response"
      ],
      year: 2024,
      authors: ["Dr. Sarah Martinez", "Dr. Kevin White"],
      keywords: ["single-cell", "multi-omics", "cancer", "tumor evolution"]
    }
  },
  {
    id: "8",
    title: "Exosome-Mediated Drug Delivery",
    summary: "Engineered extracellular vesicles for targeted delivery of therapeutic cargo across the blood-brain barrier.",
    method: "Nanomedicine",
    cluster: 5,
    clusterName: "Drug Delivery",
    similarity: 0.65,
    details: {
      abstract: "Engineering of exosomes derived from neural stem cells for targeted delivery of siRNA and small molecules to the brain. This platform overcomes blood-brain barrier limitations for treating neurological disorders.",
      keyFindings: [
        "10-fold increase in brain accumulation vs. free drug",
        "Successful delivery to specific brain regions",
        "Minimal immunogenicity observed"
      ],
      year: 2023,
      authors: ["Dr. Robert Lee", "Dr. Michelle Wong"],
      keywords: ["exosomes", "drug delivery", "blood-brain barrier", "nanomedicine"]
    }
  },
  {
    id: "9",
    title: "Liver-on-a-Chip for Toxicity Testing",
    summary: "Microfluidic organ chips recapitulating liver physiology for predictive drug toxicity assessment.",
    method: "Organ-on-Chip",
    cluster: 2,
    clusterName: "In Vitro Models",
    similarity: 0.62,
    details: {
      abstract: "Development of a vascularized liver-on-a-chip platform that accurately predicts drug-induced liver injury. The system incorporates multiple cell types and dynamic flow conditions to mimic in vivo physiology.",
      keyFindings: [
        "87% accuracy in predicting clinical hepatotoxicity",
        "Maintained liver function for 28 days",
        "Identified mechanisms of toxicity for failed drugs"
      ],
      year: 2023,
      authors: ["Dr. Patricia Hayes", "Dr. George Miller"],
      keywords: ["organ-on-chip", "liver", "toxicity", "microfluidics"]
    }
  },
  {
    id: "10",
    title: "Lipid Nanoparticle Optimization for mRNA Delivery",
    summary: "Novel ionizable lipid formulations for enhanced mRNA delivery efficiency and reduced immunogenicity.",
    method: "Lipid Nanoparticles",
    cluster: 5,
    clusterName: "Drug Delivery",
    similarity: 0.58,
    details: {
      abstract: "Systematic optimization of lipid nanoparticle formulations for mRNA therapeutics. Novel ionizable lipids demonstrate improved endosomal escape and reduced inflammatory responses compared to current formulations.",
      keyFindings: [
        "5-fold improvement in delivery efficiency",
        "Reduced inflammatory cytokine release by 70%",
        "Stable formulation at room temperature for 6 months"
      ],
      year: 2024,
      authors: ["Dr. Amy Zhang", "Dr. Daniel Cooper"],
      keywords: ["lipid nanoparticles", "mRNA delivery", "formulation", "therapeutics"]
    }
  }
];

export const clusters: Cluster[] = [
  {
    id: 1,
    name: "Genetic Therapies",
    description: "Gene editing and mRNA-based therapeutic approaches",
    projects: mockProjects.filter(p => p.cluster === 1)
  },
  {
    id: 2,
    name: "In Vitro Models",
    description: "Organoids and organ-on-chip systems for research",
    projects: mockProjects.filter(p => p.cluster === 2)
  },
  {
    id: 3,
    name: "Microbiome",
    description: "Gut microbiota and metabolic health research",
    projects: mockProjects.filter(p => p.cluster === 3)
  },
  {
    id: 4,
    name: "Computational Biology",
    description: "AI and data-driven biological research",
    projects: mockProjects.filter(p => p.cluster === 4)
  },
  {
    id: 5,
    name: "Drug Delivery",
    description: "Novel therapeutic delivery systems",
    projects: mockProjects.filter(p => p.cluster === 5)
  }
];
