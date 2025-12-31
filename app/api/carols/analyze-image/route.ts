import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Carol Image Analysis using Gemini 3 Vision
 * 
 * Analyzes carol-related images:
 * - Sheet music: Read notation, identify vocal parts, assess complexity
 * - Cover art: Analyze cultural symbolism, artistic style, seasonal theme
 * - Performance photos: Suggest staging, costume, choreography improvements
 * 
 * Uses media_resolution_high for detailed analysis of musical notation and fine details
 */

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

interface ImageAnalysisRequest {
  carolId?: string;
  carolTitle?: string;
  imageUrl?: string;
  imageBase64?: string;
  imageMimeType?: string;
  analysisType: 'sheet_music' | 'cover_art' | 'performance' | 'general';
}

export async function POST(req: Request) {
  try {
    const body = await req.json() as ImageAnalysisRequest;
    const { carolTitle, imageUrl, imageBase64, imageMimeType, analysisType } = body;

    if (!analysisType) {
      return Response.json(
        { error: 'analysisType is required' },
        { status: 400 }
      );
    }

    if (!imageUrl && !imageBase64) {
      return Response.json(
        { error: 'Either imageUrl or imageBase64 is required' },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-3-pro-preview',
      generationConfig: {
        temperature: 1.0, // Required for Gemini 3
      } as any,
    });

    const analysisPrompts = {
      sheet_music: `Analyze this sheet music${carolTitle ? ` for "${carolTitle}"` : ''} in detail:

1. **Vocal Parts**: Identify and describe soprano, alto, tenor, bass parts
2. **Notation Details**: Key signature, time signature, tempo markings, dynamic markings
3. **Harmonic Analysis**: Major harmonic progressions, modulations, interesting harmonic moments
4. **Vocal Range**: Estimated range for each part
5. **Performance Difficulty**: Rate overall difficulty (easy/moderate/challenging)
6. **Arrangement Quality**: Assess voice leading and singability
7. **Recommendations**: Specific tips for performing this arrangement

Be precise and technical - this analysis will guide singers and directors.`,

      cover_art: `Analyze this carol cover art${carolTitle ? ` for "${carolTitle}"` : ''} in detail:

1. **Visual Elements**: Main imagery, colors, composition, artistic style
2. **Cultural Symbolism**: Christmas traditions represented, religious elements
3. **Mood & Atmosphere**: What emotional response does the cover convey?
4. **Artistic Quality**: Professional vs. amateur, design choices
5. **Typography**: Font choices, readability, design integration
6. **Connection to Carol**: How well does the cover reflect the carol's meaning?
7. **Performance Suggestions**: Does the cover suggest staging, costume, or performance style ideas?

Provide insights that could inspire performance choices or cover redesigns.`,

      performance: `Analyze this performance photo${carolTitle ? ` for "${carolTitle}"` : ''} in detail:

1. **Staging & Positioning**: Current formation, sightlines, spatial use
2. **Lighting**: Identify lighting type, quality, atmospheric effect
3. **Costumes & Appearance**: Dress code, cultural appropriateness, unity
4. **Vocal Technique Visible**: Posture, breath support, emotional expression
5. **Audience Engagement**: Connection with audience, emotional impact
6. **Technical Quality**: Audio/video quality visible
7. **Improvement Suggestions**: Specific actionable feedback for next performance

Focus on practical performance enhancement.`,

      general: `Analyze this image${carolTitle ? ` related to "${carolTitle}"` : ''} in detail. Provide:
1. Detailed description of all visual elements
2. Context and relevance to Christmas caroling tradition
3. Technical quality assessment
4. Suggestions for how this could enhance carol performance or appreciation
5. Any notable cultural or artistic significance

Be comprehensive and thoughtful.`
    };

    const prompt = analysisPrompts[analysisType];

    // Build content with proper media resolution
    const contents = [
      {
        role: 'user' as const,
        parts: [
          {
            text: prompt
          },
          imageUrl ? 
            { inlineData: { mimeType: 'image/jpeg', data: imageUrl } } :
            {
              inlineData: {
                mimeType: imageMimeType || 'image/jpeg',
                data: imageBase64
              }
            }
        ]
      }
    ];

    // Call Gemini 3 with high media resolution for detailed analysis
    const result = await (model as any).generateContent({
      contents,
      generationConfig: {
        temperature: 1.0,
        maxOutputTokens: 2000,
        topK: 40,
        topP: 0.95,
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
      model: 'gemini-3-pro-preview',
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
