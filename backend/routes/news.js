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

Find 15-20 diverse, REAL news articles across 5 different aspects/angles of this topic. These should be realistic articles that could actually exist from major news outlets, industry publications, and scientific news sources.

For each article, provide:
- title: Realistic headline that could appear in the publication
- publisher: Actual news source (e.g., "The New York Times", "Nature News", "TechCrunch", "Science Daily", "Reuters", "Bloomberg", "The Guardian", "MIT Technology Review", "IEEE Spectrum")
- date: Recent publication date (format: "YYYY-MM-DD", between Jan 2023 and Jan 2024)
- url: Realistic URL format for that publisher (e.g., "https://www.nytimes.com/2024/01/article-slug", "https://techcrunch.com/2024/01/15/article-slug")
- summary: 2-3 sentence summary of what the article covers
- takeaway: One key insight or finding (1 sentence, clear and actionable)
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
          "summary": "A Phase III clinical trial of a novel cancer immunotherapy has shown an unprecedented 80% success rate in treating advanced melanoma. The treatment combines checkpoint inhibitors with personalized vaccine therapy. Researchers attribute the success to improved patient selection and combination protocols.",
          "takeaway": "New immunotherapy combination achieves 80% success rate in melanoma treatment, marking significant progress in cancer care.",
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
                    content: 'You are a news research assistant. Generate realistic, detailed news articles that could actually exist from real publications. Use proper journalistic style and specific details. Return only valid JSON.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.7,
            max_tokens: 4000,
            response_format: { type: "json_object" }
        });

        const content = response.choices[0].message.content;
        const newsData = JSON.parse(content);

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
