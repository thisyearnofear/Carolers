import { reasonAboutSetlist, analyzeCarolCulture, suggestComplementaryCarols, analyzeCarolDeeply } from '@/lib/carol-reasoning';
import { getCarols, type CarolFilters } from '@/lib/carols';
import { getCarolInfo, getNextCarolRecommendations } from '@/lib/carol-recommendations';
import { generateText, generateWithReasoning, type RequestOptions, type AIProvider } from '@/lib/ai';
import { CarolPrompts } from '@/lib/ai-prompts';

// Direct logic for quick setlist suggestion (mirrored from ai-suggestions)
async function suggestSetlistQuick(args: {
  theme: string;
  duration?: string;
  count?: number;
}) {
  try {
    const filters: CarolFilters = {
      query: args.theme
    };
    
    const allCarols = await getCarols(filters);
    
    let estimatedCount = args.count || 5;
    if (args.duration) {
      const durationStr = args.duration.toLowerCase();
      if (durationStr.includes('30')) estimatedCount = 3;
      else if (durationStr.includes('45') || durationStr.includes('one hour')) estimatedCount = 5;
      else if (durationStr.includes('2') || durationStr.includes('two')) estimatedCount = 10;
    }
    
    let totalMinutes = 0;
    const setlist = [];
    
    for (const carol of allCarols) {
      if (setlist.length >= estimatedCount) break;
      const durationMinutes = carol.duration ? parseInt(carol.duration) : 3;
      if (totalMinutes + durationMinutes <= (estimatedCount * 3)) {
        setlist.push({
          title: carol.title,
          artist: carol.artist,
          duration: carol.duration || '~3 min',
          energy: carol.energy,
          tags: carol.tags
        });
        totalMinutes += durationMinutes;
      }
    }
    
    return {
      success: true,
      tool: 'suggestSetlist',
      theme: args.theme,
      requestedDuration: args.duration,
      count: setlist.length,
      totalDuration: `${totalMinutes} minutes`,
      setlist
    };
  } catch (error) {
    console.error('Error in suggestSetlist:', error);
    return { success: false, error: 'Failed to suggest setlist' };
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Carol Reasoning Request:', JSON.stringify(body).substring(0, 200) + '...');
    const { action, args, settings } = body;

    if (!action || !args) {
      console.warn('Missing action or args in request body');
      return Response.json(
        { error: 'Missing action or args' },
        { status: 400 }
      );
    }

    const options: RequestOptions = {
      provider: (settings?.provider as AIProvider) || 'gemini',
      userKey: settings?.provider === 'venice' ? settings?.veniceKey : (settings?.geminiKey || undefined),
      useGemini3: settings?.useGemini3 || false
    };

    let result;

    switch (action) {
      case 'reasonAboutSetlist':
        result = await reasonAboutSetlist(args, options);
        break;
      
      case 'analyzeCarolCulture':
        result = await analyzeCarolCulture(args.title, args.artist, options);
        break;
      
      case 'suggestComplementaryCarols':
        result = await suggestComplementaryCarols(args.mainCarol, args.carols, options);
        break;

      case 'analyzeCarolDeeply':
        result = await analyzeCarolDeeply(args.title, args.artist, args.type, options);
        break;

      case 'getCarolInfo':
        result = await getCarolInfo(args.title, args.artist, args.eventTheme || 'general', options);
        break;

      case 'getQuickInsight':
        const { title: qTitle, artist: qArtist, insightType: qType, prompt: customPrompt } = args;
        
        // Ensure keys match frontend: story, singAlong, performance, traditions
        const qPrompts: Record<string, string> = {
          story: CarolPrompts.quickHistory(qTitle, qArtist),
          singAlong: CarolPrompts.quickTechniques(qTitle, qArtist),
          performance: CarolPrompts.quickDifficulty(qTitle, qArtist),
          traditions: CarolPrompts.quickCultural(qTitle, qArtist),
        };
        
        const qPromptText = customPrompt 
          ? CarolPrompts.customInsight(qTitle, qArtist, customPrompt)
          : (qPrompts[qType] || qPrompts.story);

        console.log(`Getting Quick Insight for type: ${qType} using ${options.useGemini3 ? 'Reasoning' : 'Standard'}`);

        // Leverage Reasoning for all insights if requested, otherwise fallback to generating text
        result = await generateWithReasoning(
          qPromptText,
          "You are a warm, knowledgeable Christmas carol expert. Use clean Markdown formatting.",
          options
        );
        break;

      case 'getNextRecommendations':
        result = await getNextCarolRecommendations(
          args.eventId,
          args.eventTheme || 'Christmas',
          args.recentCarolIds || [],
          args.limit || 3,
          options
        );
        break;

      case 'suggestSetlist':
        if (options.useGemini3) {
          result = await reasonAboutSetlist({
            theme: args.theme,
            groupSize: 10,
            duration: 45
          }, options);
        } else {
          result = await suggestSetlistQuick(args);
        }
        break;
      
      default:
        return Response.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }

    return Response.json({ result });
  } catch (error) {
    console.error('Error in carol-reasoning route:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to process carol reasoning';
    
    // Check for specific error types
    if (errorMessage.includes('429') || errorMessage.includes('RATE_LIMIT_EXCEEDED') || errorMessage.includes('Too Many Requests')) {
      return Response.json(
        { 
          error: 'AI rate limit exceeded. Please wait a moment and try again.',
          code: 'RATE_LIMIT',
          details: errorMessage
        },
        { status: 429 }
      );
    }
    
    if (errorMessage.includes('API key') || errorMessage.includes('authentication') || errorMessage.includes('unauthorized')) {
      return Response.json(
        { 
          error: 'AI authentication failed. Please check your API key in settings.',
          code: 'AUTH_ERROR',
          details: errorMessage
        },
        { status: 401 }
      );
    }
    
    if (errorMessage.includes('quota') || errorMessage.includes('exceeded') || errorMessage.includes('credits')) {
      return Response.json(
        { 
          error: 'AI quota exceeded. Please check your API usage or try again later.',
          code: 'QUOTA_EXCEEDED',
          details: errorMessage
        },
        { status: 429 }
      );
    }
    
    return Response.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}