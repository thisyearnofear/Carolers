import "server-only";
import {
  GoogleGenerativeAI,
  SchemaType,
  type FunctionDeclarationsTool,
} from "@google/generative-ai";
import { getEventMessages } from "./messages";
import { getCarols, type CarolFilters } from "./carols";

// Initialize Gemini AI client
let aiClient: GoogleGenerativeAI | null = null;

function getAIClient() {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return aiClient;
}

/**
 * Gemini 3 Model Configuration
 * Uses gemini-3-pro-preview for best quality (function calling + reasoning)
 * Falls back to gemini-3-flash-preview for faster inference when reasoning not needed
 */
const MODEL_GEMINI3_PRO = "gemini-3-pro-preview";
const MODEL_GEMINI3_FLASH = "gemini-3-flash-preview";

// Fallback models if Gemini 3 is not available
const MODEL_FALLBACK_PRO = "gemini-1.5-pro";
const MODEL_FALLBACK_FLASH = "gemini-1.5-flash";

// Use Pro for complex reasoning, Flash for fast recommendations
type ModelVariant = "pro" | "flash";

let modelAvailability: Record<string, boolean> = {};

async function testModelAvailability(
  client: GoogleGenerativeAI,
  modelName: string,
): Promise<boolean> {
  try {
    const model = client.getGenerativeModel({ model: modelName });
    await model.generateContent("test");
    return true;
  } catch (error: any) {
    if (error.status === 404) {
      return false;
    }
    // For other errors, assume model is available
    return true;
  }
}

async function getModelName(variant: ModelVariant = "flash"): Promise<string> {
  const client = getAIClient();
  if (!client)
    return variant === "pro" ? MODEL_FALLBACK_PRO : MODEL_FALLBACK_FLASH;

  const primaryModel =
    variant === "pro" ? MODEL_GEMINI3_PRO : MODEL_GEMINI3_FLASH;
  const fallbackModel =
    variant === "pro" ? MODEL_FALLBACK_PRO : MODEL_FALLBACK_FLASH;

  // Check cache first
  if (modelAvailability[primaryModel] === true) return primaryModel;
  if (modelAvailability[primaryModel] === false) return fallbackModel;

  // Test availability
  const isAvailable = await testModelAvailability(client, primaryModel);
  modelAvailability[primaryModel] = isAvailable;

  if (!isAvailable) {
    console.warn(
      `Model ${primaryModel} not available, falling back to ${fallbackModel}`,
    );
  }

  return isAvailable ? primaryModel : fallbackModel;
}

/**
 * Tool definitions for Gemini function calling
 * Each tool maps to a real implementation below
 */
const TOOL_DEFINITIONS: FunctionDeclarationsTool = {
  functionDeclarations: [
    {
      name: "searchCarols",
      description:
        'Search for Christmas carols by title, artist, mood, or energy level. Use mood terms like "upbeat", "relaxing", "traditional", or "religious". Energy levels: "high" or "low".',
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          query: {
            type: SchemaType.STRING,
            description: "Search query for carol title, artist, or keyword",
          },
          mood: {
            type: SchemaType.STRING,
            description:
              'Mood filter: "upbeat", "relaxing", "traditional", or "religious"',
          },
          energy: {
            type: SchemaType.STRING,
            description: 'Energy level filter: "high" or "low"',
          },
          limit: {
            type: SchemaType.NUMBER,
            description: "Maximum number of results to return (default: 5)",
          },
        },
        required: ["query"],
      },
    },
    {
      name: "summarizeChat",
      description:
        "Summarize recent chat messages from an event to understand context and discussion",
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          eventId: {
            type: SchemaType.STRING,
            description: "ID of the event to summarize",
          },
          messageCount: {
            type: SchemaType.NUMBER,
            description: "Number of recent messages to include (default: 10)",
          },
        },
        required: ["eventId"],
      },
    },
    {
      name: "suggestSetlist",
      description:
        "Suggest a setlist of Christmas carols based on event theme and duration",
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          theme: {
            type: SchemaType.STRING,
            description: "Theme or style of the event",
          },
          duration: {
            type: SchemaType.STRING,
            description:
              'Approximate duration of the event (e.g., "30 minutes", "1 hour")',
          },
          count: {
            type: SchemaType.NUMBER,
            description: "Number of songs to suggest (default: 5)",
          },
        },
        required: ["theme"],
      },
    },
    {
      name: "addContribution",
      description:
        "Suggest contribution ideas for the event based on what is being discussed",
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          category: {
            type: SchemaType.STRING,
            description:
              'Category of contribution: "Food", "Equipment", "Music", or "Other"',
          },
          context: {
            type: SchemaType.STRING,
            description: "Context for the suggestion",
          },
        },
      },
    },
  ],
};

