import { NextResponse } from "next/server";
import {
  getUserCarolsProcessing,
  updateUserCarolStatus,
} from "@/lib/user-carols";
import { getCarolStatus, getCompletedCarol } from "@/lib/suno";
import {
  RATE_LIMITS,
  POLLING_CONFIG,
  rateLimiter,
  getPollingInterval,
} from "@/lib/suno-optimization";

/**
 * Background job to poll for pending carol generations
 * Should be called periodically (e.g., every 30 seconds via a cron service)
 * Implements smart polling with rate limiting and batch optimization
 */
export async function POST(request: Request) {
  try {
    // Verify this is a cron request
    const authHeader = request.headers.get("authorization");
    const expectedSecret = process.env.CRON_SECRET;

    if (!expectedSecret || authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all carols that are still processing
    const processingCarols = await getUserCarolsProcessing();

    if (processingCarols.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No carols to check",
        checked: 0,
        completed: 0,
        errors: 0,
      });
    }

    // Sort carols by creation time to prioritize older ones
    const sortedCarols = processingCarols.sort(
      (a, b) => (a.createdAt?.getTime() ?? 0) - (b.createdAt?.getTime() ?? 0),
    );

    // Determine how many we can check based on rate limits
    const maxChecks = Math.min(
      sortedCarols.length,
      RATE_LIMITS.safeMaxRequestsPerWindow,
    );

    let checked = 0;
    let completed = 0;
    let errors = 0;
    let skipped = 0;
    const results: any[] = [];

    // Process carols in batches respecting rate limits
    for (let i = 0; i < maxChecks; i++) {
      const carol = sortedCarols[i];

      // Check if carol has been processing too long
      const processingDuration =
        Date.now() - (carol.createdAt?.getTime() ?? Date.now());

      if (processingDuration > POLLING_CONFIG.maxPollingDurationMs) {
        // Mark as timeout error
        await updateUserCarolStatus(carol.id, "error", {
          errorMessage:
            "Generation timed out. Please try creating a new carol.",
        });
        errors++;
        results.push({
          id: carol.id,
          result: "timeout",
        });
        continue;
      }

      // Check rate limit before making request
      if (!rateLimiter.canMakeRequest()) {
        // We've hit rate limit, stop processing for now
        skipped = sortedCarols.length - i;
        break;
      }

      try {
        rateLimiter.recordRequest();
        checked++;

        const statusData = await getCarolStatus(carol.sunoJobId);

        if (!statusData) {
          // No data yet, continue polling
          results.push({
            id: carol.id,
            result: "pending",
          });
          continue;
        }

        const status = statusData.status;

        // Handle different status states
        switch (status) {
          case "SUCCESS":
            // Fetch full details and update
            try {
              const completedCarol = await getCompletedCarol(carol.sunoJobId);

              await updateUserCarolStatus(carol.id, "complete", {
                audioUrl: completedCarol.audioUrl,
                videoUrl: completedCarol.videoUrl,
                imageUrl: completedCarol.imageUrl,
              });

              completed++;
              results.push({
                id: carol.id,
                result: "completed",
                title: completedCarol.title,
              });
            } catch (fetchError: any) {
              console.error(
                `Failed to fetch completed carol ${carol.id}:`,
                fetchError,
              );
              errors++;
              results.push({
                id: carol.id,
                result: "fetch_error",
                error: fetchError.message,
              });
            }
            break;

          case "CREATE_TASK_FAILED":
          case "GENERATE_AUDIO_FAILED":
          case "CALLBACK_EXCEPTION":
          case "SENSITIVE_WORD_ERROR":
            // Mark as error
            await updateUserCarolStatus(carol.id, "error", {
              errorMessage:
                statusData.errorMessage || `Generation failed: ${status}`,
            });
            errors++;
            results.push({
              id: carol.id,
              result: "error",
              status,
              message: statusData.errorMessage,
            });
            break;

          case "PENDING":
          case "TEXT_SUCCESS":
          case "FIRST_SUCCESS":
            // Still processing - determine optimal next check time
            const nextCheckDelay = getPollingInterval(status);

            // Store the recommended next check time (for smart polling)
            await updateUserCarolStatus(carol.id, "processing", {});

            results.push({
              id: carol.id,
              result: "processing",
              phase: status,
              nextCheckIn: `${nextCheckDelay / 1000}s`,
            });
            break;

          default:
            console.warn(`Unknown status for carol ${carol.id}: ${status}`);
            results.push({
              id: carol.id,
              result: "unknown_status",
              status,
            });
        }
      } catch (err: any) {
        console.error(`Failed to check carol ${carol.id}:`, err);

        // Determine if error is retryable
        const isNetworkError =
          err.message?.includes("fetch") ||
          err.message?.includes("network") ||
          err.message?.includes("ETIMEDOUT");

        if (isNetworkError) {
          // Don't mark as error yet, will retry next time
          results.push({
            id: carol.id,
            result: "network_error",
            willRetry: true,
          });
        } else {
          // Non-retryable error
          await updateUserCarolStatus(carol.id, "error", {
            errorMessage: err.message || "Status check failed",
          });
          errors++;
          results.push({
            id: carol.id,
            result: "permanent_error",
            error: err.message,
          });
        }
      }

      // Add small delay between requests to avoid bursts
      if (i < maxChecks - 1) {
        await new Promise((resolve) =>
          setTimeout(resolve, RATE_LIMITS.minDelayBetweenRequests),
        );
      }
    }

    // Log summary for monitoring
    const summary = {
      success: true,
      timestamp: new Date().toISOString(),
      totalProcessing: processingCarols.length,
      checked,
      completed,
      errors,
      skipped,
      nextCheckAvailable: rateLimiter.getNextAvailableTime(),
      results: results.length <= 10 ? results : `${results.length} results`,
    };

    console.log("Polling summary:", summary);

    return NextResponse.json(summary);
  } catch (error: any) {
    console.error("Polling error:", error);
    return NextResponse.json(
      {
        error: error.message || "Polling failed",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}

/**
 * GET endpoint to check polling status (for debugging)
 */
export async function GET(request: Request) {
  try {
    // This endpoint can be used to check the current state of processing carols
    const authHeader = request.headers.get("authorization");
    const expectedSecret = process.env.CRON_SECRET;

    if (!expectedSecret || authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const processingCarols = await getUserCarolsProcessing();

    const stats = {
      totalProcessing: processingCarols.length,
      oldestProcessing:
        processingCarols.length > 0
          ? {
              id: processingCarols[0].id,
              age:
                Date.now() -
                (processingCarols[0].createdAt?.getTime() ?? Date.now()),
              ageMinutes: Math.floor(
                (Date.now() -
                  (processingCarols[0].createdAt?.getTime() ?? Date.now())) /
                  60000,
              ),
            }
          : null,
      canMakeRequest: rateLimiter.canMakeRequest(),
      nextRequestAvailable: new Date(
        rateLimiter.getNextAvailableTime(),
      ).toISOString(),
      carols: processingCarols.map((c) => ({
        id: c.id,
        title: c.title,
        createdAt: c.createdAt?.toISOString() ?? new Date().toISOString(),
        processingMinutes: Math.floor(
          (Date.now() - (c.createdAt?.getTime() ?? Date.now())) / 60000,
        ),
      })),
    };

    return NextResponse.json(stats);
  } catch (error: any) {
    console.error("Status check error:", error);
    return NextResponse.json(
      { error: error.message || "Status check failed" },
      { status: 500 },
    );
  }
}
