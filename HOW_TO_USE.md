# 🧬 BioMap - How to Use

## 🚀 Quick Start

### 1. Start the Application

**Backend (Terminal 1):**
```bash
cd /Users/justink/BIO/backend
npm run dev
```
✅ Should see: `🚀 Backend server running on http://localhost:3001`

**Frontend (Terminal 2):**
```bash
cd /Users/justink/BIO
npm run dev
```
✅ Should see: `Local: http://localhost:8081/`

---

## 📝 Using the Application

### Step 1: Project Intake
1. Open http://localhost:8081 in your browser
2. You'll see the **Project Intake Wizard** with 3 steps:

#### **Step 1: Research Description**
- **Research Title:** e.g., "Drought-Resistant Crops"
- **Research Goal:** e.g., "Develop low-cost drought-resistant wheat using CRISPR gene editing for small farms"

#### **Step 2: Lab Capabilities**
Select what your lab has:
- 🧬 **Lab Equipment:** PCR, Gene Editing, Sequencing, Flow Cytometry, etc.
- 💻 **Compute:** Basic, GPU Cluster, Cloud Access
- 🏢 **Facilities:** BSL-2, BSL-3, Greenhouse, Animal Facility

#### **Step 3: Constraints**
- **Budget:** e.g., $50,000
- **Timeline:** e.g., "6 months"
- **Team Size:** e.g., 3 people
- **Approach Preference:** CRISPR-based, Enzyme-based, Computational, Mixed

Click **"Build Research Landscape"** → Backend will:
- Generate AI summary of your project
- Search Semantic Scholar for real papers
- Cluster papers into research branches
- Label each branch with AI

---

### Step 2: Explore the Research Map

You'll see an **interactive tree visualization**:

```
                    [Your Project]
                          |
        __________________|__________________
       |                  |                  |
[CRISPR Editing]  [Drought Genes]  [Field Testing]
   (5 papers)        (8 papers)        (7 papers)
```

#### **What You See:**

1. **Center Node (Blue):** Your project
2. **Cluster Nodes (Purple):** Research approach branches
3. **Paper Nodes (Green):** Individual research papers

#### **Interactions:**

- **Drag:** Move nodes around
- **Zoom:** Scroll to zoom in/out
- **Click Paper:** Opens detail panel on the right
- **Lock Icon:** Lock/unlock the view

---

### Step 3: Analyze with Smart Panels

Three panels on the **bottom left** react to your research:

#### 🧭 **Novelty Radar**
Shows research opportunities:
- **🟢 Whitespace (90%+):** Underexplored area - high novelty potential
- **🟡 Balanced (50-70%):** Moderate competition
- **🔴 Overcrowded (20-40%):** Highly competitive field

**Example:**
```
✨ High Novelty Opportunity!

Whitespace Areas:
• CRISPR-based stress response (92%)
  "Only 1 paper found - potential for novel contributions"

Overcrowded:
• Traditional breeding methods (28%)
  "8 papers - highly competitive"
```

