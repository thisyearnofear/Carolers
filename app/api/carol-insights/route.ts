import { generateText } from "@/lib/ai";

export async function POST(req: Request) {
  try {
    const {
      title,
      artist,
      insightType,
      prompt: customPrompt,
    } = await req.json();

    if (!title || (!insightType && !customPrompt)) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const prompts: Record<string, string> = {
      history: `Provide a brief, engaging 2-3 sentence history or origin story of the carol "${title}" by ${artist || "traditional"}. Focus on cultural context and historical significance.`,
      techniques: `Give 2-3 practical singing tips for performing "${title}" by ${artist || "traditional"}. Include advice on breath control, pacing, or emotional delivery.`,
      difficulty: `Assess the difficulty level of singing "${title}" by ${artist || "traditional"} in 2-3 sentences. Mention vocal range requirements and technical challenges.`,
      cultural: `Describe the cultural traditions and celebrations associated with "${title}" by ${artist || "traditional"} in 2-3 sentences.`,
    };

    let prompt = "";

    if (customPrompt) {
      prompt = `${customPrompt} for the Christmas carol "${title}" by ${artist || "traditional"}.

      Structure the response as follows:
      1. Start with a warm, festive opening (1 sentence).
      2. Provide 3-4 interesting insights using bullet points.
      3. **Important:** Start each bullet point on a NEW LINE with "* **Title:**".
      4. End with a short, sweet closing sentiment.
      5. Tone: Magical, storytelling, and inviting.
      6. Formatting: Ensure clear line breaks between bullet points.`;
    } else {
      prompt = prompts[insightType] || prompts.history;
    }

    const insight = await generateText(
      prompt,
      "You are a warm, knowledgeable Christmas carol expert. You write in a structured, easy-to-read Markdown format with a magical and festive tone. Use clean Markdown formatting.",
    );

    return Response.json({ insight });
  } catch (error) {
    console.error("Carol insights error:", error);
    return Response.json(
      { error: "Failed to generate insight" },
      { status: 500 },
    );
  }
}
