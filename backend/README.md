# BioMap Backend

AI-powered backend for bio research workspace with context-aware intelligence.

## Architecture

This backend implements the exact specification you provided:

### 1. Project Intake → "Project Brain"
- `POST /api/projects` - Creates project and generates context summary with OpenAI
- Summary becomes the root anchor for all subsequent operations

### 2. Research Map → The Core
When you call `POST /api/research/map/:projectId`:
- **Step A**: Searches Semantic Scholar using project summary
- **Step B**: Generates embeddings for project and all papers
- **Step C**: Clusters papers into 3-5 branches using k-means
- **Step D**: Uses OpenAI to label each branch (3-5 word labels)

### 3. Evidence Cards
- `POST /api/research/evidence` - Extracts structured evidence from paper abstracts
- Returns: what worked, limitations, key lessons, practical constraints
- Makes clicking nodes feel instant and real

### 4. Notes System
- `POST /api/notes` - Saves notes with linked sources
- `POST /api/notes/:id/refine` - AI-powered refinement (clarify, summarize, next_steps)

### 5. Context-Aware Chat (MOST IMPORTANT)
- `POST /api/chat` - Grounded chat with Context Packet
- Every request includes:
  - Project summary
  - Constraints
  - Selected papers
  - Linked notes
- AI only reasons from provided context
- Cites sources in every response

## Quick Start

```bash
# Install dependencies
npm install

# Set environment variables
# Create backend/.env with:
# OPENAI_API_KEY=your_key_here
# PORT=3001

# Run development server (auto-reload on changes)
npm run dev

# Or production
npm start
```

## API Endpoints

### Projects
- `POST /api/projects` - Create project with AI summary
- `GET /api/projects` - List all projects
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project

### Research
- `POST /api/research/map/:projectId` - Build research landscape (THE CORE)
- `GET /api/research/map/:projectId` - Get stored research map
- `POST /api/research/evidence` - Extract evidence from paper

### Notes
- `POST /api/notes` - Save note
- `GET /api/notes/project/:projectId` - Get project notes
- `GET /api/notes/:id` - Get single note
- `POST /api/notes/:id/refine` - AI refine (clarify/summarize/next_steps)
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note

### Chat
- `POST /api/chat` - Context-aware chat (grounded in research)
- `GET /api/chat/history/:projectId` - Get chat history
- `DELETE /api/chat/history/:projectId` - Clear history

## Tech Stack

- **Node.js + Express** - Fast, simple REST API
- **OpenAI GPT-4** - Context summaries, evidence extraction, chat
- **OpenAI Embeddings** - Semantic similarity for clustering
- **Semantic Scholar API** - Real research paper search
- **JSON Storage** - Simple file-based database (good for hackathon)

## What Makes This Different

**Not a generic ChatGPT clone:**
- Every chat includes Context Packet
- AI cites sources from user's research
- Realistic for small labs
- Doesn't invent protocols

**Persistence Loop:**
- Papers → Evidence → Notes → Decisions
- Everything links together
- Chat gets smarter with more context

## Demo Explanation (for judges)

"Users define their constraints first. We map similar research using embeddings, organize it visually, extract structured evidence from real papers, and ground an AI assistant inside that workspace so it only reasons from the user's actual research context."

## Notes

- No auth (keep it simple for hackathon)
- No complex ML (k-means is enough)
- No PDF parsing (abstracts are sufficient)
- Uses JSON file storage (can upgrade to Postgres later)

Backend is production-ready for demo! 🚀