/**
 * Tool implementation handlers
 */
async function handleSearchCarols(args: {
  query: string;
  mood?: string;
  energy?: string;
  limit?: number;
}) {
  try {
    const filters: CarolFilters = {
      query: args.query,
      mood: args.mood,
      energy: args.energy,
    };

    const results = await getCarols(filters);
    const limited = results.slice(0, args.limit || 5);

    return {
      success: true,
      tool: "searchCarols",
      query: args.query,
      appliedFilters: {
        mood: args.mood,
        energy: args.energy,
      },
      count: limited.length,
      results: limited.map((carol) => ({
        id: carol.id,
        title: carol.title,
        artist: carol.artist,
        energy: carol.energy,
        duration: carol.duration,
        tags: carol.tags,
      })),
    };
  } catch (error) {
    console.error("Error in searchCarols tool:", error);
    return {
      success: false,
      tool: "searchCarols",
      error: "Failed to search carols",
    };
  }
}

async function handleSummarizeChat(args: {
  eventId: string;
  messageCount?: number;
}) {
  try {
    const allMessages = await getEventMessages(args.eventId);
    const count = args.messageCount || 10;
    const recent = allMessages.slice(-count);

    if (recent.length === 0) {
      return {
        success: true,
        tool: "summarizeChat",
        messageCount: 0,
        summary: "No messages yet in this event.",
        topics: [],
        participants: [],
      };
    }

    // Extract metadata from messages
    const participants = [
      ...new Set(recent.map((m) => (m as any).userName || "Someone")),
    ];
    const messageTexts = recent.map((m) => m.text).join(" ");

    // Extract potential topics/keywords
    const keywords =
      messageTexts
        .toLowerCase()
        .match(
          /\b(carol|song|sing|music|perform|duration|venue|date|time|theme)\b/g,
        ) || [];
    const topics = [...new Set(keywords)];

    const summary = recent
      .map((m) => `${(m as any).userName || "Someone"}: ${m.text}`)
      .join("\n");

    return {
      success: true,
      tool: "summarizeChat",
      messageCount: recent.length,
      summary,
      participants,
      topics,
      sentiment:
        messageTexts.includes("exciting") || messageTexts.includes("great")
          ? "positive"
          : "neutral",
    };
  } catch (error) {
    console.error("Error in summarizeChat tool:", error);
    return {
      success: false,
      tool: "summarizeChat",
      error: "Failed to summarize chat",
    };
  }
}

async function handleSuggestSetlist(args: {
  theme: string;
  duration?: string;
  count?: number;
}) {
  try {
    const filters: CarolFilters = {
      query: args.theme, // Use theme as search query for thematic matches
    };

    const allCarols = await getCarols(filters);

    // Parse duration to estimate count
    let estimatedCount = args.count || 5;
    if (args.duration) {
      const durationStr = args.duration.toLowerCase();
      if (durationStr.includes("30")) estimatedCount = 3;
      else if (durationStr.includes("45") || durationStr.includes("one hour"))
        estimatedCount = 5;
      else if (durationStr.includes("2") || durationStr.includes("two"))
        estimatedCount = 10;
    }

    // Calculate total duration of selected carols
    let totalMinutes = 0;
    const setlist = [];

    for (const carol of allCarols) {
      if (setlist.length >= estimatedCount) break;

      const durationMinutes = carol.duration ? parseInt(carol.duration) : 3;
      if (totalMinutes + durationMinutes <= estimatedCount * 3) {
        // Assume ~3 min per song avg
        setlist.push({
          title: carol.title,
          artist: carol.artist,
          duration: carol.duration || "~3 min",
          energy: carol.energy,
          tags: carol.tags,
        });
        totalMinutes += durationMinutes;
      }
    }

    // Fallback if not enough carols found
    if (setlist.length === 0 && allCarols.length > 0) {
      return {
        success: true,
        tool: "suggestSetlist",
        theme: args.theme,
        count: allCarols.length,
        totalDuration: `${totalMinutes} minutes`,
        setlist: allCarols.slice(0, estimatedCount).map((carol) => ({
          title: carol.title,
          artist: carol.artist,
          duration: carol.duration || "~3 min",
          energy: carol.energy,
        })),
      };
    }

    return {
      success: true,
      tool: "suggestSetlist",
      theme: args.theme,
      requestedDuration: args.duration,
      count: setlist.length,
      totalDuration: `${totalMinutes} minutes`,
      setlist,
    };
  } catch (error) {
    console.error("Error in suggestSetlist tool:", error);
    return {
      success: false,
      tool: "suggestSetlist",
      error: "Failed to suggest setlist",
    };
  }
}

