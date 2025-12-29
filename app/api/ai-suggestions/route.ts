import { getCarols, type CarolFilters } from '@/lib/carols';

// Direct tool handler for suggestSetlist (mirrors handleSuggestSetlist from ai.ts)
async function suggestSetlist(args: {
  theme: string;
  duration?: string;
  count?: number;
}) {
  try {
    const filters: CarolFilters = {
      query: args.theme
    };
    
    const allCarols = await getCarols(filters);
    
    // Parse duration to estimate count
    let estimatedCount = args.count || 5;
    if (args.duration) {
      const durationStr = args.duration.toLowerCase();
      if (durationStr.includes('30')) estimatedCount = 3;
      else if (durationStr.includes('45') || durationStr.includes('one hour')) estimatedCount = 5;
      else if (durationStr.includes('2') || durationStr.includes('two')) estimatedCount = 10;
    }
    
    // Calculate total duration of selected carols
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
    
    // Fallback if not enough carols found
    if (setlist.length === 0 && allCarols.length > 0) {
      return {
        success: true,
        tool: 'suggestSetlist',
        theme: args.theme,
        count: allCarols.length,
        totalDuration: `${totalMinutes} minutes`,
        setlist: allCarols.slice(0, estimatedCount).map(carol => ({
          title: carol.title,
          artist: carol.artist,
          duration: carol.duration || '~3 min',
          energy: carol.energy
        }))
      };
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
    return {
      success: false,
      tool: 'suggestSetlist',
      error: 'Failed to suggest setlist'
    };
  }
}

export async function POST(request: Request) {
  try {
    const { tool, args } = await request.json();

    if (!tool || !args) {
      return Response.json(
        { error: 'Missing tool or args' },
        { status: 400 }
      );
    }

    let result;

    switch (tool) {
      case 'suggestSetlist':
        result = await suggestSetlist(args);
        break;
      default:
        return Response.json(
          { error: `Unknown tool: ${tool}` },
          { status: 400 }
        );
    }

    return Response.json({ result });
  } catch (error) {
    console.error('Error in ai-suggestions route:', error);
    return Response.json(
      { error: 'Failed to process AI suggestion' },
      { status: 500 }
    );
  }
}
