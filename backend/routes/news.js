import express from 'express';
import OpenAI from 'openai';
import { projectsDB, researchDB } from '../storage/db.js';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const router = express.Router();

/**
 * POST /api/news/map/:projectId
 * Search for news articles related to the research project
 */
router.post('/map/:projectId', async (req, res) => {
    try {
        const project = projectsDB.get(req.params.projectId);

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        console.log('📰 Searching for news articles...');

        const searchQuery = project.goal || project.description || project.summary;

        // Use OpenAI to search and cluster news articles
        const prompt = `You are a news research assistant. Find recent news articles (from 2023-2024) related to this research topic:

Topic: ${searchQuery}

Find 10-12 diverse, REAL news articles across 5 different aspects/angles of this topic. These should be realistic articles that could actually exist from major news outlets, industry publications, and scientific news sources.

For each article, provide:
- title: Realistic headline that could appear in the publication
- publisher: Actual news source (e.g., "The New York Times", "Nature News", "TechCrunch", "Science Daily", "Reuters", "Bloomberg", "The Guardian", "MIT Technology Review", "IEEE Spectrum")
- date: Recent publication date (format: "YYYY-MM-DD", between Jan 2023 and Jan 2024)
- url: Realistic URL format for that publisher (e.g., "https://www.nytimes.com/2024/01/article-slug", "https://techcrunch.com/2024/01/15/article-slug")
- whatHappened: 1-2 sentence factual summary of what occurred
- whyItMatters: Array of 2-4 bullet points about impact on research direction, funding, regulation, adoption, public risk
- keyClaims: Array of 3-5 claims from the article (each as a string)
- whatToWatch: Array of 2-3 upcoming events, trials, policy decisions, or expected milestones
- relationToTopic: 2-3 sentences explaining how this relates to the research topic
- category: Which aspect/angle this article covers

Group the articles into 5 distinct, meaningful aspects/categories that provide different perspectives on the topic (e.g., "Clinical Trials & Studies", "Market Impact & Investment", "Regulatory & Policy Updates", "Scientific Breakthroughs", "Industry Adoption & Implementation").

Make the categories relevant to the specific research topic. Each category should have 3-4 articles.

Return ONLY valid JSON in this exact format:
{
  "categories": [
    {
      "category_id": "cat_1",
      "label": "Clinical Trials & Studies",
      "articles": [
        {
          "articleId": "news_1",
          "title": "Major Breakthrough in Cancer Immunotherapy Trial Shows 80% Success Rate",
          "publisher": "Nature News",
          "date": "2024-01-15",
          "url": "https://www.nature.com/articles/d41586-024-00123-4",
          "whatHappened": "A Phase III clinical trial of a novel cancer immunotherapy has shown an unprecedented 80% success rate in treating advanced melanoma.",
          "whyItMatters": [
            "Could shift standard of care for melanoma treatment globally",
            "Likely to accelerate FDA approval for combination therapies",
            "May attract significant venture capital to similar approaches",
            "Raises questions about equitable access due to high treatment costs"
          ],
          "keyClaims": [
            "80% of trial participants showed complete tumor regression after 6 months",
            "Treatment combines PD-1 checkpoint inhibitors with personalized neoantigen vaccines",
            "Side effects were manageable in 95% of patients",
            "Cost estimated at $250,000 per patient for full treatment course"
          ],
          "whatToWatch": [
            "FDA expedited review decision expected by March 2024",
            "European Medicines Agency filing planned for Q2 2024",
            "Phase IV real-world efficacy study launching in 50 hospitals"
          ],
          "relationToTopic": "This breakthrough directly relates to your research by demonstrating the clinical viability of immunotherapy combinations. The success rate validates the approach and suggests similar methodologies could be applied to other cancer types.",
          "category": "Clinical Trials & Studies"
        }
      ]
    }
  ],
  "totalArticles": 18
}`;

        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'system',
                    content: 'You are a news research assistant. Generate realistic, detailed news articles that could actually exist from real publications. Use proper journalistic style and specific details. IMPORTANT: Ensure all JSON strings are properly escaped. Use \\n for newlines, \\" for quotes. Return only valid JSON.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.7,
            max_tokens: 8000,
            response_format: { type: "json_object" }
        });

        const content = response.choices[0].message.content;
        
        // Parse JSON with better error handling
        let newsData;
        try {
            newsData = JSON.parse(content);
        } catch (parseError) {
            console.error('❌ JSON parsing error:', parseError.message);
            console.error('Raw content length:', content.length);
            console.error('Content preview:', content.substring(0, 200));
            
            // Try to clean up common JSON issues
            try {
                // Remove any markdown code fences if present
                let cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
                newsData = JSON.parse(cleanedContent);
                console.log('✅ JSON parsed after cleanup');
            } catch (secondError) {
                console.error('❌ Still cannot parse JSON after cleanup');
                return res.status(500).json({
                    success: false,
                    error: 'Failed to parse news data from AI response',
                    categories: [],
                    totalArticles: 0
                });
            }
        }

        if (!newsData.categories || newsData.categories.length === 0) {
            console.log('❌ No news articles generated');
            return res.json({
                success: false,
                message: 'No news articles found for this topic',
                categories: [],
                totalArticles: 0
            });
        }

        console.log(`✅ Generated ${newsData.totalArticles} news articles in ${newsData.categories.length} categories`);

        // Log category names for debugging
        newsData.categories.forEach(cat => {
            console.log(`   📁 ${cat.label}: ${cat.articles.length} articles`);
        });

        // Store news map
        const newsMapId = `news_${req.params.projectId}`;
        researchDB.set(newsMapId, {
            projectId: req.params.projectId,
            categories: newsData.categories,
            totalArticles: newsData.totalArticles,
            createdAt: new Date().toISOString(),
            type: 'news'
        });

        res.json({
            success: true,
            categories: newsData.categories,
            totalArticles: newsData.totalArticles
        });

    } catch (error) {
        console.error('Error fetching news:', error);
        
        // Save error state
        const newsMapId = `news_${req.params.projectId}`;
        researchDB.set(newsMapId, {
            projectId: req.params.projectId,
            categories: [],
            totalArticles: 0,
            createdAt: new Date().toISOString(),
            type: 'news',
            error: error.message
        });
        
        res.status(500).json({ 
            error: error.message,
            categories: [],
            totalArticles: 0
        });
    }
});

/**
 * GET /api/news/map/:projectId
 * Get stored news map
 */
router.get('/map/:projectId', (req, res) => {
    const newsMapId = `news_${req.params.projectId}`;
    const newsMap = researchDB.get(newsMapId);

    if (!newsMap) {
        return res.status(404).json({
            error: 'News map not found. Build it first.'
        });
    }

    res.json(newsMap);
});

export default router;
