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
  
  // Simplified prompt to reduce token usage
  const prompt = `Generate ${count} bio research papers for: "${projectDescription.substring(0, 150)}"

Return JSON with "papers" array. Each paper needs:
- title (concise)
- abstract (100 words max)
- year (2018-2024)
- authors (array of 2-3 names)
- citationCount (number)
- venue (journal name)
- approach (research method used)

Cover different approaches. Format:
{"papers": [{"paperId":"id","title":"...","abstract":"...","year":2023,"authors":["Name"],"citationCount":100,"venue":"Journal","approach":"method"}]}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Use mini model to reduce cost and token usage
      messages: [
        { role: 'system', content: 'You are a research database. Return valid JSON only.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 3000, // Limit response size
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
    console.log('🎲 Using simple fallback papers...');
    
    // Simple fallback: generate basic papers without AI
    return generateFallbackPapers(projectDescription, count);
  }
}

/**
 * Generate simple fallback papers when AI fails
 */
function generateFallbackPapers(projectDescription, count = 15) {
  const keywords = projectDescription.split(' ').slice(0, 3).join(' ');
  const approaches = [
    'CRISPR-based approach',
    'Computational modeling',
    'Enzyme engineering',
    'Metabolic pathway optimization',
    'Field validation studies'
  ];
  
  const papers = [];
  for (let i = 0; i < count; i++) {
    const approach = approaches[i % approaches.length];
    papers.push({
      paperId: `fallback_${Date.now()}_${i}`,
      title: `${approach} for ${keywords}`,
      abstract: `This study explores ${approach.toLowerCase()} as a method for ${keywords}. The research demonstrates promising results with practical applications for laboratory settings. Key findings include improved efficiency and cost-effectiveness compared to traditional methods.`,
      year: 2020 + (i % 5),
      authors: [{ name: `Researcher ${i + 1}` }, { name: `Scientist ${i + 2}` }],
      citationCount: Math.floor(Math.random() * 300),
      venue: 'Nature Biotechnology',
      externalLink: null,
      isAIGenerated: true,
      approach: approach
    });
  }
  
  console.log(`✅ Generated ${papers.length} fallback papers`);
  return papers;
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
