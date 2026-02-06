/**
 * Centralized Prompt Management for Gemini 3
 * 
 * Aligned with Core Principles:
 * - DRY: Single source of truth for all prompt logic
 * - CLEAN: Separates prompt engineering from business logic
 * - MODULAR: Easily testable and adjustable prompts
 */

export const CarolPrompts = {
  // Deep Analysis Prompts (for Extended Thinking)
  structure: (title: string, artist: string) => `
    Analyze the musical structure of the Christmas carol "${title}" by ${artist || 'traditional'}.
    Include:
    1. Harmonic Analysis: Key signatures, common progressions, and modulations.
    2. Melodic Arc: How the melody builds and resolves.
    3. Rhythmic Complexity: Time signatures and rhythmic patterns.
    4. Formal Structure: Verse-chorus patterns, bridges, and refrains.
    
    Focus on technical musical details that a conductor or arranger would find useful.
  `,

  performance: (title: string, artist: string) => `
    Create a comprehensive performance guide for "${title}" by ${artist || 'traditional'}.
    Include:
    1. Vocal Range: Specific notes for each part if possible.
    2. Technical Difficulty: Rate from 1-10 and explain why.
    3. Breath Control: Where are the challenging phrases?
    4. Ensemble Tips: How to balance voices and instruments.
    5. Dynamics & Expression: Suggestions for volume and emotional delivery.
  `,

  cultural: (title: string, artist: string) => `
    Analyze the deep cultural context and history of "${title}" by ${artist || 'traditional'}.
    Include:
    1. Historical Origin: Who wrote it, when, and in what context?
    2. Cultural Evolution: How has the song changed across different traditions or eras?
    3. Symbolism: What do the lyrics represent culturally or religiously?
    4. Global Variations: How is it performed differently around the world?
    5. Modern Relevance: Why does it remain a staple today?
  `,

  harmony: (title: string, artist: string) => `
    Provide a detailed harmony guide for "${title}" by ${artist || 'traditional'}.
    Include:
    1. SATB Voice Assignments: Tips for Soprano, Alto, Tenor, and Bass.
    2. Voice Leading: How parts should move between chords.
    3. Arrangement Suggestions: Ideas for a cappella vs. accompanied performance.
    4. Common Pitfalls: Where groups usually struggle with the harmony.
    5. Texture: Should it be homophonic, polyphonic, or unison?
  `,

  // Quick Insights Prompts (for Flash/Standard generation)
  quickHistory: (title: string, artist: string) => 
    `Provide a brief, engaging 2-3 sentence history or origin story of the carol "${title}" by ${artist || "traditional"}. Focus on cultural context and historical significance.`,
  
  quickTechniques: (title: string, artist: string) => 
    `Give 2-3 practical singing tips for performing "${title}" by ${artist || "traditional"}. Include advice on breath control, pacing, or emotional delivery.`,
  
  quickDifficulty: (title: string, artist: string) => 
    `Assess the difficulty level of singing "${title}" by ${artist || "traditional"} in 2-3 sentences. Mention vocal range requirements and technical challenges.`,
  
  quickCultural: (title: string, artist: string) => 
    `Describe the cultural traditions and celebrations associated with "${title}" by ${artist || "traditional"} in 2-3 sentences.`,

  customInsight: (title: string, artist: string, prompt: string) => `
    ${prompt} for the Christmas carol "${title}" by ${artist || "traditional"}.

    Structure the response as follows:
    1. Start with a warm, festive opening (1 sentence).
    2. Provide 3-4 interesting insights using bullet points.
    3. **Important:** Start each bullet point on a NEW LINE with "* **Title:**".
    4. End with a short, sweet closing sentiment.
    5. Tone: Magical, storytelling, and inviting.
    6. Formatting: Ensure clear line breaks between bullet points.
  `
};

export const SystemInstructions = {
  deepAnalysis: 'You are an expert musicologist, conductor, and Christmas carol historian. Use deep reasoning to provide technical and cultural insights.',
  warmExpert: 'You are a warm, knowledgeable Christmas carol expert. You write in a structured, easy-to-read Markdown format with a magical and festive tone. Use clean Markdown formatting.',
  conductor: 'You are an expert caroling conductor analyzing group singing dynamics, cultural authenticity, and emotional pacing.'
};
