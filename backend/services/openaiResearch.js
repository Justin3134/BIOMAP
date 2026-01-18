import 'dotenv/config';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate research papers using OpenAI based on project description
 * This replaces Semantic Scholar to avoid rate limiting
 */
export async function generateResearchPapers(projectSummary, projectDescription, limit = 20) {
  console.log('🤖 Generating research papers with OpenAI...');
  
  const prompt = `You are a research paper generator. Based on this research project, generate ${limit} realistic research papers that would be relevant.

Project: ${projectDescription}
Summary: ${projectSummary}

For each paper, provide:
- title: A realistic paper title
- authors: 2-3 realistic author names
- year: Publication year (2018-2024)
- abstract: A detailed 150-200 word abstract describing the research
- venue: Conference or journal name
- citationCount: Number of citations (realistic range)
- approach: The main methodological approach (for clustering)

Generate diverse papers covering different approaches to this research problem. Make them scientifically accurate and realistic.

Return ONLY a valid JSON array of papers in this exact format:
[
  {
    "paperId": "unique-id-1",
    "title": "Paper title",
    "authors": ["Author One", "Author Two"],
    "year": 2023,
    "abstract": "Detailed abstract text...",
    "venue": "Journal/Conference Name",
    "citationCount": 45,
    "approach": "enzymatic degradation"
  }
]`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { 
          role: 'system', 
          content: 'You are a research paper database that generates realistic, scientifically accurate paper metadata. Always respond with valid JSON only.' 
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.8,
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    const parsed = JSON.parse(content);
    
    // Handle both array and object with papers array
    const papers = Array.isArray(parsed) ? parsed : (parsed.papers || []);
    
    console.log(`✅ Generated ${papers.length} research papers with OpenAI`);
    
    return papers.map((paper, idx) => ({
      paperId: paper.paperId || `ai-paper-${Date.now()}-${idx}`,
      title: paper.title,
      authors: Array.isArray(paper.authors) 
        ? paper.authors.map(a => ({ name: a }))
        : [{ name: paper.authors }],
      year: paper.year,
      abstract: paper.abstract,
      venue: paper.venue,
      citationCount: paper.citationCount || 0,
      publicationDate: `${paper.year}-01-01`,
      approach: paper.approach || 'general'
    }));
    
  } catch (error) {
    console.error('Error generating papers with OpenAI:', error.message);
    throw error;
  }
}

/**
 * Cluster papers by their approach field
 */
export function clusterByApproach(papers, numClusters = 4) {
  // Group by approach
  const approachGroups = {};
  
  papers.forEach(paper => {
    const approach = paper.approach || 'general';
    if (!approachGroups[approach]) {
      approachGroups[approach] = [];
    }
    approachGroups[approach].push(paper);
  });
  
  // Convert to clusters
  const clusters = Object.entries(approachGroups)
    .slice(0, numClusters)
    .map(([approach, papers], idx) => ({
      cluster_id: `cluster_${idx + 1}`,
      approach: approach,
      papers: papers
    }));
  
  return clusters;
}

