# BioMap - AI-Powered Bio Research Workspace

## Project info

An intelligent research workspace for bio labs that maps research landscapes, extracts evidence from papers, and provides context-aware AI assistance grounded in real scientific literature.

## How to run this project

See **[QUICK_START.md](QUICK_START.md)** for detailed instructions.

**Quick version:**

Terminal 1 (Backend):
```bash
cd backend
npm run dev
```

Terminal 2 (Frontend):
```bash
npm run dev
```

## How can I edit this code?

**Use your preferred IDE**

Clone this repo and push changes.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

**Frontend:**
- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

**Backend:**
- Node.js + Express
- OpenAI API (GPT-4 + Embeddings)
- Semantic Scholar API
- K-means clustering

## Key Features

1. **Project Brain** - AI-generated context summaries
2. **Research Map** - Semantic clustering of real papers
3. **Evidence Cards** - Structured insights extraction
4. **Smart Notes** - AI-powered refinement
5. **Context-Aware Chat** - Grounded AI with citations

## Documentation

- [Quick Start Guide](QUICK_START.md)
- [Implementation Summary](IMPLEMENTATION_SUMMARY.md)
- [How to Run](HOW_TO_RUN.md)
- [Backend README](backend/README.md)
