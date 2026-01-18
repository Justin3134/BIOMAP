import { ResearchProject, ResearchCluster, PatternInsight } from "@/types/research";

export const clusters: ResearchCluster[] = [
  { id: "genetic", label: "Genetic Modification", description: "Gene editing and genetic engineering approaches" },
  { id: "enzyme", label: "Enzyme-Based Approaches", description: "Enzyme optimization and biocatalysis" },
  { id: "computational", label: "Computational Modeling", description: "In-silico analysis and simulation" },
  { id: "environmental", label: "Environmental Studies", description: "Field observation and ecological research" },
];

export const mockProjects: ResearchProject[] = [
  {
    id: "p1",
    title: "CRISPR-Cas9 for Crop Resilience",
    summary: "Gene editing to enhance drought tolerance in wheat varieties",
    cluster: "genetic",
    clusterLabel: "Genetic Modification",
    similarity: 0.92,
    details: {
      overview: "This research applied CRISPR-Cas9 gene editing to modify drought-response genes in wheat, achieving a 40% improvement in water-use efficiency under controlled conditions.",
      whatWorked: [
        "High editing efficiency (85%) in target genes",
        "Stable inheritance across three generations",
        "No detectable off-target effects"
      ],
      whatDidntWork: [
        "Field trials showed lower improvement than lab results",
        "Regulatory approval process took 3 years",
        "Some edited lines showed reduced yield"
      ],
      keyLessons: [
        "Start regulatory conversations early",
        "Always validate with field trials before publishing",
        "Consider polygenic approaches for complex traits"
      ],
      relationToIdea: "Directly relevant if you're exploring genetic approaches to plant resilience. The methodology and regulatory insights would transfer well.",
      externalLink: "https://example.com/crispr-crops",
      year: 2023,
      authors: ["Dr. Sarah Chen", "Prof. Michael Torres"]
    }
  },
  {
    id: "p2",
    title: "mRNA Delivery in Plant Cells",
    summary: "Novel lipid nanoparticle system for transient gene expression",
    cluster: "genetic",
    clusterLabel: "Genetic Modification",
    similarity: 0.78,
    details: {
      overview: "Developed a lipid nanoparticle delivery system adapted from mammalian research for transient expression in plant cells, bypassing GMO regulations.",
      whatWorked: [
        "Successful transient expression in 70% of treated cells",
        "Non-integrating approach simplified regulatory pathway",
        "Cost-effective at scale"
      ],
      whatDidntWork: [
        "Expression duration limited to 5-7 days",
        "Required multiple applications for sustained effect",
        "Some plant species showed resistance to uptake"
      ],
      keyLessons: [
        "Transient approaches can be valuable for certain applications",
        "Consider species-specific optimization early",
        "Regulatory advantages may outweigh technical limitations"
      ],
      relationToIdea: "Useful if you want to avoid permanent genetic modification. The delivery technology could complement other approaches.",
      year: 2024,
      authors: ["Dr. Lisa Park", "Dr. James Wright"]
    }
  },
  {
    id: "p3",
    title: "Cellulase Optimization via Directed Evolution",
    summary: "Engineering more efficient enzymes for biofuel production",
    cluster: "enzyme",
    clusterLabel: "Enzyme-Based Approaches",
    similarity: 0.85,
    details: {
      overview: "Used directed evolution over 12 rounds to improve cellulase activity 8-fold, significantly reducing costs for cellulosic biofuel production.",
      whatWorked: [
        "Systematic screening identified beneficial mutations",
        "Combined mutations showed synergistic effects",
        "Thermostability improved alongside activity"
      ],
      whatDidntWork: [
        "High-throughput screening was expensive initially",
        "Some promising variants lost stability",
        "Scale-up revealed unexpected substrate inhibition"
      ],
      keyLessons: [
        "Screen for multiple properties simultaneously",
        "Plan for scale-up challenges from the start",
        "Document failed variants—they inform future work"
      ],
      relationToIdea: "Highly relevant for enzyme engineering projects. The screening methodology and lessons on scale-up are transferable.",
      year: 2023,
      authors: ["Prof. Maria Rodriguez", "Dr. Kevin Liu"]
    }
  },
  {
    id: "p4",
    title: "Immobilized Enzyme Bioreactors",
    summary: "Continuous flow systems for industrial enzyme applications",
    cluster: "enzyme",
    clusterLabel: "Enzyme-Based Approaches",
    similarity: 0.71,
    details: {
      overview: "Designed and tested continuous flow bioreactors with immobilized enzymes, achieving 95% enzyme retention over 30 days of operation.",
      whatWorked: [
        "Novel immobilization chemistry retained activity",
        "Continuous operation reduced labor costs",
        "System remained stable for extended periods"
      ],
      whatDidntWork: [
        "Initial enzyme loading was inefficient",
        "Substrate channeling caused hot spots",
        "Cleaning protocols needed optimization"
      ],
      keyLessons: [
        "Flow dynamics are as important as enzyme chemistry",
        "Build in redundancy for industrial applications",
        "Consider end-of-life enzyme recovery"
      ],
      relationToIdea: "Relevant if you're thinking about industrial applications. The engineering insights complement basic research.",
      year: 2022,
      authors: ["Dr. Anna Petrov", "Prof. Robert Kim"]
    }
  },
  {
    id: "p5",
    title: "AlphaFold for Enzyme Design",
    summary: "Using AI structure prediction to guide rational enzyme engineering",
    cluster: "computational",
    clusterLabel: "Computational Modeling",
    similarity: 0.82,
    details: {
      overview: "Combined AlphaFold structure predictions with molecular dynamics to rationally design enzyme variants, reducing experimental screening by 80%.",
      whatWorked: [
        "Accurate prediction of mutation effects",
        "Reduced time to candidate identification",
        "Identified non-obvious binding site improvements"
      ],
      whatDidntWork: [
        "Struggled with highly flexible regions",
        "Some predictions didn't match experimental results",
        "Computational resources were limiting"
      ],
      keyLessons: [
        "Use computational predictions to guide, not replace, experiments",
        "Validate predictions early with key variants",
        "Build relationships with computational centers for resources"
      ],
      relationToIdea: "Essential if you're planning any rational design. The workflow and validation strategies are directly applicable.",
      year: 2024,
      authors: ["Dr. Jennifer Liu", "Dr. Thomas Brown"]
    }
  },
  {
    id: "p6",
    title: "Metabolic Network Modeling",
    summary: "Genome-scale models for predicting metabolic engineering outcomes",
    cluster: "computational",
    clusterLabel: "Computational Modeling",
    similarity: 0.68,
    details: {
      overview: "Built and validated genome-scale metabolic models to predict the effects of gene knockouts and overexpression on product yields.",
      whatWorked: [
        "Predicted 75% of experimental outcomes correctly",
        "Identified non-intuitive pathway bottlenecks",
        "Reduced wet lab experimentation significantly"
      ],
      whatDidntWork: [
        "Model curation was extremely time-consuming",
        "Regulatory effects were poorly captured",
        "Required extensive experimental validation"
      ],
      keyLessons: [
        "Invest in model quality before making predictions",
        "Combine with kinetic modeling for regulation",
        "Share models openly for community validation"
      ],
      relationToIdea: "Valuable for metabolic engineering projects. The modeling workflow and validation approach are well-documented.",
      year: 2023,
      authors: ["Prof. David Martinez", "Dr. Emily White"]
    }
  },
  {
    id: "p7",
    title: "Soil Microbiome Field Studies",
    summary: "Long-term observation of microbial community dynamics in agriculture",
    cluster: "environmental",
    clusterLabel: "Environmental Studies",
    similarity: 0.65,
    details: {
      overview: "Five-year longitudinal study tracking soil microbiome changes under different agricultural practices, identifying key species for soil health.",
      whatWorked: [
        "Identified reliable indicator species",
        "Long-term data revealed seasonal patterns",
        "Strong correlation with crop yields"
      ],
      whatDidntWork: [
        "Weather variability complicated analysis",
        "Sample processing was a bottleneck",
        "Some sites had unexpected confounding factors"
      ],
      keyLessons: [
        "Plan for longer timescales than initially expected",
        "Build in replication for environmental variability",
        "Engage with farmers early for site access"
      ],
      relationToIdea: "Useful context if your work intersects with environmental applications. The observational methodology is rigorous.",
      year: 2024,
      authors: ["Prof. Rebecca Foster", "Dr. Michael Chang"]
    }
  },
  {
    id: "p8",
    title: "Bioremediation Pilot Studies",
    summary: "Field testing of engineered microbes for pollution cleanup",
    cluster: "environmental",
    clusterLabel: "Environmental Studies",
    similarity: 0.58,
    details: {
      overview: "Conducted controlled field releases of engineered bacteria for heavy metal remediation, with comprehensive environmental monitoring.",
      whatWorked: [
        "Achieved 60% reduction in target pollutants",
        "No spread beyond treatment zone",
        "Community acceptance was high with engagement"
      ],
      whatDidntWork: [
        "Regulatory approval took 4 years",
        "Engineered strains had reduced fitness",
        "Long-term persistence was limited"
      ],
      keyLessons: [
        "Start regulatory engagement at project conception",
        "Consider fitness alongside function in engineering",
        "Community engagement is non-negotiable"
      ],
      relationToIdea: "Relevant if considering environmental applications. The regulatory and community engagement lessons are broadly applicable.",
      year: 2023,
      authors: ["Dr. Patricia Hayes", "Prof. George Miller"]
    }
  }
];

export const patternInsights: PatternInsight[] = [
  { pattern: "Regulatory timelines are consistently underestimated", frequency: "5 of 8 projects" },
  { pattern: "Lab results often overperform field/industrial conditions", frequency: "6 of 8 projects" },
  { pattern: "Computational pre-screening significantly reduces costs", frequency: "3 of 8 projects" },
  { pattern: "Community/stakeholder engagement determines real-world success", frequency: "4 of 8 projects" },
];

export const redirectionSuggestions = [
  "Consider combining computational modeling with your experimental approach to reduce iterations",
  "Explore enzyme-based methods as a lower-regulatory-burden alternative to genetic modification",
  "If targeting environmental applications, begin stakeholder engagement now"
];
