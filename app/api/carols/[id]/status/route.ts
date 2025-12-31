import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserCarol, updateUserCarolStatus } from '@/lib/user-carols';
import { getCompletedCarol, getCarolStatus } from '@/lib/suno';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Get carol from database
    const carol = await getUserCarol(id);
    if (!carol) {
      return NextResponse.json(
        { error: 'Carol not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (carol.createdBy !== userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // If already complete, return cached result
    if (carol.status === 'complete') {
      return NextResponse.json({
        success: true,
        carol: {
          id: carol.id,
          title: carol.title,
          status: 'complete',
          audioUrl: carol.audioUrl,
          videoUrl: carol.videoUrl,
          imageUrl: carol.imageUrl,
          completedAt: carol.completedAt,
        },
      });
    }

    // If error, return it
    if (carol.status === 'error') {
      return NextResponse.json({
        success: false,
        carol: {
          id: carol.id,
          title: carol.title,
          status: 'error',
          error: carol.errorMessage,
        },
      });
    }

    // Poll Suno API for current status
    try {
      const sunoStatus = await getCarolStatus(carol.sunoJobId);
      if (!sunoStatus || sunoStatus.length === 0) {
        return NextResponse.json({
          success: true,
          carol: {
            id: carol.id,
            title: carol.title,
            status: 'processing',
          },
        });
      }

      const clip = sunoStatus[0];

      // If complete, fetch full details and update database
      if (clip.status === 'complete') {
        const completed = await getCompletedCarol(carol.sunoJobId);
        
        await updateUserCarolStatus(carol.id, 'complete', {
          audioUrl: completed.audioUrl,
          videoUrl: completed.videoUrl,
          imageUrl: completed.imageUrl,
        });

        return NextResponse.json({
          success: true,
          carol: {
            id: carol.id,
            title: carol.title,
            status: 'complete',
            audioUrl: completed.audioUrl,
            videoUrl: completed.videoUrl,
            imageUrl: completed.imageUrl,
          },
        });
      }

      // If error, update and return
      if (clip.status === 'error') {
        await updateUserCarolStatus(carol.id, 'error', {
          errorMessage: clip.error_message || 'Generation failed',
        });

        return NextResponse.json({
          success: false,
          carol: {
            id: carol.id,
            title: carol.title,
            status: 'error',
            error: clip.error_message || 'Generation failed',
          },
        });
      }

      // Still processing
      return NextResponse.json({
        success: true,
        carol: {
          id: carol.id,
          title: carol.title,
          status: 'processing',
        },
      });
    } catch (sunoError: any) {
      console.error('Suno status check error:', sunoError);
      
      // Mark as error if we can't check status
      if (sunoError.message?.includes('still generating')) {
        return NextResponse.json({
          success: true,
          carol: {
            id: carol.id,
            title: carol.title,
            status: 'processing',
          },
        });
      }

      await updateUserCarolStatus(carol.id, 'error', {
        errorMessage: sunoError.message || 'Status check failed',
      });

      return NextResponse.json({
        success: false,
        carol: {
          id: carol.id,
          title: carol.title,
          status: 'error',
          error: sunoError.message || 'Status check failed',
        },
      });
    }
  } catch (error: any) {
    console.error('Status check error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check carol status' },
      { status: 500 }
    );
  }
}
