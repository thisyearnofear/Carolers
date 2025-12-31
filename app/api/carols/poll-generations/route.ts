import { NextResponse } from 'next/server';
import { getUserCarolsProcessing, updateUserCarolStatus } from '@/lib/user-carols';
import { getCarolStatus, getCompletedCarol } from '@/lib/suno';

/**
 * Background job to poll for pending carol generations
 * Should be called periodically (e.g., every 5 minutes via a cron service)
 */
export async function POST(request: Request) {
  try {
    // Verify this is a cron request (you should implement proper verification)
    const authHeader = request.headers.get('authorization');
    const expectedSecret = process.env.CRON_SECRET;
    
    if (!expectedSecret || authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all carols that are still processing
    const processingCarols = await getUserCarolsProcessing();
    
    if (processingCarols.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No carols to check',
        checked: 0,
        completed: 0,
        errors: 0,
      });
    }

    let completed = 0;
    let errors = 0;
    const failedChecks: string[] = [];

    // Poll each carol
    for (const carol of processingCarols) {
      try {
        const sunoStatus = await getCarolStatus(carol.sunoJobId);
        if (!sunoStatus || sunoStatus.length === 0) {
          continue;
        }

        const clip = sunoStatus[0];

        if (clip.status === 'complete') {
          // Fetch full details
          const completed_carol = await getCompletedCarol(carol.sunoJobId);
          
          // Update database
          await updateUserCarolStatus(carol.id, 'complete', {
            audioUrl: completed_carol.audioUrl,
            videoUrl: completed_carol.videoUrl,
            imageUrl: completed_carol.imageUrl,
          });
          
          completed++;
        } else if (clip.status === 'error') {
          // Mark as error
          await updateUserCarolStatus(carol.id, 'error', {
            errorMessage: clip.error_message || 'Generation failed',
          });
          
          errors++;
        }
      } catch (err: any) {
        console.error(`Failed to check carol ${carol.id}:`, err);
        failedChecks.push(carol.id);
        errors++;
      }
    }

    return NextResponse.json({
      success: true,
      checked: processingCarols.length,
      completed,
      errors,
      failedChecks: failedChecks.length > 0 ? failedChecks : undefined,
    });
  } catch (error: any) {
    console.error('Polling error:', error);
    return NextResponse.json(
      { error: error.message || 'Polling failed' },
      { status: 500 }
    );
  }
}
