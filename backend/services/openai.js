import 'dotenv/config'; // Load env first
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate project context summary (Step 1)
 */
export async function generateProjectSummary(projectDescription, capabilities, constraints) {
  const prompt = `Summarize this bio research project in 3 concise sentences.
Focus on goal, constraints, and feasibility.
Do not suggest solutions yet.

Project Description: ${projectDescription}
Capabilities: ${JSON.stringify(capabilities)}
Constraints: ${JSON.stringify(constraints)}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are a bio research analysis assistant.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.3,
  });

  return response.choices[0].message.content;
}

/**
 * Generate embeddings for clustering (Step 2B)
 */
export async function generateEmbedding(text) {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });

  return response.data[0].embedding;
}

/**
 * Label research clusters (Step 2D)
 */
export async function labelCluster(abstracts) {
  const prompt = `Given these paper abstracts, give a short label (3–5 words) describing their common approach.

Abstracts:
${abstracts.join('\n\n')}

Return only the label, nothing else.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are a research categorization assistant.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.3,
  });

  return response.choices[0].message.content.trim();
}

/**
 * Extract evidence from paper abstract (Step 3)
 */
export async function extractEvidence(abstract, title) {
  const prompt = `From this research abstract, extract:
- What worked
- What failed or was limited
- Key lessons
- Practical constraints

Return JSON only in this exact format:
{
  "what_worked": ["point 1", "point 2"],
  "limitations": ["point 1", "point 2"],
  "key_lessons": ["point 1", "point 2"],
  "practical_constraints": ["point 1", "point 2"]
}

Do not invent information. Only extract what's explicitly stated.

Title: ${title}
Abstract: ${abstract}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are a research evidence extraction assistant. Always respond with valid JSON.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.1,
    response_format: { type: "json_object" }
  });

  return JSON.parse(response.choices[0].message.content);
}

/**
 * Refine notes (Step 4)
 */
export async function refineNote(noteContent, linkedSources, action = 'clarify') {
  const actionPrompts = {
    clarify: 'Refine the following research note. Preserve scientific meaning. Base reasoning only on linked sources.',
    summarize: 'Summarize the following research note concisely while preserving key scientific points.',
    next_steps: 'Based on this research note and linked sources, suggest concrete next steps for the researcher.'
  };

  const prompt = `${actionPrompts[action]}

Note:
${noteContent}

Linked Sources:
${JSON.stringify(linkedSources, null, 2)}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are a research note assistant.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.5,
  });

  return response.choices[0].message.content;
}

/**
 * Context-aware chat (Step 5) - THE MOST IMPORTANT
 */
export async function contextAwareChat(userMessage, contextPacket) {
  const systemPrompt = `You are an AI assistant inside a bio research workspace.

Rules:
- Only use the provided context.
- Cite which paper or note supports each claim.
- If evidence is missing, say so.
- Be realistic for small labs.
- Do not invent protocols or results.`;

  const contextString = `
Project Summary: ${contextPacket.project_summary}

Constraints: ${JSON.stringify(contextPacket.constraints, null, 2)}

Selected Papers:
${contextPacket.selected_papers.map(p => `- ${p.title} (${p.year}): ${p.abstract?.substring(0, 200)}...`).join('\n')}

Evidence Cards:
${JSON.stringify(contextPacket.evidence_cards, null, 2)}

Linked Notes:
${contextPacket.linked_notes.map(n => `- ${n.content}`).join('\n')}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Context:\n${contextString}\n\nUser question: ${userMessage}` }
    ],
    temperature: 0.7,
  });

  return response.choices[0].message.content;
}

