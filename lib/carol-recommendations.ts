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
  limit: number = 3
): Promise<CarolRecommendation[]> {
  try {
    // Get all available carols
    const allCarols = await getCarols({ lang: 'en' });
    
    if (allCarols.length === 0) {
      return [];
    }

    // Get recent event chat to understand sentiment
    const messages = await getEventMessages(eventId);
    const recentMessages = messages.slice(-10);
    const chatContext = recentMessages
      .map(m => `${(m as any).userName || 'Someone'}: ${m.text}`)
      .join(' | ');

    // Analyze sentiment from chat
    let sentiment = 'neutral';
    if (chatContext) {
      const chatLower = chatContext.toLowerCase();
      if (chatLower.includes('exciting') || chatLower.includes('great') || chatLower.includes('love')) {
        sentiment = 'upbeat';
      } else if (chatLower.includes('peaceful') || chatLower.includes('quiet') || chatLower.includes('calm')) {
        sentiment = 'reflective';
      } else if (chatLower.includes('tired') || chatLower.includes('winding')) {
        sentiment = 'winding-down';
      }
    }

    // Build prompt for Gemini to recommend carols
    const recentSongList = recentlySelectedCarolIds.length > 0
      ? `Recently sung: ${recentlySelectedCarolIds.slice(0, 3).join(', ')}`
      : 'No carols sung yet';

    const prompt = `You are a Christmas caroling event coordinator with deep knowledge of carol traditions, cultural significance, and musical harmonies.

Given the context below, recommend 3 carols from the provided list that would be perfect to sing next. Consider:
- Emotional arc and energy flow of the event
- Difficulty progression for singers
- Cultural and historical appropriateness
- Harmonic structure and singability in groups

Event Theme: ${eventTheme}
Sentiment: ${sentiment}
${recentSongList}
Recent Chat: ${chatContext || 'No chat yet'}
Available Carols: ${JSON.stringify(allCarols.slice(0, 20).map(c => ({ id: c.id, title: c.title, artist: c.artist, energy: c.energy, tags: c.tags })))}

For each recommendation:
1. Choose a carol that fits the theme and current sentiment
2. Explain WHY it's a good next choice (consider harmony, cultural fit, emotional progression)
3. Indicate momentum: is this 'building' energy, 'maintaining' it, or 'winding-down'

Format your response as JSON array with objects: { "title": "...", "artist": "...", "reason": "...", "momentum": "building|maintaining|winding-down" }

Only return valid JSON array, no other text.`;

    // Call Gemini 3 with reasoning for better recommendations
    let responseText = '';
    try {
      const { response } = await generateWithReasoning(
        prompt,
        'You are a Christmas caroling event coordinator with expertise in carol traditions, harmonic theory, and group singing dynamics.'
      );
      responseText = response;
    } catch (error) {
      console.warn('Extended thinking failed, falling back to regular generation:', error);
      responseText = await generateText(prompt);
    }
    
    // Parse JSON response
    let recommendations: Array<{ title: string; artist: string; reason: string; momentum: 'building' | 'maintaining' | 'winding-down' }>;
    try {
      recommendations = JSON.parse(responseText);
    } catch {
      // If JSON parsing fails, return empty
      return [];
    }

    // Map recommendations to actual carols and return
    const result: CarolRecommendation[] = [];
    
    for (const rec of recommendations) {
      const matchedCarol = allCarols.find(
        c => c.title.toLowerCase() === rec.title.toLowerCase() &&
             c.artist.toLowerCase() === rec.artist.toLowerCase()
      );

      if (matchedCarol) {
        result.push({
          id: matchedCarol.id,
          title: matchedCarol.title,
          artist: matchedCarol.artist,
          energy: matchedCarol.energy || 'medium',
          reason: rec.reason,
          momentum: rec.momentum
        });
      }
    }

    return result.slice(0, limit);
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
  eventTheme: string
): Promise<string> {
  try {
    const prompt = `You are a Christmas carol expert with deep knowledge of musical history, cultural traditions, and group singing.

Provide comprehensive context about "${title}" by ${artist} for a "${eventTheme}" themed event.
Include:
1. Historical/cultural origin (1 sentence)
2. Harmony type (soprano/alto/tenor/bass considerations)
3. Difficulty level and why
4. Why it fits this event theme
5. One unique insight about singability in groups

Keep it under 120 words, practical and engaging.`;

    // Use Gemini 3 reasoning for deeper analysis
    try {
      const { response } = await generateWithReasoning(
        prompt,
        'You are an expert in Christmas carol traditions, cultural history, and musical harmonics.'
      );
      return response;
    } catch (error) {
      console.warn('Reasoning failed, using standard generation:', error);
      // Fallback to simple generation
      const simplePrompt = `You are a Christmas carol expert. 
Provide 1-2 sentence context about "${title}" by ${artist} in the context of a "${eventTheme}" themed caroling event.
Be specific and practical (e.g., harmony type, difficulty, cultural significance, why it fits the theme).
Keep it under 50 words.`;
      return await generateText(simplePrompt);
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