#### 🔧 **Feasibility Panel**
Checks if you can do each approach:
- **✅ Feasible:** You have all required capabilities
- **⚠️ Upgrades Needed:** Missing 1-2 items (shows what's missing)
- **❌ Not Feasible:** Missing 3+ critical capabilities

**Example:**
```
CRISPR Editing: ⚠️ Upgrades Needed
Missing: Gene Editing Equipment, BSL-2 Lab

Computational Screening: ✅ Feasible
You have: Basic Compute, Data Analysis
```

#### 💡 **Insights Panel**
Extracts patterns from research:

**Common Patterns:**
- CRISPR-based drought resistance (5 papers)
- Metabolic engineering approaches (8 papers)
- Field validation methods (7 papers)

**Suggestions:**
- "Combine CRISPR editing with computational pre-screening for faster iteration"
- "Recent advances (2020+) focus on stress response genes"

---

### Step 4: Deep Dive into Papers

Click any paper node → **Detail Panel** slides in from right:

#### **What You See:**

**Header:**
- Paper title
- Year, authors
- Cluster label (e.g., "CRISPR-based approaches")

**Similarity Score:**
- Visual bar showing % match to your project
- e.g., "82% similarity"

**Sections:**
1. **Overview:** Full abstract
2. **What Worked:** Successful methods/results
3. **What Didn't Work:** Limitations/failures
4. **Key Lessons:** Practical takeaways
5. **How This Relates:** Connection to your project
6. **🔗 View Original Paper:** External link to Semantic Scholar

#### **Actions:**

- **Add to Chat:** Include this paper in AI chat context
- **Pin Evidence:** Save key findings to notes

---

### Step 5: Context-Aware Chat

Click **"Chat"** in sidebar (if available):

The AI assistant knows:
- Your project summary
- Your constraints (budget, timeline, capabilities)
- Papers you've added to context
- Evidence you've pinned

**Example Conversation:**
```
You: "What are the biggest risks with CRISPR editing for this project?"

AI: "Based on the papers in your context:

1. Off-target effects (Chen et al. 2023) - requires extensive validation
2. Regulatory hurdles (Smith et al. 2022) - 18-24 month approval process
3. Cost constraints - Gene editing equipment ~$45K (exceeds your $50K budget)

Given your 6-month timeline and budget, consider:
- Partner with a lab that has CRISPR capabilities
- Start with computational screening to identify target genes
- Use traditional breeding as backup approach

Sources: [Paper 1], [Paper 3], [Paper 7]"
```

---

## 🎯 Key Features

### ✅ Real Research Papers
- Sourced from Semantic Scholar (60M+ papers)
- Real citations, authors, years
- Direct links to original papers

### ✅ Smart Clustering
- AI groups papers by approach/method
- Embeddings measure semantic similarity
- 3-5 clusters per project

### ✅ Reactive Components
- All panels update based on findings
- Feasibility checks against YOUR capabilities
- Novelty scores relative to YOUR project

### ✅ Context-Aware AI
- Grounded in actual research papers
- Cites sources for every claim
- Realistic for small lab constraints

---

## 🔄 Typical Workflow

1. **Define Project** (2 min)
   - Fill out 3-step wizard
   - Click "Build Research Landscape"

2. **Wait for Map** (15-20 sec)
   - Backend searches papers
   - Generates embeddings
   - Clusters and labels branches

3. **Explore Branches** (5-10 min)
   - Check Novelty Radar for opportunities
   - Review Feasibility Panel for blockers
   - Read Insights for patterns

4. **Deep Dive** (10-20 min)
   - Click interesting papers
   - Read evidence cards
   - Add relevant papers to chat context

5. **Chat with AI** (ongoing)
   - Ask specific questions
   - Get grounded, cited answers
   - Refine your approach

6. **Take Notes** (ongoing)
   - Pin key evidence
   - Link notes to sources
   - Build decision log

---

## 🎨 Visual Guide

### Research Map Colors
- **🔵 Blue:** Your project (center)
- **🟣 Purple:** Cluster nodes (branches)
- **🟢 Green:** Paper nodes (high similarity)
- **🟡 Yellow:** Paper nodes (medium similarity)
- **🔴 Red:** Paper nodes (low similarity)

### Panel Status Colors
- **🟢 Green:** Feasible / High novelty / Positive
- **🟡 Yellow:** Upgrades needed / Medium / Caution
- **🔴 Red:** Not feasible / Low novelty / Warning

---

## 💡 Pro Tips

1. **Be Specific in Research Goal**
   - ❌ "Make better crops"
   - ✅ "Develop drought-resistant wheat using CRISPR to edit ABA signaling genes"

2. **Select Accurate Capabilities**
   - System checks feasibility based on what you select
   - Be honest about budget/timeline constraints

3. **Explore Whitespace Areas**
   - High novelty = less competition = better for small labs
   - Look for 1-2 paper clusters with high similarity

4. **Read "What Didn't Work"**
   - Learn from others' failures
   - Avoid known pitfalls
   - Adjust your approach proactively

5. **Use Chat for Specific Questions**
   - Add 3-5 relevant papers to context first
   - Ask concrete questions (not general)
   - Request citations to verify claims

---

## 🐛 Troubleshooting

### "No papers found" Error
**Cause:** Semantic Scholar rate limiting  
**Solution:** System automatically falls back to AI-generated papers  
**Note:** AI papers don't have external links but still provide useful insights

### Backend Not Responding
**Check:** Is it running on port 3001?
```bash
curl http://localhost:3001/api/health
# Should return: {"status":"ok","message":"BioMap backend is running"}
```

### Frontend Not Loading
**Check:** Is it running on port 8081?
```bash
curl http://localhost:8081
# Should return HTML
```

### Branches Not Showing
**Check:** Did you wait 15-20 seconds after clicking "Build Research Landscape"?  
**Check:** Open browser console (F12) for errors  
**Fix:** Refresh page and try again

---

## 📚 What Makes This Different from ChatGPT?

| Feature | BioMap | ChatGPT |
|---------|--------|---------|
| **Research Papers** | Real papers from Semantic Scholar | Generic knowledge |
| **Grounding** | Cites specific sources | No citations |
| **Constraints** | Checks YOUR lab capabilities | Generic advice |
| **Visual Map** | Interactive tree of approaches | Text only |
| **Feasibility** | Realistic for small labs | Often unrealistic |
| **Context** | Persistent project memory | Forgets context |
| **Evidence** | Structured extraction | Unstructured |

---

## 🎉 You're Ready!

Open http://localhost:8081 and start exploring research! 🚀

**Questions?** Check `FIXES_COMPLETE.md` for technical details.

