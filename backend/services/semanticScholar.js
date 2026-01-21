import axios from 'axios';

const BASE_URL = 'https://api.semanticscholar.org/graph/v1';

// In-memory cache for Semantic Scholar responses
const cache = new Map();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

/**
 * Sleep helper for retry logic
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Get cached result or null if expired/missing
 */
function getCached(key) {
  const cached = cache.get(key);
  if (!cached) return null;
  
  const age = Date.now() - cached.timestamp;
  if (age > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  
  console.log(`📦 Cache hit for: ${key.substring(0, 50)}... (age: ${Math.round(age / 1000)}s)`);
  return cached.data;
}

/**
 * Store result in cache
 */
function setCache(key, data) {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
  console.log(`💾 Cached result for: ${key.substring(0, 50)}... (total cached: ${cache.size})`);
}

/**
 * Search papers using Semantic Scholar (Step 2A)
 * With caching and retry logic for rate limiting
 */
export async function searchPapers(query, limit = 20, retries = 3) {
  // Check cache first
  const cacheKey = `search:${query}:${limit}`;
  const cached = getCached(cacheKey);
  if (cached) {
    return cached;
  }

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      // Add delay between attempts (exponential backoff with longer delays for rate limits)
      if (attempt > 0) {
        const delay = Math.min(2000 * Math.pow(2, attempt), 10000); // Longer delays: 2s, 4s, 8s
        console.log(`⏳ Waiting ${delay}ms before retry ${attempt + 1}/${retries}...`);
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

      const results = response.data.data || [];
      console.log(`✅ Semantic Scholar returned ${results.length} papers`);
      
      // Cache the results
      setCache(cacheKey, results);
      
      return results;
      
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
 * Get paper details by ID (with caching)
 */
export async function getPaperDetails(paperId) {
  // Check cache first
  const cacheKey = `paper:${paperId}`;
  const cached = getCached(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const response = await axios.get(`${BASE_URL}/paper/${paperId}`, {
      params: {
        fields: 'paperId,title,abstract,year,authors,citationCount,venue,publicationDate,tldr'
      }
    });

    const result = response.data;
    
    // Cache the result
    setCache(cacheKey, result);
    
    return result;
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