async function handleAddContribution(args: {
  category?: string;
  context?: string;
}) {
  try {
    const category = args.category || "Other";
    const suggestions = [];

    // Context-aware suggestions based on category
    if (args.context) {
      suggestions.push({
        item: args.context,
        category,
        source: "user-requested",
      });
    }

    // Generate additional category-specific suggestions
    const categoryGuidelines: Record<string, string[]> = {
      Food: [
        "Hot beverages (coffee, hot chocolate)",
        "Cookies or treats",
        "Hot cider",
        "Sandwiches",
        "Fruit platter",
      ],
      Equipment: [
        "Portable speaker or PA system",
        "Microphones",
        "Sheet music folders",
        "Music stands",
        "Lighting equipment",
      ],
      Music: [
        "Extra copies of carol lyrics",
        "Accompaniment tracks",
        "Percussion instruments",
        "Sleigh bells",
        "Hand drums",
      ],
      Other: [
        "Transportation",
        "Decorations",
        "Thank you cards",
        "Name tags",
        "First aid kit",
      ],
    };

    const guideline =
      categoryGuidelines[category] || categoryGuidelines["Other"];
    if (guideline && guideline.length > 0) {
      // Add top 2 suggestions from guidelines
      for (let i = 0; i < Math.min(2, guideline.length); i++) {
        if (!suggestions.some((s) => s.item === guideline[i])) {
          suggestions.push({
            item: guideline[i],
            category,
            source: "suggestion",
          });
        }
      }
    }

    return {
      success: true,
      tool: "addContribution",
      category,
      suggestionsCount: suggestions.length,
      suggestions,
    };
  } catch (error) {
    console.error("Error in addContribution tool:", error);
    return {
      success: false,
      tool: "addContribution",
      error: "Failed to suggest contributions",
    };
  }
}

/**
 * Main function calling orchestrator
 * Sends prompt to Gemini with tool definitions and loops until done
 */
