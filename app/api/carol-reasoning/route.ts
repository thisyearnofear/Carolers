import { reasonAboutSetlist, analyzeCarolCulture, suggestComplementaryCarols } from '@/lib/carol-reasoning';

export async function POST(request: Request) {
  try {
    const { action, args } = await request.json();

    if (!action || !args) {
      return Response.json(
        { error: 'Missing action or args' },
        { status: 400 }
      );
    }

    let result;

    switch (action) {
      case 'reasonAboutSetlist':
        result = await reasonAboutSetlist(args);
        break;
      
      case 'analyzeCarolCulture':
        result = await analyzeCarolCulture(args.title, args.artist);
        break;
      
      case 'suggestComplementaryCarols':
        result = await suggestComplementaryCarols(args.mainCarol, args.carols);
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
      { error: 'Failed to process carol reasoning' },
      { status: 500 }
    );
  }
}
