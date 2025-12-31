'use client';

import { useState, useCallback, useEffect } from 'react';

export interface GenerationState {
  status: 'idle' | 'submitting' | 'generating' | 'complete' | 'error';
  carol?: {
    id: string;
    sunoJobId: string;
    title: string;
    audioUrl?: string;
    videoUrl?: string;
    imageUrl?: string;
    completedAt?: string;
  };
  error?: string;
  progress?: {
    message: string;
    step: number;
    total: number;
  };
}

export function useCarolGeneration() {
  const [state, setState] = useState<GenerationState>({ status: 'idle' });
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout>();

  const submitCarol = useCallback(
    async (params: {
      title: string;
      lyrics?: string;
      genre?: string;
      style?: string;
    }) => {
      setState({ status: 'submitting' });

      try {
        const response = await fetch('/api/carols/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to start generation');
        }

        const data = await response.json();
        setState({
          status: 'generating',
          carol: data.carol,
          progress: { message: 'Starting generation...', step: 1, total: 3 },
        });

        // Start polling
        pollStatus(data.carol.id);
      } catch (error: any) {
        setState({
          status: 'error',
          error: error.message || 'Failed to submit carol',
        });
        throw error;
      }
    },
    []
  );

  const pollStatus = useCallback((carolId: string) => {
    let attempts = 0;
    const maxAttempts = 120; // 4 minutes max (120 * 2s)

    const interval = setInterval(async () => {
      attempts++;

      try {
        const response = await fetch(`/api/carols/${carolId}/status`);
        if (!response.ok) throw new Error('Status check failed');

        const data = await response.json();
        const carol = data.carol;

        if (carol.status === 'complete') {
          clearInterval(interval);
          setState({
            status: 'complete',
            carol: {
              id: carol.id,
              sunoJobId: carol.sunoJobId,
              title: carol.title,
              audioUrl: carol.audioUrl,
              videoUrl: carol.videoUrl,
              imageUrl: carol.imageUrl,
              completedAt: carol.completedAt,
            },
            progress: { message: 'Carol ready!', step: 3, total: 3 },
          });
        } else if (carol.status === 'error') {
          clearInterval(interval);
          setState({
            status: 'error',
            error: carol.error || 'Generation failed',
            carol: { ...carol, id: carol.id },
          });
        } else {
          // Still processing
          const eta = Math.max(0, 60 - attempts * 2); // Estimate seconds remaining
          setState(prev => ({
            ...prev,
            status: 'generating',
            progress: {
              message: `Composing music... (${eta}s remaining)`,
              step: 2,
              total: 3,
            },
          }));
        }

        // Timeout after max attempts
        if (attempts >= maxAttempts) {
          clearInterval(interval);
          setState({
            status: 'error',
            error: 'Generation timed out',
          });
        }
      } catch (err: any) {
        console.error('Poll error:', err);
        // Continue polling on error
      }
    }, 2000);

    setPollingInterval(interval);
  }, []);

  const reset = useCallback(() => {
    if (pollingInterval) clearInterval(pollingInterval);
    setState({ status: 'idle' });
  }, [pollingInterval]);

  const cancel = useCallback(() => {
    if (pollingInterval) clearInterval(pollingInterval);
    setState({ status: 'idle', error: 'Cancelled by user' });
  }, [pollingInterval]);

  useEffect(() => {
    return () => {
      if (pollingInterval) clearInterval(pollingInterval);
    };
  }, [pollingInterval]);

  return {
    state,
    submitCarol,
    reset,
    cancel,
    isLoading: state.status === 'submitting' || state.status === 'generating',
  };
}
