# 🤖 Research Assistant - Complete Guide

**Status:** ✅ Fully Integrated with OpenAI API  
**Date:** January 18, 2026

---

## 🎯 Overview

The Research Assistant is a **context-aware AI chat** that answers questions based on:
1. Your project's goals and constraints
2. Papers you've added to the chat context
3. Notes you've saved in the workspace

**Unlike ChatGPT, this assistant is grounded in YOUR specific research.**

---

## 🚀 How It Works

### **Step 1: Add Papers to Context**

1. Click on any paper node in the research map
2. In the detail panel that opens, click **"Add to Chat"** button
3. The paper appears in the chat sidebar as a blue chip
4. You can add multiple papers (they all become context)

**Visual:**
```
Research Map → Click Paper → Detail Panel → "Add to Chat" 
                                              ↓
                              Chat Sidebar shows: [Paper Title] ×
```

### **Step 2: Ask Questions**

The assistant knows about:
- ✅ **Your project summary** (goals, constraints, capabilities)
- ✅ **Selected papers** (titles, abstracts, citations)
- ✅ **Your notes** (if you've saved any)

**Examples:**
- "What are the biggest risks with this approach?"
- "How can I combine these methods?"
- "What should I do first?"
- "What equipment do I need?"

### **Step 3: Get Grounded Answers**

The AI will:
- ✅ **Cite specific papers** from your context
- ✅ **Reference your constraints** (budget, timeline, capabilities)
- ✅ **Give realistic advice** for small labs
- ❌ **NOT invent information** not in the papers

---

## 🎨 User Interface

### **Chat Sidebar (Right Side)**

#### **Collapsed State:**
- Small panel with chat icon
- Shows number badge if papers are in context
- Click to expand

#### **Expanded State:**

**1. Header:**
```
🗨️ Research Assistant            [Collapse →]

Asking about:
[Paper 1 Title ×] [Paper 2 Title ×]
```

**2. Context Chips:**
- Blue chips show which papers are in context
- Click ×  to remove a paper from context
- If no papers: "No context selected"

**3. Message Area:**
- User messages (right side, blue)
- AI responses (left side, gray)
- "Based on:" chips showing which papers were used

**4. Smart Prompts:**

When papers are selected:
- `Failure risks`
- `Cheapest version`
- `Combine ideas`
- `What's weak`
- `First steps`
- `2-week plan`

When no papers selected:
- `Map overview`
- `Clusters`
- `Trends`
- `Gaps`
- `Recommendations`

**5. Input Box:**
- Type your question
- Press Enter or click Send
- Placeholder changes based on context

---

## 🔧 Technical Architecture

### **Frontend → Backend Flow:**

```
User types question
      ↓
ChatSidebar collects:
  - projectId
  - message
  - selectedPaperIds (from context)
      ↓
Frontend calls: POST /api/chat
      ↓
Backend builds Context Packet:
  - project_summary
  - constraints
  - selected_papers (full abstracts)
  - linked_notes
      ↓
Backend calls OpenAI with grounded prompt:
  "You are an AI assistant inside a bio research workspace.
   Rules:
   - Only use the provided context
   - Cite which paper supports each claim
   - If evidence is missing, say so
   - Be realistic for small labs"
      ↓
OpenAI generates response
      ↓
Backend returns: { response, contextUsed }
      ↓
Frontend displays AI message with citations
```

---

## 💡 Key Features

### **1. Multiple Papers in Context**
```
Add Paper 1 → AI knows about Paper 1
Add Paper 2 → AI knows about Paper 1 AND Paper 2
Add Paper 3 → AI knows about all 3
```

The AI can **compare and combine** insights from all selected papers.

### **2. Citation Tracking**
Every AI response shows:
```
Based on: [Paper 1] [Paper 2]
```

You can verify the AI's reasoning by checking the original papers.

### **3. Context-Aware Prompts**
The smart prompts change based on what you've selected:
- **No context:** General map questions
- **With context:** Specific project questions

### **4. Project-Specific Memory**
- Chat history is saved per project
- AI remembers your constraints (budget, timeline, capabilities)
- Answers are realistic for YOUR lab setup

---

## 🎯 Example Conversation

### **Scenario:** You've added 3 papers about CRISPR drought resistance

**You:** "What are the biggest risks with this approach?"

**AI:** 
```
Based on the selected research, the main failure risks include:

1. Off-target effects (Chen et al. 2023) - The CRISPR editing 
   showed 15% off-target mutations in preliminary trials
   
2. Regulatory hurdles (Smith et al. 2022) - Field trials require 
   18-24 month approval process, exceeding your 6-month timeline
   
3. Cost constraints - Gene editing equipment ~$45K (exceeds your 
   $50K budget), leaving minimal funds for validation

Given your constraints, consider:
- Partner with a lab that has CRISPR capabilities
- Start with computational screening to identify target genes
- Use traditional breeding as backup approach

Based on: [CRISPR-based drought...] [Regulatory framework...] [Cost analysis...]
```

---

## 🔒 What Makes It Different from ChatGPT

| Feature | BioMap Assistant | ChatGPT |
|---------|------------------|---------|
| **Knowledge** | Your selected papers only | General internet knowledge |
| **Citations** | Cites specific papers | No citations |
| **Constraints** | Knows YOUR budget/timeline | Generic advice |
| **Realism** | Realistic for small labs | Often unrealistic |
| **Memory** | Project-specific history | Session-based only |
| **Grounding** | Can't invent information | May hallucinate |

---

## 🎬 Getting Started

### **1. Build Your Research Map**
Fill out the project form to generate your research landscape.

### **2. Explore the Branches**
Click on different papers to see what's available.

### **3. Add 2-3 Papers to Context**
Select papers that seem most relevant to your approach.

### **4. Ask a Specific Question**
Use the smart prompts or type your own question.

### **5. Verify the Citations**
Check the "Based on:" papers to ensure the advice makes sense.

---

## 🐛 Troubleshooting

### **Issue:** Chat says "No projectId provided"
**Fix:** Make sure you've completed the project intake form.

### **Issue:** AI gives generic answers
**Fix:** Add more papers to context - the AI needs material to work with!

### **Issue:** Response is slow
**Normal:** OpenAI API takes 3-10 seconds depending on context size.

### **Issue:** Error message appears
**Fix:** Check browser console (F12) for details. Backend may be down.

---

## 🔮 Advanced Features

### **Combining Papers**
Add papers from different clusters to get cross-approach insights:
```
Add: "CRISPR editing" paper
Add: "Computational screening" paper
Ask: "How can I combine these methods?"
```

### **Feasibility Checks**
```
Ask: "Given my $50K budget and 6-month timeline, is this feasible?"
```
The AI knows your constraints and will give realistic advice.

### **Risk Analysis**
```
Ask: "What could go wrong with this approach?"
```
The AI will cite specific failure modes from the papers.

### **First Steps Planning**
```
Ask: "What should I do in the first 2 weeks?"
```
The AI will prioritize based on your constraints.

---

## 📊 Context Packet Structure (Technical)

When you send a message, the backend builds this packet:

```json
{
  "project_summary": "Your AI-generated project summary",
  "constraints": {
    "budget": 50000,
    "timeline": "6 months",
    "team_size": 3
  },
  "selected_papers": [
    {
      "paperId": "abc123",
      "title": "Paper Title",
      "abstract": "Full abstract text...",
      "year": 2023,
      "authors": "Author names",
      "similarity": 0.85
    }
  ],
  "linked_notes": [
    {
      "content": "My notes...",
      "linkedSources": [...]
    }
  ]
}
```

This entire packet goes to OpenAI with your question.

---

## ✅ Summary

The Research Assistant is now:
- ✅ **Connected to OpenAI API** (GPT-4o)
- ✅ **Grounded in your papers** (via context)
- ✅ **Aware of your constraints** (budget, timeline, etc.)
- ✅ **Cites sources** (shows which papers support each claim)
- ✅ **Realistic for small labs** (not generic ChatGPT advice)

**Just click "Add to Chat" on papers and start asking questions!** 🚀

---

**Need help?** Check the console (F12) for detailed logs of what's being sent to the AI.

