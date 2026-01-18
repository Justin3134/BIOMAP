import axios from 'axios';

const BASE_URL = 'https://api.semanticscholar.org/graph/v1';

/**
 * Sleep helper for retry logic
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Search papers using Semantic Scholar (Step 2A)
 * With retry logic for rate limiting
 */
export async function searchPapers(query, limit = 20, retries = 3) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      // Add delay between attempts (exponential backoff)
      if (attempt > 0) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
        console.log(`⏳ Rate limited, waiting ${delay}ms before retry ${attempt + 1}/${retries}...`);
        await sleep(delay);
      }

      const response = await axios.get(`${BASE_URL}/paper/search`, {
        params: {
          query,
          limit,
          fields: 'paperId,title,abstract,year,authors,citationCount,venue,publicationDate'
        },
        timeout: 10000 // 10 second timeout
      });

      console.log(`✅ Semantic Scholar returned ${response.data.data?.length || 0} papers`);
      return response.data.data || [];
      
    } catch (error) {
      if (error.response?.status === 429 && attempt < retries - 1) {
        // Rate limited, will retry
        console.log(`⚠️ Rate limited (429), retrying...`);
        continue;
      }
      
      console.error('Semantic Scholar API error:', error.response?.status || error.message);
      
      // Return empty array on final failure
      if (attempt === retries - 1) {
        console.error('❌ All retries exhausted, returning empty results');
        return [];
      }
    }
  }
  
  return [];
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

