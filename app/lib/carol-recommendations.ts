import 'server-only';
import { getCarols } from './carols';
import { getEventMessages } from './messages';
import { generateText, generateWithReasoning } from './ai';

/**
 * Carol recommendation with reasoning
 */
export interface CarolRecommendation {
  id: string;
  title: string;
  artist: string;
  energy: string;
  reason: string; // Why this carol is recommended
  momentum: 'building' | 'maintaining' | 'winding-down'; // How it fits in the arc
}

/**
 * Get AI-powered recommendations for next carol(s) to sing
 * Based on: event theme, recently sung carols, chat sentiment, energy flow
 */
export async function getNextCarolRecommendations(
  eventId: string,
  eventTheme: string,
  recentlySelectedCarolIds: string[] = [],
  limit: number = 3,
  options?: any
): Promise<CarolRecommendation[]> {
  try {
    // ... (logic before calling AI)

    // Call Gemini 3 with reasoning for better recommendations
    let responseText = '';
    try {
      const { response } = await generateWithReasoning(
        prompt,
        'You are a Christmas caroling event coordinator with expertise in carol traditions, harmonic theory, and group singing dynamics.',
        options
      );
      responseText = response;
    } catch (error) {
      console.warn('Extended thinking failed, falling back to regular generation:', error);
      responseText = await generateText(prompt, undefined, options);
    }
    
    // ... (rest of parsing logic)
  } catch (error) {
    console.error('Error getting carol recommendations:', error);
    return [];
  }
}

/**
 * Generate contextual info about a carol for display
 * Uses Gemini 3's reasoning for deeper analysis
 * Provides: history, cultural context, harmony type, difficulty, event fit
 */
export async function getCarolInfo(
  title: string,
  artist: string,
  eventTheme: string,
  options?: any
): Promise<string> {
  try {
    // Gemini 3: Be concise and direct. Avoid verbose prompt engineering.
    const prompt = `Provide context about "${title}" by ${artist} for a "${eventTheme}" event.

Include:
1. Historical origin (1 sentence)
2. Vocal range and harmony type
3. Performance difficulty
4. Fit for "${eventTheme}" theme
5. Group singing tips

Limit: 120 words, practical tone.`;

    // Use Gemini 3 with thinking for deeper cultural/musical insight
    try {
      const { response } = await generateWithReasoning(
        prompt,
        'Expert in Christmas carol history, harmony, and group vocal performance.',
        options
      );
      return response;
    } catch (error) {
      console.warn('Reasoning failed, using standard generation:', error);
      // Fallback to simple generation
      const simplePrompt = `You are a Christmas carol expert. 
Provide 1-2 sentence context about "${title}" by ${artist} in the context of a "${eventTheme}" themed caroling event.
Be specific and practical (e.g., harmony type, difficulty, cultural significance, why it fits the theme).
Keep it under 50 words.`;
      return await generateText(simplePrompt, undefined, options);
    }
  } catch (error) {
    console.error('Error generating carol info:', error);
    return '';
  }
}

/**
 * Determine event momentum based on carols already sung and chat sentiment
 */
export function getEventMomentum(
  recentlySelectedCarolIds: string[],
  recentChatSentiment: string
): 'building' | 'maintaining' | 'winding-down' {
  // Simple heuristic: if lots of carols already, we're winding down
  // If chat is excited, we're building
  if (recentlySelectedCarolIds.length > 10) return 'winding-down';
  if (recentChatSentiment === 'upbeat') return 'building';
  if (recentChatSentiment === 'reflective') return 'maintaining';
  return 'maintaining';
}
