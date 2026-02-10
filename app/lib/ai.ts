import "server-only";
import {
  GoogleGenerativeAI,
  SchemaType,
  type FunctionDeclarationsTool,
} from "@google/generative-ai";
import { getEventMessages } from "./messages";
import { getCarols, type CarolFilters } from "./carols";

// Initialize Gemini AI client
function getGeminiClient(userKey?: string) {
  const apiKey = userKey || (process.env as any).GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenerativeAI(apiKey);
}

/**
 * AI Provider Configuration
 */
export type AIProvider = 'gemini' | 'venice';

export interface RequestOptions {
  provider?: AIProvider;
  userKey?: string;
  useGemini3?: boolean;
}

/**
 * Model Configuration
 */
const MODEL_GEMINI3_PRO = "gemini-3-pro-preview";
const MODEL_GEMINI3_FLASH = "gemini-3-flash-preview";
const MODEL_GEMINI_2_5_PRO = "gemini-2.5-pro";
const MODEL_GEMINI_2_5_FLASH = "gemini-2.5-flash";
const MODEL_GEMINI_1_5_PRO = "gemini-1.5-pro";
const MODEL_GEMINI_1_5_FLASH = "gemini-1.5-flash";

async function getModelName(variant: "pro" | "flash" = "flash", useGemini3: boolean = false): Promise<string> {
  if (useGemini3) {
    return variant === "pro" ? MODEL_GEMINI3_PRO : MODEL_GEMINI3_FLASH;
  }
  // Use Gemini 2.5 as default for better performance
  return variant === "pro" ? MODEL_GEMINI_2_5_PRO : MODEL_GEMINI_2_5_FLASH;
}

/**
 * Retry wrapper for async operations
 */
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | undefined;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Don't retry on certain errors
      if (lastError.message.includes('API key') || 
          lastError.message.includes('authentication') ||
          lastError.message.includes('unauthorized')) {
        throw lastError;
      }
      
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delayMs * Math.pow(2, attempt)));
      }
    }
  }
  
  throw lastError || new Error('Operation failed after retries');
}

/**
 * Complex analysis with extended thinking
 */
export async function generateWithReasoning(
  prompt: string,
  systemPrompt?: string,
  options: RequestOptions = {}
): Promise<{ thinking: string; response: string; modelUsed?: string; providerUsed?: string }> {
  // Handle Venice AI
  if (options.provider === 'venice') {
    return withRetry(() => handleVeniceReasoning(prompt, systemPrompt, options.userKey));
  }

  const client = getGeminiClient(options.userKey);
  if (!client) {
    throw new Error("AI Key missing. Please provide a key in settings to unlock deep reasoning.");
  }

  const modelName = await getModelName("pro", options.useGemini3);
  
  return withRetry(async () => {
    const model = client.getGenerativeModel({
      model: modelName,
      systemInstruction: systemPrompt || "You are a Christmas carol expert.",
    });

    const generationConfig: any = {
      maxOutputTokens: 8000,
      temperature: 1.0,
    };

    // Add thinkingConfig for Gemini 3 and 2.5 models that support it
    if (options.useGemini3 || modelName.includes('2.5')) {
      generationConfig.thinkingConfig = {
        thinkingBudget: 24576, // Use token budget instead of deprecated includeThoughts
      };
    }

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig,
    });

    const response = await result.response;
    
    // Extract thinking from response candidates
    let thinkingText = "";
    const parts = response.candidates?.[0]?.content?.parts;
    if (parts && Array.isArray(parts)) {
      for (const part of parts) {
        // Check for thinking content in various formats
        if ((part as any).thought === true || (part as any).role === 'thought') {
          thinkingText += ((part as any).text || "") + "\n\n";
        }
      }
    }

    return {
      thinking: thinkingText.trim() || (options.useGemini3 ? "(Deep reasoning applied)" : "(Reasoning applied)"),
      response: response.text(),
      modelUsed: modelName,
      providerUsed: 'gemini'
    };
  }, 3).catch(async (error) => {
    console.warn(`Reasoning failed for ${modelName}, falling back:`, error);
    
    // Safety fallback: use a standard flash model
    try {
      const fallbackModelName = MODEL_GEMINI_1_5_FLASH;
      const fallbackModel = client.getGenerativeModel({ 
        model: fallbackModelName,
        systemInstruction: systemPrompt || "You are a Christmas carol expert."
      });
      
      const result = await fallbackModel.generateContent(prompt);
      const response = await result.response;
      
      return {
        thinking: "(Extended reasoning unavailable - using fallback)",
        response: response.text(),
        modelUsed: fallbackModelName,
        providerUsed: 'gemini'
      };
    } catch (fallbackError) {
      console.error("Critical AI failure: Fallback also failed:", fallbackError);
      const errorMessage = error instanceof Error ? error.message : "Unknown AI error";
      const fallbackMessage = fallbackError instanceof Error ? fallbackError.message : "Unknown fallback error";
      throw new Error(`AI Failure: ${errorMessage} (Fallback: ${fallbackMessage})`);
    }
  });
}

