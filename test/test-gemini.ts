/**
 * Test script for Gemini API integration
 * Tests both gemini-3-flash-preview and gemini-3-pro-preview models
 *
 * Usage: npx tsx test/test-gemini.ts
 */

import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const MODELS_TO_TEST = [
  "gemini-3-flash-preview",
  "gemini-3-pro-preview",
  "gemini-2.0-flash", // Fallback option
  "gemini-1.5-flash", // Another fallback
];

async function testModel(modelName: string, apiKey: string): Promise<boolean> {
  console.log(`\n🧪 Testing model: ${modelName}`);
  console.log("─".repeat(50));

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });

    const prompt =
      'What is the title of the Christmas carol that starts with "Silent night"? Reply with just the title.';

    console.log(`📝 Prompt: "${prompt}"`);
    console.log(`⏳ Generating response...`);

    const startTime = Date.now();
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const elapsed = Date.now() - startTime;

    console.log(`✅ Success! Response received in ${elapsed}ms`);
    console.log(`📖 Response: ${text.trim()}`);

    // Test with function calling capabilities
    if (modelName.includes("3")) {
      console.log(`\n🔧 Testing function calling capabilities...`);
      const modelWithTools = genAI.getGenerativeModel({
        model: modelName,
        tools: [
          {
            functionDeclarations: [
              {
                name: "searchCarols",
                description: "Search for Christmas carols",
                parameters: {
                  type: SchemaType.OBJECT,
                  properties: {
                    query: {
                      type: SchemaType.STRING,
                      description: "Search query",
                    },
                  },
                  required: ["query"],
                },
              },
            ],
          },
        ],
      });

      const toolResult = await modelWithTools.generateContent(
        "Find me carols about snow",
      );
      const toolResponse = await toolResult.response;
      const functionCalls = toolResponse.functionCalls();

      if (functionCalls && functionCalls.length > 0) {
        console.log(
          `✅ Function calling works! Called: ${functionCalls[0].name}`,
        );
        console.log(`   Args: ${JSON.stringify(functionCalls[0].args)}`);
      } else {
        console.log(
          `ℹ️  No function calls generated (model may have answered directly)`,
        );
      }
    }

    return true;
  } catch (error: any) {
    console.error(`❌ Error testing ${modelName}:`);
    if (error.status === 404) {
      console.error(`   Model not found: ${error.message}`);
    } else if (error.status === 403) {
      console.error(`   Permission denied. Check API key permissions.`);
    } else if (error.status === 429) {
      console.error(`   Rate limit exceeded. Please wait and try again.`);
    } else {
      console.error(`   ${error.message}`);
    }
    return false;
  }
}

async function testAllModels() {
  console.log("🎄 Gemini API Integration Test");
  console.log("═".repeat(50));

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === "your-gemini-api-key-here") {
    console.error("❌ GEMINI_API_KEY not set or invalid in .env.local");
    console.log("\nPlease set your API key:");
    console.log("1. Get an API key from: https://aistudio.google.com/apikey");
    console.log("2. Add it to .env.local:");
    console.log("   GEMINI_API_KEY=your-actual-api-key-here");
    process.exit(1);
  }

  console.log(
    `✅ API Key found: ${apiKey.substring(0, 6)}...${apiKey.substring(apiKey.length - 4)}`,
  );

  const results: Record<string, boolean> = {};

  for (const modelName of MODELS_TO_TEST) {
    results[modelName] = await testModel(modelName, apiKey);

    // Small delay between tests to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log("\n" + "═".repeat(50));
  console.log("📊 Test Results Summary:");
  console.log("─".repeat(50));

  let successCount = 0;
  for (const [model, success] of Object.entries(results)) {
    console.log(
      `${success ? "✅" : "❌"} ${model}: ${success ? "Working" : "Failed"}`,
    );
    if (success) successCount++;
  }

  console.log("─".repeat(50));
  console.log(`Total: ${successCount}/${MODELS_TO_TEST.length} models working`);

  if (successCount === 0) {
    console.error("\n⚠️  No models are working!");
    console.log("\nTroubleshooting steps:");
    console.log("1. Verify your API key is valid");
    console.log(
      "2. Check if you have access to these models in Google AI Studio",
    );
    console.log("3. Ensure your API key has the necessary permissions");
    console.log("4. Check the Google AI status page for any outages");
    process.exit(1);
  } else if (
    results["gemini-3-flash-preview"] ||
    results["gemini-3-pro-preview"]
  ) {
    console.log("\n🎉 Gemini 3 models are working correctly!");
  } else {
    console.log(
      "\n⚠️  Gemini 3 models are not available, but fallback models work.",
    );
    console.log("The app should still function with the available models.");
  }
}

// Run the tests
testAllModels().catch((error) => {
  console.error("Unexpected error:", error);
  process.exit(1);
});
