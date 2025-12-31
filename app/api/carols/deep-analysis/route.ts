import { generateWithReasoning } from '@/lib/ai';

interface DeepAnalysisRequest {
  carolId: string;
  title: string;
  artist: string;
  analysisType: 'composition' | 'performance' | 'cultural' | 'harmony';
}

export async function POST(req: Request) {
  try {
    const { title, artist, analysisType } = await req.json() as DeepAnalysisRequest;

    if (!title || !analysisType) {
      return Response.json(
        { error: 'Missing required fields: title, analysisType' },
        { status: 400 }
      );
    }

    const prompts: Record<string, string> = {
      composition: `Analyze the musical composition of "${title}" by ${artist || 'traditional'} in depth. Consider:
1. Harmonic structure and chord progressions
2. Melodic arc and phrasing
3. Rhythmic complexity and time signature
4. Overall structural form (verse-chorus, bridge, etc.)
Provide insights that would help a musician understand and interpret this carol.`,

      performance: `Assess the performance difficulty of "${title}" by ${artist || 'traditional'}. Analyze:
1. Vocal range requirements (identify lowest and highest notes)
2. Breath control demands
3. Articulation and technique challenges
4. Emotional performance intensity
5. Rehearsal recommendations for group singers
Be specific and practical for a caroling ensemble.`,

      cultural: `Examine the cultural and historical significance of "${title}" by ${artist || 'traditional'}. Research:
1. Geographic and cultural origin
2. Historical context of composition/tradition
3. Religious or secular traditions it's associated with
4. Modern cultural relevance
5. Variations across different cultures
Explain why this carol matters in Christmas tradition.`,

      harmony: `Analyze the harmonic opportunities in "${title}" by ${artist || 'traditional'} for group singing. Consider:
1. Natural soprano/alto/tenor/bass voice parts
2. Harmonic intervals and voice leading
3. Opportunities for parallel harmony vs. counterpoint
4. Complexity for different vocal skill levels
5. Arrangement suggestions for maximum impact
Help a director understand how to arrange this for different ensemble sizes.`
    };

    const systemPrompts: Record<string, string> = {
      composition: 'You are an expert music theorist and composer. Analyze carols with deep musical knowledge.',
      performance: 'You are an experienced vocal coach and choir director. Provide practical performance guidance.',
      cultural: 'You are a musicologist and cultural historian specializing in Christmas traditions.',
      harmony: 'You are an accomplished choral arranger with expertise in voice leading and ensemble singing.'
    };

    const prompt = prompts[analysisType] || prompts.composition;
    const systemPrompt = systemPrompts[analysisType] || systemPrompts.composition;

    // Use Gemini 3 Pro with extended thinking for deep analysis
    const { thinking, response } = await generateWithReasoning(
      prompt,
      systemPrompt,
      8000 // Higher thinking budget for complex analysis
    );

    return Response.json({
      analysisType,
      title,
      artist,
      thinking: thinking || '(Reasoning process)',
      analysis: response,
      metadata: {
        model: 'gemini-3-pro',
        thinkingEnabled: true,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Deep analysis error:', error);
    return Response.json(
      { error: 'Failed to generate analysis' },
      { status: 500 }
    );
  }
}
