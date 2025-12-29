import 'server-only';
import { generateWithReasoning } from './ai';
import { getCarols } from './carols';

/**
 * Advanced setlist reasoning using Gemini 3's extended thinking
 * Analyzes complex factors: group size, singer skill level, emotion arc, cultural authenticity
 */
export async function reasonAboutSetlist(args: {
  theme: string;
  groupSize: number;
  duration: number; // minutes
  singerSkillLevel?: 'beginner' | 'intermediate' | 'advanced';
  preferredLanguages?: string[];
}): Promise<{
  reasoning: string;
  recommendations: string[];
  keyInsights: string[];
}> {
  try {
    const allCarols = await getCarols({ query: args.theme });
    const carolsSummary = allCarols.slice(0, 30).map(c => ({
      title: c.title,
      artist: c.artist,
      energy: c.energy,
      difficulty: c.tags?.includes('difficult') ? 'high' : 'medium',
      harmony: c.tags?.includes('harmony') ? 'multi-part' : 'unison'
    }));

    const prompt = `You are an expert Christmas caroling conductor with 30+ years of experience organizing group singing events.

Given these constraints:
- Group Size: ${args.groupSize} singers
- Event Duration: ${args.duration} minutes
- Theme: "${args.theme}"
- Skill Level: ${args.singerSkillLevel || 'mixed'}
- Available Carols: ${JSON.stringify(carolsSummary)}

Your task: Create a detailed setlist strategy that considers:

1. ENERGY ARC: How should energy flow across the entire event?
   - Warm-up phase (get voices loose)
   - Peak engagement (memorable moments)
   - Wind-down (reflective close)

2. GROUP DYNAMICS:
   - How many singers can comfortably manage multi-part harmony?
   - What unison pieces build confidence?
   - How do you balance difficulty with accessibility?

3. CULTURAL AUTHENTICITY:
   - Which carols have strong traditional significance?
   - How do they connect to the "${args.theme}" theme?
   - Are there cultural sensitivities to consider?

4. TIMING & PACING:
   - How many songs fit in ${args.duration} minutes?
   - Include transition points for talking/rest?
   - Account for potential slow-downs in cold weather?

5. EMOTIONAL JOURNEY:
   - What emotional story does the setlist tell?
   - How do you move from one song's mood to the next?
   - Where are the emotional peaks and valleys?

Provide:
1. Your detailed reasoning about this specific scenario
2. 3-5 specific carol recommendations (by title) with brief rationale for each
3. Key insights about implementing this strategy`;

    const { thinking, response } = await generateWithReasoning(
      prompt,
      'You are an expert caroling conductor analyzing group singing dynamics, cultural authenticity, and emotional pacing.'
    );

    // Parse recommendations from response
    const recommendations = extractRecommendations(response);
    const insights = extractInsights(response);

    return {
      reasoning: thinking || response,
      recommendations,
      keyInsights: insights
    };
  } catch (error) {
    console.error('Error in setlist reasoning:', error);
    throw new Error(`Failed to reason about setlist: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Analyze carol cultural origins and historical context
 * Returns rich metadata for educational purposes
 */
export async function analyzeCarolCulture(
  title: string,
  artist: string
): Promise<{
  origin: string;
  culturalContext: string;
  historicalPeriod: string;
  harmonicStructure: string;
  unusualFacts: string[];
}> {
  try {
    const prompt = `You are a musicologist specializing in Christmas carol traditions and history.

Analyze the carol: "${title}" by ${artist}

Provide deep cultural and historical analysis:

1. ORIGIN: Where and when did this carol originate? What culture/tradition?
2. CULTURAL CONTEXT: What does this song mean in its original culture? Any special traditions around it?
3. HISTORICAL PERIOD: When was it written/popularized? How has it evolved?
4. HARMONIC STRUCTURE: What is its musical structure? (e.g., call-and-response, four-part harmony, drone bass)
5. UNUSUAL FACTS: 2-3 surprising or delightful facts about this carol

Format your response as a JSON object:
{
  "origin": "...",
  "culturalContext": "...",
  "historicalPeriod": "...",
  "harmonicStructure": "...",
  "unusualFacts": ["fact1", "fact2", "fact3"]
}

Only return valid JSON.`;

    const { response } = await generateWithReasoning(
      prompt,
      'You are a musicologist with expertise in Christmas carol history, cultural traditions, and harmonic analysis.'
    );

    const jsonMatch = response.match(/\{[\s\S]*\}/);
    const cleanJson = jsonMatch ? jsonMatch[0] : response;
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error('Error analyzing carol culture:', error);
    throw new Error(`Failed to analyze carol: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Suggest complementary carols based on harmonic/cultural pairing
 * Uses reasoning to understand deep relationships between carols
 */
export async function suggestComplementaryCarols(
  mainCarol: string,
  carols: Array<{ title: string; artist: string; energy: string; tags?: string[] }>
): Promise<string[]> {
  try {
    const prompt = `You are a Christmas carol expert analyzing musical and cultural relationships between songs.

Main carol being sung: "${mainCarol}"

Available carols to pair with:
${carols.slice(0, 20).map(c => `- ${c.title} by ${c.artist} (${c.energy} energy)`).join('\n')}

Find the 3 BEST carols to follow "${mainCarol}" in a setlist. Consider:

1. HARMONIC COMPATIBILITY: Do they share key signatures, harmonic structures, or voice ranges?
2. EMOTIONAL ARC: How does the mood/energy progression feel?
3. CULTURAL PAIRING: Do they come from similar traditions or eras?
4. SINGABILITY: Is there a natural flow between them?
5. THEMATIC CONNECTION: Do they tell a cohesive story together?

Respond ONLY with a JSON array of 3 song titles that best pair with "${mainCarol}":
["Song Title 1", "Song Title 2", "Song Title 3"]

Only return valid JSON.`;

    const { response } = await generateWithReasoning(
      prompt,
      'You are an expert in Christmas carol traditions, harmonic theory, and emotional pacing. Focus on creating setlists that flow naturally.'
    );

    const jsonMatch = response.match(/\[[\s\S]*\]/);
    const cleanJson = jsonMatch ? jsonMatch[0] : response;
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error('Error suggesting complementary carols:', error);
    return [];
  }
}

// Utility functions for parsing responses
function extractRecommendations(text: string): string[] {
  const recommendations: string[] = [];
  
  // Look for patterns like "- Song Title", "* Song Title", or numbered lists
  const patterns = [
    /^\s*[-*•]\s+([A-Z][^\n]+?)(?:\s*[-\(—]|$)/gm,
    /^\s*\d+\.\s+([A-Z][^\n]+?)(?:\s*[-\(—]|$)/gm,
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const rec = match[1].trim().split(/\s*[-–—]\s*/)[0].trim();
      if (rec && !recommendations.includes(rec)) {
        recommendations.push(rec);
      }
    }
  }

  return recommendations.slice(0, 5); // Top 5 recommendations
}

function extractInsights(text: string): string[] {
  const insights: string[] = [];
  
  // Look for key insight sentences (usually after "KEY INSIGHT", "IMPORTANT", etc.)
  const lines = text.split('\n');
  
  for (const line of lines) {
    if (line.match(/^(KEY|INSIGHT|IMPORTANT|TIP|NOTE|CONSIDERATION):/i)) {
      const insight = line.replace(/^.*?:\s*/, '').trim();
      if (insight.length > 20) {
        insights.push(insight);
      }
    }
  }

  return insights.slice(0, 5); // Top 5 insights
}
