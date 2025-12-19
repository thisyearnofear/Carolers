import { useState, useEffect } from 'react';
import { type Contribution } from '@shared/schema';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { getEventContributions, addContribution } from '@/lib/contributions';

interface EventContributionsProps {
  eventId: string;
}

export function EventContributions({ eventId }: EventContributionsProps) {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [newContribution, setNewContribution] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchContributions() {
      try {
        const data = await getEventContributions(eventId);
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
    
    if (!newContribution.trim()) return;

    try {
      const contribution = await addContribution({
        eventId,
        item: newContribution,
        status: 'proposed'
      });
      
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
          {contributions.map((contribution) => (
            <div 
              key={contribution.id} 
              className="p-3 border rounded-lg bg-muted/50"
            >
              <div className="flex justify-between items-center">
                <span>{contribution.item}</span>
                <span className="text-sm text-muted-foreground capitalize">
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