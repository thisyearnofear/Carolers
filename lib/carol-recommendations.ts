import 'server-only';
import { getCarols } from './carols';
import { getEventMessages } from './messages';
import { generateText } from './ai';

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

    const prompt = `You are a Christmas caroling event coordinator.
Given the context below, recommend 3 carols from the provided list that would be perfect to sing next.

Event Theme: ${eventTheme}
Sentiment: ${sentiment}
${recentSongList}
Recent Chat: ${chatContext || 'No chat yet'}
Available Carols: ${JSON.stringify(allCarols.slice(0, 20).map(c => ({ id: c.id, title: c.title, artist: c.artist, energy: c.energy })))}

For each recommendation:
1. Choose a carol that fits the theme and current sentiment
2. Explain WHY it's a good next choice (2-3 sentences max)
3. Indicate momentum: is this 'building' energy, 'maintaining' it, or 'winding-down'

Format your response as JSON array with objects: { "title": "...", "artist": "...", "reason": "...", "momentum": "building|maintaining|winding-down" }

Only return valid JSON array, no other text.`;

    // Call Gemini to get recommendations
    const responseText = await generateText(prompt);
    
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
 * E.g., "Perfect for group harmony" or "Traditional classic"
 */
export async function getCarolInfo(
  title: string,
  artist: string,
  eventTheme: string
): Promise<string> {
  try {
    const prompt = `You are a Christmas carol expert. 
Provide 1-2 sentence context about "${title}" by ${artist} in the context of a "${eventTheme}" themed caroling event.
Be specific and practical (e.g., harmony type, difficulty, cultural significance, why it fits the theme).
Keep it under 50 words.`;

    return await generateText(prompt);
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
