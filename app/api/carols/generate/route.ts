import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { generateCarol } from '@/lib/suno';
import { createUserCarol } from '@/lib/user-carols';

export async function POST(request: Request) {
  try {
    // Get user session from Clerk
    const session = await auth();
    const { userId } = session;
    
    if (!userId) {
      return NextResponse.json(
        { 
          error: 'Authentication required',
          message: 'Please sign in to create carols',
          code: 'UNAUTHORIZED'
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, lyrics, genre = 'Christmas', style = 'Traditional' } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    // Call Suno API to generate carol
    const clips = await generateCarol({
      title,
      lyrics,
      genre,
      style,
    });

    if (!clips || clips.length === 0) {
      return NextResponse.json(
        { 
          error: 'Carol generation failed',
          message: 'Could not queue the carol for generation. Please check your Suno API connection and try again.',
          code: 'SUNO_QUEUE_FAILED'
        },
        { status: 500 }
      );
    }

    // Track first clip (Suno returns array but we generate one)
    const clip = clips[0];

    // Store in database with Suno job ID
    const userCarol = await createUserCarol({
      sunoJobId: clip.id,
      createdBy: userId,
      title,
      lyrics: lyrics || null,
      genre,
      style,
      status: 'processing',
    });

    return NextResponse.json({
      success: true,
      carol: {
        id: userCarol.id,
        sunoJobId: clip.id,
        title: userCarol.title,
        status: 'processing',
        createdAt: userCarol.createdAt,
      },
    });
  } catch (error: any) {
    // Log full error for debugging
    console.error('Carol generation error:', {
      message: error?.message,
      code: error?.code,
      status: error?.status,
      stack: error?.stack,
    });

    // Map common errors to user-friendly messages
    if (error?.message?.includes('Clerk')) {
      return NextResponse.json(
        {
          error: 'Authentication setup error',
          message: 'There is a configuration issue with authentication. Please try again or contact support.',
          code: 'CLERK_CONFIG_ERROR'
        },
        { status: 500 }
      );
    }

    if (error?.message?.includes('SUNO') || error?.message?.includes('API')) {
      return NextResponse.json(
        {
          error: 'Suno API error',
          message: 'Unable to reach the Suno AI service. Please check your API key and try again.',
          code: 'SUNO_API_ERROR'
        },
        { status: 503 }
      );
    }

    if (error?.message?.includes('database') || error?.message?.includes('Database')) {
      return NextResponse.json(
        {
          error: 'Database error',
          message: 'Failed to save the carol. Please try again.',
          code: 'DATABASE_ERROR'
        },
        { status: 500 }
      );
    }

    // Generic error
    return NextResponse.json(
      {
        error: 'Carol generation failed',
        message: error?.message || 'An unexpected error occurred. Please try again.',
        code: 'UNKNOWN_ERROR'
      },
      { status: 500 }
    );
  }
}
