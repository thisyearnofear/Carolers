import 'server-only';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getEventMessages } from './messages';
import { searchCarols } from './carols';

// Initialize Gemini AI client
let aiClient: GoogleGenerativeAI | null = null;

function getAIClient() {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return aiClient;
}

// AI Tools definitions
type AITool = {
  name: string;
  description: string;
  parameters: any;
};

export const AI_TOOLS: Record<string, AITool> = {
  searchCarols: {
    name: 'searchCarols',
    description: 'Search for Christmas carols by title or artist',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query for carol title or artist'
        }
      },
      required: ['query']
    }
  },
  summarizeChat: {
    name: 'summarizeChat',
    description: 'Summarize recent chat messages from an event',
    parameters: {
      type: 'object',
      properties: {
        eventId: {
          type: 'string',
          description: 'ID of the event to summarize'
        },
        messageCount: {
          type: 'number',
          description: 'Number of recent messages to include in summary'
        }
      },
      required: ['eventId']
    }
  },
  suggestSetlist: {
    name: 'suggestSetlist',
    description: 'Suggest a setlist of Christmas carols for an event',
    parameters: {
      type: 'object',
      properties: {
        theme: {
          type: 'string',
          description: 'Theme or style of the event'
        },
        duration: {
          type: 'string',
          description: 'Approximate duration of the event'
        }
      }
    }
  },
  addContribution: {
    name: 'addContribution',
    description: 'Add an item to the event contribution list',
    parameters: {
      type: 'object',
      properties: {
        item: {
          type: 'string',
          description: 'Item to contribute (e.g., "Snacks", "Sheet music")'
        },
        category: {
          type: 'string',
          description: 'Category of contribution (e.g., "Food", "Equipment")'
        }
      },
      required: ['item']
    }
  }
};

export async function callGeminiAI(
  prompt: string,
  eventId: string,
  tool?: keyof typeof AI_TOOLS,
  eventTheme?: string
): Promise<{
  response: string;
  toolUsed?: string;
  payload?: any;
}> {
  try {
    const client = getAIClient();
    
    if (!client) {
      throw new Error('Gemini AI client not initialized. Please check GEMINI_API_KEY.');
    }
    
    // Get event context
    const messages = await getEventMessages(eventId);
    const recentMessages = messages.slice(-10); // Last 10 messages for context
    
    // Prepare system prompt with context
    let systemPrompt = `You are a helpful AI assistant for a Christmas caroling event app. `;
    
    if (tool) {
      systemPrompt += `You are using the ${tool} tool. `;
    }
    
    systemPrompt += `Current event context: ${recentMessages.map(m => `${(m as any).userName || 'Someone'}: ${m.text}`).join(' | ')}`;
    
    // Use the appropriate model
    // Note: For now, we'll use the text model since function calling
    // requires specific tool definitions that may differ from our AI_TOOLS
    const model = client.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: systemPrompt
    });
    
    // Start a chat session
    const chat = model.startChat();
    
    // Send the prompt
    const result = await chat.sendMessage(prompt);
    
    // Process the response
    const response = await result.response;
    const text = await response.text();
    
    // Handle tool function calls if any
    let toolUsed: string | undefined;
    let payload: any | undefined;
    
    // Check if there are function calls in the response
    const functionCalls = result.response.functionCalls();
    
    if (functionCalls) {
      for (const call of functionCalls) {
        if (call.name in AI_TOOLS) {
          toolUsed = call.name;
          
          // For now, we'll use a simpler approach since function calling
          // requires more complex setup. We'll parse the text response
          // to determine if a tool was used.
          
          // Check if the response mentions specific tools
          if (call.name === 'searchCarols' && prompt.includes('search')) {
            const carols = await searchCarols(prompt, 5);
            payload = { tool: 'searchCarols', results: carols };
          } else if (call.name === 'summarizeChat') {
            const recent = messages.slice(-5);
            payload = { 
              tool: 'summarizeChat',
              summary: recent.map(m => `${(m as any).userName || 'Someone'}: ${m.text}`).join('\n'),
              messageCount: recent.length
            };
          } else if (call.name === 'suggestSetlist') {
            const setlist = await generateCarolSuggestions(eventTheme || 'Christmas', 5);
            payload = { tool: 'suggestSetlist', setlist };
          }
        }
      }
    }
    
    return { response: text, toolUsed, payload };
    
  } catch (error) {
    console.error('Error calling Gemini AI:', error);
    
    // Fallback to mock response if AI fails
    return {
      response: `I'm currently unable to process your request: "${prompt}". This is a fallback response. Please try again later.`,
      toolUsed: tool
    };
  }
}

export async function generateCarolSuggestions(
  theme: string,
  count: number = 5
): Promise<string[]> {
  try {
    const client = getAIClient();
    
    if (!client) {
      return [
        'O Come All Ye Faithful',
        'Hark! The Herald Angels Sing',
        'The First Noel',
        'Away in a Manger',
        'Joy to the World'
      ];
    }
    
    const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `Suggest ${count} Christmas carols that would fit a "${theme}" themed caroling event. Respond with just the song titles, one per line.`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();
    
    return text.split('\n').filter(line => line.trim()).slice(0, count);
    
  } catch (error) {
    console.error('Error generating carol suggestions:', error);
    return [
      'O Come All Ye Faithful',
      'Hark! The Herald Angels Sing',
      'The First Noel',
      'Away in a Manger',
      'Joy to the World'
    ];
  }
}