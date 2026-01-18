import 'dotenv/config';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate realistic research papers when Semantic Scholar is unavailable
 * This ensures the demo always works
 */
export async function generateResearchPapers(projectSummary, projectDescription, count = 15) {
  console.log('🤖 Generating research papers using OpenAI...');
  
  const prompt = `You are a research database. Generate ${count} realistic bio research papers related to this project:

Project: ${projectDescription}
Summary: ${projectSummary}

For each paper, provide:
1. A realistic title
2. A detailed abstract (150-250 words)
3. Year (2018-2024)
4. 2-4 author names
5. Citation count (realistic range)
6. Venue/journal name
7. A specific research approach/method used

Generate papers that cover DIFFERENT approaches and methods. Include:
- Some highly cited foundational papers
- Some recent cutting-edge papers
- Some practical application papers
- Some papers about limitations/challenges

Return ONLY valid JSON array in this format:
[
  {
    "paperId": "unique_id",
    "title": "Paper Title",
    "abstract": "Detailed abstract...",
    "year": 2023,
    "authors": ["Author Name"],
    "citationCount": 150,
    "venue": "Journal Name",
    "approach": "specific method/approach"
  }
]`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are a scientific research database. Generate realistic, diverse research papers. Always return valid JSON.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.8,
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    console.log('📄 OpenAI raw response:', content.substring(0, 200) + '...');
    
    // Parse the response - it might be wrapped in an object
    const parsed = JSON.parse(content);
    const papers = parsed.papers || parsed.results || parsed;
    
    if (!Array.isArray(papers)) {
      console.error('❌ OpenAI did not return an array:', parsed);
      return [];
    }

    // Transform to match Semantic Scholar format
    const transformedPapers = papers.map((p, idx) => ({
      paperId: p.paperId || `ai_generated_${Date.now()}_${idx}`,
      title: p.title,
      abstract: p.abstract,
      year: p.year,
      authors: (p.authors || []).map(name => 
        typeof name === 'string' ? { name } : name
      ),
      citationCount: p.citationCount || Math.floor(Math.random() * 500),
      venue: p.venue || 'Generated Research',
      externalLink: null, // AI-generated papers don't have real links
      isAIGenerated: true,
      approach: p.approach
    }));

    console.log(`✅ Generated ${transformedPapers.length} AI research papers`);
    return transformedPapers;
    
  } catch (error) {
    console.error('❌ Error generating research papers:', error.message);
    return [];
  }
}

/**
 * Cluster papers by their approach/method
 */
export function clusterByApproach(papers, numClusters = 5) {
  console.log(`🗂️ Clustering ${papers.length} papers by approach...`);
  
  // Group by approach if available
  const approachGroups = {};
  
  papers.forEach(paper => {
    const approach = paper.approach || 'Other Methods';
    if (!approachGroups[approach]) {
      approachGroups[approach] = [];
    }
    approachGroups[approach].push(paper);
  });

  // Convert to cluster format
  const clusters = Object.entries(approachGroups)
    .slice(0, numClusters)
    .map(([approach, clusterPapers], idx) => ({
      cluster_id: `cluster_${idx}`,
      label: approach,
      papers: clusterPapers.map(p => ({
        ...p,
        similarity: 0.75 + Math.random() * 0.2 // Simulated similarity
      })),
      avgSimilarity: 0.80
    }));

  console.log(`✅ Created ${clusters.length} clusters`);
  return clusters;
}
