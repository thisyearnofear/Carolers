import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { generateCarol, validateGenerationParams } from "@/lib/suno";
import { createUserCarol } from "@/lib/user-carols";

export async function POST(request: Request) {
  try {
    // Get user session from Clerk
    const session = await auth();
    const { userId } = session;

    if (!userId) {
      return NextResponse.json(
        {
          error: "Authentication required",
          message: "Please sign in to create carols",
          code: "UNAUTHORIZED",
        },
        { status: 401 },
      );
    }

    const body = await request.json();
    const {
      title,
      lyrics,
      genre,
      style,
      model,
      instrumental = false,
      vocalGender,
      styleWeight,
      weirdnessConstraint,
      negativeTags,
      customMode = true,
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // Validate parameters before sending to API
    const validation = validateGenerationParams({
      title,
      lyrics,
      genre,
      style,
      model,
      instrumental,
      vocalGender,
      styleWeight,
      weirdnessConstraint,
      negativeTags,
      customMode,
    });

    if (!validation.valid) {
      return NextResponse.json(
        {
          error: "Invalid parameters",
          message: "Please check your input and try again.",
          details: validation.errors,
          code: "INVALID_PARAMS",
        },
        { status: 400 },
      );
    }

    // Call Suno API to generate carol with all available parameters
    const taskId = await generateCarol({
      title,
      lyrics,
      genre,
      style,
      model,
      instrumental,
      vocalGender,
      styleWeight,
      weirdnessConstraint,
      negativeTags,
      customMode,
    });

    if (!taskId) {
      return NextResponse.json(
        {
          error: "Carol generation failed",
          message:
            "Could not queue the carol for generation. Please check your Suno API connection and try again.",
          code: "SUNO_QUEUE_FAILED",
        },
        { status: 500 },
      );
    }

    // Store in database with Suno task ID
    const userCarol = await createUserCarol({
      sunoJobId: taskId,
      createdBy: userId,
      title,
      lyrics: lyrics || null,
      genre: genre || null,
      style: style || null,
      status: "processing",
    });

    return NextResponse.json({
      success: true,
      carol: {
        id: userCarol.id,
        sunoJobId: taskId,
        title: userCarol.title,
        status: "processing",
        createdAt: userCarol.createdAt,
      },
    });
  } catch (error: any) {
    // Log full error for debugging
    console.error("Carol generation error:", {
      message: error?.message,
      code: error?.code,
      status: error?.status,
      stack: error?.stack,
    });

    // Map common errors to user-friendly messages
    if (error?.message?.includes("Clerk")) {
      return NextResponse.json(
        {
          error: "Authentication setup error",
          message:
            "There is a configuration issue with authentication. Please try again or contact support.",
          code: "CLERK_CONFIG_ERROR",
        },
        { status: 500 },
      );
    }

    // Check for specific Suno API errors
    if (error?.message?.includes("Invalid Suno API key")) {
      return NextResponse.json(
        {
          error: "Authentication failed",
          message: "Invalid API key. Please check your Suno API configuration.",
          code: "INVALID_API_KEY",
        },
        { status: 401 },
      );
    }

    if (error?.message?.includes("Rate limit exceeded")) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          message: "Too many requests. Please wait a moment and try again.",
          code: "RATE_LIMIT",
        },
        { status: 429 },
      );
    }

    if (error?.message?.includes("Insufficient credits")) {
      return NextResponse.json(
        {
          error: "Insufficient credits",
          message:
            "Your Suno account has insufficient credits. Please add more credits to continue.",
          code: "INSUFFICIENT_CREDITS",
        },
        { status: 402 },
      );
    }

    if (error?.message?.includes("maintenance")) {
      return NextResponse.json(
        {
          error: "Service maintenance",
          message:
            "Suno AI is currently under maintenance. Please try again later.",
          code: "MAINTENANCE",
        },
        { status: 503 },
      );
    }

    if (error?.message?.includes("SUNO") || error?.message?.includes("API")) {
      return NextResponse.json(
        {
          error: "Suno API error",
          message: "Unable to reach the Suno AI service. Please try again.",
          code: "SUNO_API_ERROR",
        },
        { status: 503 },
      );
    }

    if (
      error?.message?.includes("database") ||
      error?.message?.includes("Database")
    ) {
      return NextResponse.json(
        {
          error: "Database error",
          message: "Failed to save the carol. Please try again.",
          code: "DATABASE_ERROR",
        },
        { status: 500 },
      );
    }

    // Generic error
    return NextResponse.json(
      {
        error: "Carol generation failed",
        message:
          error?.message || "An unexpected error occurred. Please try again.",
        code: "UNKNOWN_ERROR",
      },
      { status: 500 },
    );
  }
}
