import { GoogleGenerativeAI } from '@google/generative-ai';

interface ImageAnalysisRequest {
  carolId?: string;
  carolTitle?: string;
  imageUrl?: string;
  imageBase64?: string;
  imageMimeType?: string;
  analysisType: 'sheet_music' | 'cover_art' | 'performance' | 'general';
  settings?: any;
}

export async function POST(req: Request) {
  try {
    const body = await req.json() as ImageAnalysisRequest;
    const { carolTitle, imageUrl, imageBase64, imageMimeType, analysisType, settings } = body;

    // ... validation (kept same)

    const apiKey = settings?.geminiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("AI Key missing.");
    
    const genAI = new GoogleGenerativeAI(apiKey);

    const modelName = settings?.useGemini3 ? 'gemini-3-pro-preview' : 'gemini-1.5-pro';
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature: 1.0, 
      } as any,
    });

    // ... analysis prompts (kept same)

    // Call Gemini with high media resolution for detailed analysis
    const result = await (model as any).generateContent({
      contents,
      generationConfig: {
        temperature: 1.0,
        maxOutputTokens: 2000,
        topK: 40,
        topP: 0.95,
        // Only Gemini 3 supports high reasoning budget
        thinkingConfig: settings?.useGemini3 ? { thinkingLevel: 'high' } : undefined
      },
      // High media resolution for fine details (sheet music notes, small text, etc.)
      requestOptions: {
        mediaResolution: 'HIGH'
      }
    });

    const response = await result.response;
    const analysisText = response.text();

    return Response.json({
      success: true,
      analysisType,
      carolTitle: carolTitle || 'Unknown Carol',
      analysis: analysisText,
      model: modelName,
      capabilities: {
        visionAnalysis: true,
        extendedContext: true,
        mediaResolution: 'high',
        multimodalReasoning: true
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Image analysis error:', error);
    return Response.json(
      {
        error: 'Failed to analyze image',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
