'use client';

import { useState, useEffect } from 'react';
import { type Contribution } from '@shared/schema';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useSafeUser } from '@/hooks/use-safe-user';

interface EventContributionsProps {
  eventId: string;
}

export function EventContributions({ eventId }: EventContributionsProps) {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [newContribution, setNewContribution] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useSafeUser();

  useEffect(() => {
    async function fetchContributions() {
      try {
        const response = await fetch(`/api/events/${eventId}/contributions`);
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        setContributions(data);
      } catch (error) {
        console.error('Failed to fetch contributions:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchContributions();
  }, [eventId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newContribution.trim() || !user) return;

    try {
      const response = await fetch(`/api/events/${eventId}/contributions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: user.id,
          item: newContribution,
          status: 'proposed'
        })
      });

      if (!response.ok) throw new Error('Failed to add contribution');
      const contribution = await response.json();

      setContributions(prev => [...prev, contribution]);
      setNewContribution('');
    } catch (error) {
      console.error('Failed to add contribution:', error);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Contributions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contributions</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
          <Input
            value={newContribution}
            onChange={(e) => setNewContribution(e.target.value)}
            placeholder="What can you contribute?"
            className="flex-1"
          />
          <Button type="submit">Add</Button>
        </form>

        <div className="space-y-3">
          {contributions.map((contribution: any) => (
            <div
              key={contribution.id}
              className="p-3 border rounded-lg bg-muted/50"
            >
              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="font-medium text-sm text-sky-700">
                    {contribution.userName || `User ${contribution.memberId.substring(0, 8)}`}
                  </span>
                  <span>{contribution.item}</span>
                </div>
                <span className="text-xs text-muted-foreground capitalize bg-sky-100 px-2 py-1 rounded-full">
                  {contribution.status}
                </span>
              </div>
            </div>
          ))}

          {contributions.length === 0 && (
            <p className="text-muted-foreground text-center py-4">
              No contributions yet. Be the first to offer something!
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}