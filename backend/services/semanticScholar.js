import axios from 'axios';

const BASE_URL = 'https://api.semanticscholar.org/graph/v1';

/**
 * Search papers using Semantic Scholar (Step 2A)
 */
export async function searchPapers(query, limit = 20) {
  try {
    const response = await axios.get(`${BASE_URL}/paper/search`, {
      params: {
        query,
        limit,
        fields: 'paperId,title,abstract,year,authors,citationCount,venue,publicationDate'
      }
    });

    return response.data.data || [];
  } catch (error) {
    console.error('Semantic Scholar API error:', error.message);
    return [];
  }
}

/**
 * Get paper details by ID
 */
export async function getPaperDetails(paperId) {
  try {
    const response = await axios.get(`${BASE_URL}/paper/${paperId}`, {
      params: {
        fields: 'paperId,title,abstract,year,authors,citationCount,venue,publicationDate,tldr'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Failed to get paper details:', error.message);
    return null;
  }
}

/**
 * Extract key nouns from project description (simple version)
 */
export function extractKeyTerms(text) {
  // Simple keyword extraction - focus on bio-related terms
  const words = text.toLowerCase().split(/\W+/);
  const bioKeywords = words.filter(word => 
    word.length > 4 && 
    !['using', 'about', 'their', 'which', 'where', 'there', 'these', 'those'].includes(word)
  );
  
  return bioKeywords.slice(0, 5).join(' ');
}

