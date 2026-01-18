# How to Run BioMap

This project has **TWO parts**: Frontend + Backend

## Quick Start (2 terminals)

### Terminal 1: Backend
```bash
cd backend
npm run dev
```

Backend will run on **http://localhost:3001**

You'll see: `🚀 Backend server running on http://localhost:3001`

### Terminal 2: Frontend
```bash
npm run dev
```

Frontend will run on **http://localhost:5173** (or another port)

## What Each Command Does

### Backend (`cd backend && npm run dev`)
- Starts Express API server
- Enables OpenAI integration
- Connects to Semantic Scholar
- Auto-reloads on file changes

### Frontend (`npm run dev`)
- Starts Vite dev server
- Hot module replacement enabled
- Connects to backend API automatically

## Testing the Connection

Once both servers are running, the frontend will automatically connect to the backend.

To verify backend is working:
```bash
curl http://localhost:3001/health
```

Should return:
```json
{"status":"ok","message":"BioMap backend is running"}
```

## Environment Variables

Backend uses `.env` file with:
- `OPENAI_API_KEY` - Your OpenAI API key
- `PORT` - Backend port (default: 3001)

Frontend uses `.env.local` with:
- `VITE_API_URL` - Backend API URL (default: http://localhost:3001/api)

## The Flow

1. User creates project → Backend generates AI summary
2. User clicks "Build Research Map" → Backend:
   - Searches Semantic Scholar
   - Generates embeddings
   - Clusters papers
   - Labels clusters with AI
3. User clicks paper → Backend extracts evidence
4. User chats → Backend sends context-aware response

## Key Keyboard Shortcuts

**Frontend (in browser):**
- `Cmd+R` / `Ctrl+R` - Refresh page
- Saves auto-update via HMR

**Backend (in terminal):**
- `r` + `Enter` - Restart server
- `Ctrl+C` - Stop server

## Troubleshooting

**Port 3001 already in use:**
```bash
lsof -ti:3001 | xargs kill -9
```

**OpenAI API error:**
- Check `backend/.env` has valid `OPENAI_API_KEY`

**Frontend can't connect to backend:**
- Make sure backend is running first
- Check `.env.local` has correct `VITE_API_URL`

**CORS errors:**
- Backend has CORS enabled for all origins
- Restart both servers if needed

## What Makes This Special

This is **NOT** a generic ChatGPT wrapper.

Every chat request includes:
- ✅ Project context summary
- ✅ User's specific constraints
- ✅ Selected research papers
- ✅ Extracted evidence cards
- ✅ Linked notes

The AI assistant **only reasons from this context** and **cites sources**.

Perfect for demo! 🚀

