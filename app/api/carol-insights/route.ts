import { GoogleGenerativeAI } from '@google/generative-ai';

const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { title, artist, insightType } = await req.json();

    if (!title || !insightType) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const model = client.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompts: Record<string, string> = {
      history: `Provide a brief, engaging 2-3 sentence history or origin story of the carol "${title}" by ${artist || 'traditional'}. Focus on cultural context and historical significance.`,
      techniques: `Give 2-3 practical singing tips for performing "${title}" by ${artist || 'traditional'}. Include advice on breath control, pacing, or emotional delivery.`,
      difficulty: `Assess the difficulty level of singing "${title}" by ${artist || 'traditional'} in 2-3 sentences. Mention vocal range requirements and technical challenges.`,
      cultural: `Describe the cultural traditions and celebrations associated with "${title}" by ${artist || 'traditional'} in 2-3 sentences.`
    };

    const prompt = prompts[insightType] || prompts.history;

    const result = await model.generateContent(prompt);
    const insight = result.response.text();

    return Response.json({ insight });
  } catch (error) {
    console.error('Carol insights error:', error);
    return Response.json(
      { error: 'Failed to generate insight' },
      { status: 500 }
    );
  }
}