/**
 * Venice AI Implementation (OpenAI Compatible)
 */
async function handleVeniceReasoning(
  prompt: string, 
  systemPrompt?: string, 
  userKey?: string
): Promise<{ thinking: string; response: string; modelUsed: string; providerUsed: string }> {
  const apiKey = userKey || (process.env as any).VENICE_API_KEY;
  if (!apiKey) {
    throw new Error("Venice AI Key missing. Please provide a key in settings.");
  }

  const response = await fetch("https://api.venice.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-instruct",
      messages: [
        { role: "system", content: systemPrompt || "You are a Christmas carol expert." },
        { role: "user", content: prompt }
      ],
      max_tokens: 8000,
      temperature: 1.0,
      // Enable reasoning for Venice AI
      reasoning: {
        effort: "high"
      },
      venice_parameters: {
        include_venice_system_prompt: false
      }
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Venice AI API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  
  if (!data.choices || !data.choices[0] || !data.choices[0].message) {
    throw new Error("Invalid response format from Venice AI");
  }

  // Extract reasoning content if available
  const reasoningContent = data.choices[0].message.reasoning_content || 
                          data.choices[0].message.reasoning || "";

  return {
    thinking: reasoningContent || "(Venice AI reasoning applied)",
    response: data.choices[0].message.content,
    modelUsed: data.model || "llama-3.3-70b-instruct",
    providerUsed: 'venice'
  };
}

/**
 * Tool definitions for Gemini function calling
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
 * Tool definitions for Venice AI (OpenAI format)
 */
const VENICE_TOOL_DEFINITIONS = [
  {
    type: "function" as const,
    function: {
      name: "searchCarols",
      description: 'Search for Christmas carols by title, artist, mood, or energy level. Use mood terms like "upbeat", "relaxing", "traditional", or "religious". Energy levels: "high" or "low".',
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Search query for carol title, artist, or keyword",
          },
          mood: {
            type: "string",
            description: 'Mood filter: "upbeat", "relaxing", "traditional", or "religious"',
          },
          energy: {
            type: "string",
            description: 'Energy level filter: "high" or "low"',
          },
          limit: {
            type: "number",
            description: "Maximum number of results to return (default: 5)",
          },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "summarizeChat",
      description: "Summarize recent chat messages from an event to understand context and discussion",
      parameters: {
        type: "object",
        properties: {
          eventId: {
            type: "string",
            description: "ID of the event to summarize",
          },
          messageCount: {
            type: "number",
            description: "Number of recent messages to include (default: 10)",
          },
        },
        required: ["eventId"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "suggestSetlist",
      description: "Suggest a setlist of Christmas carols based on event theme and duration",
      parameters: {
        type: "object",
        properties: {
          theme: {
            type: "string",
            description: "Theme or style of the event",
          },
          duration: {
            type: "string",
            description: 'Approximate duration of the event (e.g., "30 minutes", "1 hour")',
          },
          count: {
            type: "number",
            description: "Number of songs to suggest (default: 5)",
          },
        },
        required: ["theme"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "addContribution",
      description: "Suggest contribution ideas for the event based on what is being discussed",
      parameters: {
        type: "object",
        properties: {
          category: {
            type: "string",
            description: 'Category of contribution: "Food", "Equipment", "Music", or "Other"',
          },
          context: {
            type: "string",
            description: "Context for the suggestion",
          },
        },
      },
    },
  },
];

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
    const participants = Array.from(
      new Set(recent.map((m) => (m as any).userName || "Someone"))
    );
    const messageTexts = recent.map((m) => m.text).join(" ");

    // Extract potential topics/keywords
    const keywords =
      messageTexts
        .toLowerCase()
        .match(
          /\b(carol|song|sing|music|perform|duration|venue|date|time|theme)\b/g,
        ) || [];
    const topics = Array.from(new Set(keywords));

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
 * Execute a tool call
 */
async function executeToolCall(name: string, args: any): Promise<any> {
  switch (name) {
    case "searchCarols":
      return await handleSearchCarols(args);
    case "summarizeChat":
      return await handleSummarizeChat(args);
    case "suggestSetlist":
      return await handleSuggestSetlist(args);
    case "addContribution":
      return await handleAddContribution(args);
    default:
      return { error: `Unknown tool: ${name}` };
  }
}

/**
 * Venice AI with tool calling support
 */
async function callVeniceWithTools(
  prompt: string,
  eventId: string,
  eventTheme?: string,
  userKey?: string
): Promise<{
  response: string;
  toolCalls: Array<{ tool: string; args: any; result: any }>;
}> {
  const apiKey = userKey || (process.env as any).VENICE_API_KEY;
  if (!apiKey) {
    throw new Error("Venice AI Key missing. Please provide a key in settings.");
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

  const toolCalls: Array<{ tool: string; args: any; result: any }> = [];
  const conversationMessages: any[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: prompt }
  ];

  // Tool calling loop (max 5 iterations to prevent infinite loops)
  for (let iteration = 0; iteration < 5; iteration++) {
    const response = await fetch("https://api.venice.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-instruct",
        messages: conversationMessages,
        tools: VENICE_TOOL_DEFINITIONS,
        tool_choice: "auto",
        max_tokens: 4000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`Venice AI API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error("Invalid response format from Venice AI");
    }

    const message = data.choices[0].message;

    // Check if there are tool calls
    if (message.tool_calls && message.tool_calls.length > 0) {
      // Add assistant message with tool calls
      conversationMessages.push({
        role: "assistant",
        content: message.content || null,
        tool_calls: message.tool_calls
      });

      // Execute each tool call
      for (const toolCall of message.tool_calls) {
        if (toolCall.type === "function") {
          const { name, arguments: argsString } = toolCall.function;
          let args;
          try {
            args = JSON.parse(argsString);
          } catch {
            args = {};
          }

          const result = await executeToolCall(name, args);
          toolCalls.push({
            tool: name,
            args,
            result,
          });

          // Add tool response to conversation
          conversationMessages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: JSON.stringify(result)
          });
        }
      }
    } else {
      // No tool calls, return the response
      return {
        response: message.content || "I apologize, but I couldn't generate a response.",
        toolCalls,
      };
    }
  }

  // Max iterations reached
  return {
    response: "I've performed several tool operations for you. Is there anything specific you'd like me to help with?",
    toolCalls,
  };
}

/**
 * Main function calling orchestrator - supports both Gemini and Venice
 */
export async function callGeminiWithTools(
  prompt: string,
  eventId: string,
  eventTheme?: string,
  options: RequestOptions = {}
): Promise<{
  response: string;
  toolCalls: Array<{ tool: string; args: any; result: any }>;
}> {
  // Route to Venice AI if selected
  if (options.provider === 'venice') {
    return withRetry(() => callVeniceWithTools(prompt, eventId, eventTheme, options.userKey), 3);
  }

  const client = getGeminiClient(options.userKey);

  if (!client) {
    throw new Error("Gemini AI client not initialized. Check AI settings.");
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

  const modelName = await getModelName("flash", options.useGemini3);
  
  return withRetry(async () => {
    const model = client.getGenerativeModel({
      model: modelName,
      systemInstruction: systemPrompt,
      tools: [TOOL_DEFINITIONS],
    });

    const toolCalls: Array<{ tool: string; args: any; result: any }> = [];
    const chat = model.startChat();

    // Send initial prompt
    const result = await chat.sendMessage(prompt);
    let response = result.response;

    // Function calling loop (max 5 iterations to prevent infinite loops)
    for (let iteration = 0; iteration < 5; iteration++) {
      const calls = response.functionCalls();

      if (!calls || calls.length === 0) {
        break;
      }

      const toolResults = [];

      // Execute each tool call
      for (const call of calls) {
        const toolResult = await executeToolCall(call.name, call.args);

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
    }

    const text = await response.text();
    return {
      response: text,
      toolCalls,
    };
  }, 3);
}

/**
 * Simple text generation - supports both providers
 */
export async function generateText(
  prompt: string,
  systemPrompt?: string,
  options: RequestOptions = {}
): Promise<string> {
  // Handle Venice AI
  if (options.provider === 'venice') {
    const result = await withRetry(() => handleVeniceReasoning(prompt, systemPrompt, options.userKey), 3);
    return result.response;
  }

  const client = getGeminiClient(options.userKey);
  if (!client) return "AI Key missing. Please provide a key in settings.";

  const modelName = await getModelName("flash", options.useGemini3);
  
  return withRetry(async () => {
    const model = client.getGenerativeModel({
      model: modelName,
      systemInstruction: systemPrompt || "You are a helpful assistant.",
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }, 3);
}

/**
 * Generate carol suggestions based on theme
 */
export async function generateCarolSuggestions(
  theme: string,
  count: number = 5,
  options: RequestOptions = {}
): Promise<string[]> {
  try {
    const text = await generateText(
      `Suggest ${count} Christmas carols that would fit a "${theme}" themed caroling event. Respond with just the song titles, one per line, no numbering.`,
      "You are a Christmas carol expert who knows traditional and popular Christmas songs.",
      options
    );

    return text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && !line.match(/^\d+\./)) 
      .slice(0, count);
  } catch (error) {
    console.error("Error generating carol suggestions:", error);
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
 * Generate event recap
 */
export async function generateEventRecap(
  event: any,
  topCarols: any[],
  options: RequestOptions = {}
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
      options
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
  options: RequestOptions = {}
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

    const text = await generateText(prompt, undefined, options);
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const cleanJson = jsonMatch ? jsonMatch[0] : text;
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error(`Error polishing carol ${title}:`, error);
    return { title, lyrics: existingLyrics };
  }
}

/**
 * Translate carol lyrics
 */
export async function translateCarolWithGemini(
  title: string,
  lyrics: string[],
  targetLanguage: string,
  languageName: string,
  options: RequestOptions = {}
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
3. Preserve rhythm and rhyme schemes
4. Sound natural when sung aloud
5. Adapt cultural references appropriately
6. Keep musical pacing
7. Preserve section markers
8. Consider holiday traditions

Respond ONLY with valid JSON in this format:
{
  "title": "Translated Title",
  "lyrics": ["Line 1", "Line 2", ...]
}
    `;

    let responseText = "";
    try {
      const { response } = await generateWithReasoning(
        prompt,
        `You are an expert in ${languageName} language, culture, and music.`,
        options
      );
      responseText = response;
    } catch (error) {
      responseText = await generateText(prompt, undefined, options);
    }

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const cleanJson = jsonMatch ? jsonMatch[0] : responseText;
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error(`Error translating carol "${title}":`, error);
    throw new Error(`Failed to translate carol.`);
  }
}
