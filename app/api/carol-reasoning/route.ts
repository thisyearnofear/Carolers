import { reasonAboutSetlist, analyzeCarolCulture, suggestComplementaryCarols, analyzeCarolDeeply } from '@/lib/carol-reasoning';
import { getCarols, type CarolFilters } from '@/lib/carols';
import { getCarolInfo, getNextCarolRecommendations } from '@/lib/carol-recommendations';
import { generateText } from '@/lib/ai';
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
    const { action, args, settings } = body;

    if (!action || !args) {
      return Response.json(
        { error: 'Missing action or args' },
        { status: 400 }
      );
    }

    const options = {
      provider: settings?.provider || 'gemini',
      userKey: settings?.provider === 'venice' ? settings?.veniceKey : settings?.geminiKey,
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
        const { title, artist, insightType, prompt: customPrompt } = args;
        const prompts: Record<string, string> = {
          history: CarolPrompts.quickHistory(title, artist),
          techniques: CarolPrompts.quickTechniques(title, artist),
          difficulty: CarolPrompts.quickDifficulty(title, artist),
          cultural: CarolPrompts.quickCultural(title, artist),
        };
        
        const promptText = customPrompt 
          ? CarolPrompts.customInsight(title, artist, customPrompt)
          : (prompts[insightType] || prompts.history);

        result = await generateText(
          promptText,
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
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to process carol reasoning' },
      { status: 500 }
    );
  }
}