export async function callGeminiWithTools(
  prompt: string,
  eventId: string,
  eventTheme?: string,
): Promise<{
  response: string;
  toolCalls: Array<{ tool: string; args: any; result: any }>;
}> {
  const client = getAIClient();

  if (!client) {
    throw new Error("Gemini AI client not initialized. Check GEMINI_API_KEY.");
  }

  // Get event context for system prompt
  const messages = await getEventMessages(eventId);
  const recentContext = messages
    .slice(-5)
    .map((m) => `${(m as any).userName || "Someone"}: ${m.text}`)
    .join(" | ");

  const systemPrompt = `You are a helpful AI assistant for a Christmas caroling event planning app.
Your role is to help users find carols, understand event context, suggest setlists, and propose contributions.
You have access to tools to search carols (with mood/energy awareness), summarize chat, suggest setlists, and suggest contributions.
Use these tools proactively when they would help answer the user's question.
Current event theme: ${eventTheme || "Christmas"}
Recent event context: ${recentContext || "No recent messages"}`;

  const modelName = await getModelName("flash");
  const model = client.getGenerativeModel({
    model: modelName,
    systemInstruction: systemPrompt,
    tools: [TOOL_DEFINITIONS],
  });

  const toolCalls: Array<{ tool: string; args: any; result: any }> = [];
  let continueLoop = true;
  const chat = model.startChat();

  // Send initial prompt
  const result = await chat.sendMessage(prompt);
  let response = result.response;

  // Function calling loop: process tool calls until model stops
  while (continueLoop) {
    const calls = response.functionCalls();

    if (!calls || calls.length === 0) {
      continueLoop = false;
      break;
    }

    const toolResults = [];

    // Execute each tool call
    for (const call of calls) {
      let toolResult;

      try {
        switch (call.name) {
          case "searchCarols":
            toolResult = await handleSearchCarols(call.args as any);
            break;
          case "summarizeChat":
            toolResult = await handleSummarizeChat(call.args as any);
            break;
          case "suggestSetlist":
            toolResult = await handleSuggestSetlist(call.args as any);
            break;
          case "addContribution":
            toolResult = await handleAddContribution(call.args as any);
            break;
          default:
            toolResult = { error: `Unknown tool: ${call.name}` };
        }
      } catch (error) {
        toolResult = {
          error: `Tool execution failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        };
      }

      toolCalls.push({
        tool: call.name,
        args: call.args,
        result: toolResult,
      });

      toolResults.push({
        functionResponse: {
          name: call.name,
          response: toolResult,
        },
      });
    }

    // Send tool results back to model
    const continuationResult = await chat.sendMessage(toolResults);
    response = continuationResult.response;

    // Check if model wants to call more tools
    const nextCalls = response.functionCalls();
    if (!nextCalls || nextCalls.length === 0) {
      continueLoop = false;
    }
  }

  const text = await response.text();
  return {
    response: text,
    toolCalls,
  };
}

/**
 * Simple text generation (no function calling)
 * For simpler requests that don't need tool execution
 * Uses Gemini 3 Flash Preview for speed
 */
export async function generateText(
  prompt: string,
  systemPrompt?: string,
): Promise<string> {
  const client = getAIClient();

  if (!client) {
    throw new Error("Gemini AI client not initialized. Check GEMINI_API_KEY.");
  }

  const modelName = await getModelName("flash");
  const model = client.getGenerativeModel({
    model: modelName,
    systemInstruction: systemPrompt || "You are a helpful assistant.",
  });

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

/**
 * Complex analysis with extended thinking
 * Uses Gemini 3 Pro's reasoning capabilities (thinking_level parameter)
 * For carol analysis, setlist logic, cultural/harmonic understanding
 *
 * Gemini 3 differs from 2.5: uses dynamic thinking by default
 * Set thinking_level to 'high' for complex reasoning
 */
export async function generateWithReasoning(
  prompt: string,
  systemPrompt?: string,
  _thinkingBudget?: number, // Deprecated for Gemini 3, kept for compatibility
): Promise<{ thinking: string; response: string }> {
  const client = getAIClient();

  if (!client) {
    throw new Error("Gemini AI client not initialized. Check GEMINI_API_KEY.");
  }

  const modelName = await getModelName("pro");
  const model = client.getGenerativeModel({
    model: modelName,
    systemInstruction: systemPrompt || "You are a Christmas carol expert.",
  });

  try {
    // Use Gemini 3 Pro with thinking_level: high for extended reasoning
    // Temperature must be 1.0 for reasoning mode
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        maxOutputTokens: 8000,
        temperature: 1.0, // Required for Gemini 3 reasoning
        thinkingConfig: {
          thinkingLevel: "high", // Gemini 3: use thinking_level not thinkingBudget
        },
      } as any,
    } as any);

    const response = await result.response;
    const text = response.text();

    // Extract thinking from response candidates if available
    const thinkingText =
      response.candidates?.[0]?.content?.parts
        ?.filter((part: any) => part.thought)
        .map((part: any) => part.text)
        .join("\n\n") || "";

    return {
      thinking: thinkingText || "(Deep reasoning applied)",
      response: text,
    };
  } catch (error) {
    console.warn(
      "Extended thinking failed, falling back to standard generation:",
      error,
    );
    // Fallback to regular generation if extended thinking not available
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return {
      thinking: "(Reasoning not available)",
      response: response.text(),
    };
  }
}

/**
 * Generate carol suggestions based on theme
 * Used by suggestSetlist and setlist generation
 */
export async function generateCarolSuggestions(
  theme: string,
  count: number = 5,
): Promise<string[]> {
  try {
    const text = await generateText(
      `Suggest ${count} Christmas carols that would fit a "${theme}" themed caroling event. Respond with just the song titles, one per line, no numbering.`,
      "You are a Christmas carol expert who knows traditional and popular Christmas songs.",
    );

    return text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && !line.match(/^\d+\./)) // Remove numbered lines
      .slice(0, count);
  } catch (error) {
    console.error("Error generating carol suggestions:", error);
    // Fallback to popular classics
    return [
      "Silent Night",
      "Joy to the World",
      "O Come All Ye Faithful",
      "Hark! The Herald Angels Sing",
      "The First Noel",
    ].slice(0, count);
  }
}

/**
 * Generate event recap/summary
 */
export async function generateEventRecap(
  event: any,
  topCarols: any[],
): Promise<string> {
  try {
    const prompt = `
      Create a short, festive, and heartwarming recap for a Christmas caroling event named "${event.name}".
      Theme: ${event.theme}
      Attendees: ${event.members?.length || 0}
      Top Carols Sung: ${topCarols.map((c) => c.title).join(", ")}
      Total Votes: ${topCarols.reduce((acc, c) => acc + (c.votes || 0), 0)}

      The recap should be around 3-4 sentences and mention a "magical moment" based on these details.
      Respond in a warm, enthusiastic tone.
    `;

    return await generateText(
      prompt,
      "You are a creative writer who creates warm, festive event recaps.",
    );
  } catch (error) {
    console.error("Error generating event recap:", error);
    return `What a wonderful session of caroling! ${event.members?.length || 0} singers joined together to celebrate "${event.theme}" through the magic of Christmas carols.`;
  }
}

/**
 * Polish and enhance carol data
 */
export async function polishCarolData(
  title: string,
  artist: string,
  existingLyrics: string[],
): Promise<{ title: string; lyrics: string[] }> {
  try {
    const prompt = `
      You are a Christmas Carol expert. I have a carols database entry that needs polishing.
      Original Title (often a slug): "${title}"
      Artist: "${artist}"
      Current Lyrics Fragment: ${JSON.stringify(existingLyrics)}

      Please:
      1. Provide the canonical, properly capitalized and spaced title (e.g., "jinglebells" -> "Jingle Bells").
      2. Provide the FULL standard lyrics as a JSON array of strings (one line per element).
      3. Clean any HTML artifacts like "&rsquo;" or "&amp;".
      4. Include section markers like "[Chorus]" or "[Verse 1]" as separate lines in the array.

      Respond ONLY with a JSON object in this format:
      {
        "title": "Canonical Title",
        "lyrics": ["Line 1", "Line 2", ...]
      }
    `;

    const text = await generateText(prompt);
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const cleanJson = jsonMatch ? jsonMatch[0] : text;
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error(`Error polishing carol ${title}:`, error);
    return { title, lyrics: existingLyrics };
  }
}

/**
 * Translate carol lyrics to a target language
 * Uses Gemini 3's enhanced multilingual capabilities
 * Maintains rhythm, rhyme, and singability while considering cultural context
 */
export async function translateCarolWithGemini(
  title: string,
  lyrics: string[],
  targetLanguage: string,
  languageName: string,
): Promise<{ title: string; lyrics: string[] }> {
  try {
    const lyricsText = lyrics.join("\n");

    const prompt = `
You are an expert translator and songwriting specialist with deep knowledge of ${languageName} culture, music, and traditions.
Your task is to translate a Christmas carol while maintaining its singability, rhythm, and cultural resonance.

Original Carol Title: "${title}"
Target Language: ${languageName} (${targetLanguage})

Original Lyrics:
${lyricsText}

Translation requirements:
1. Create a natural, culturally appropriate title in ${languageName}
2. Maintain the exact verse/chorus structure
3. Preserve rhythm and rhyme schemes (this is a SONG, not prose)
4. Sound natural when sung aloud
5. Adapt cultural references appropriately for ${languageName} speakers
6. Keep musical pacing - each line should fit the original melody
7. Preserve section markers like [Verse 1], [Chorus], etc.
8. Consider holiday traditions and musical sensibilities in ${languageName} culture

Respond ONLY with valid JSON in this format:
{
  "title": "Translated Title in ${languageName}",
  "lyrics": ["Line 1", "Line 2", ...]
}

Ensure JSON is properly escaped and valid.
    `;

    // Use Gemini 3 Flash Preview for efficient translation with extended thinking fallback for complex cases
    let responseText = "";
    try {
      // Try with reasoning first for complex translations
      const { response } = await generateWithReasoning(
        prompt,
        `You are an expert in ${languageName} language, culture, and music. Focus on preserving singability, rhythm, and cultural authenticity.`,
      );
      responseText = response;
    } catch (error) {
      console.warn(
        "Translation with reasoning failed, using standard generation:",
        error,
      );
      responseText = await generateText(
        prompt,
        `You are an expert translator specializing in Christmas carols and ${languageName} language/culture.`,
      );
    }

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const cleanJson = jsonMatch ? jsonMatch[0] : responseText;
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error(
      `Error translating carol "${title}" to ${languageName}:`,
      error,
    );
    throw new Error(
      `Failed to translate carol: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}
