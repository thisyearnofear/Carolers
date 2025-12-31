import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { generateCarol } from '@/lib/suno';
import { createUserCarol } from '@/lib/user-carols';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
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
        { error: 'Failed to queue carol generation' },
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
    console.error('Carol generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate carol' },
      { status: 500 }
    );
  }
}
