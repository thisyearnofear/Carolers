'use client';

import { useState, useEffect } from 'react';
import { type Contribution } from '@shared/schema';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useSafeUser } from '@/hooks/use-safe-user';
import { ContributionSuggestionCard } from '../contributions/contribution-suggestion-card';
import { Lightbulb, Loader } from 'lucide-react';

interface ContributionSuggestion {
  category: string;
  items: string[];
  reasoning: string;
}

interface EventContributionsProps {
  eventId: string;
}

export function EventContributions({ eventId }: EventContributionsProps) {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [newContribution, setNewContribution] = useState('');
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState<ContributionSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
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

  const handleGetSuggestions = async () => {
    setLoadingSuggestions(true);
    try {
      const response = await fetch(`/api/events/${eventId}/contribution-suggestions`, {
        method: 'GET'
      });

      if (!response.ok) throw new Error('Failed to get suggestions');

      const data = await response.json();
      setSuggestions(data.suggestions || []);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Failed to get suggestions:', error);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleAddSuggestedItem = async (item: string, category: string) => {
    if (!user) return;

    try {
      const response = await fetch(`/api/events/${eventId}/contributions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: user.id,
          item: item,
          status: 'proposed'
        })
      });

      if (!response.ok) throw new Error('Failed to add contribution');
      const contribution = await response.json();

      setContributions(prev => [...prev, contribution]);
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
      <CardHeader className="space-y-3">
        <CardTitle>Contributions & Coordination</CardTitle>
        
        {/* Smart Suggestions Section */}
        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-600" />
            <div>
              <p className="text-sm font-medium text-amber-900">What do we need?</p>
              <p className="text-xs text-amber-700">AI-powered contribution ideas</p>
            </div>
          </div>
          <Button
            onClick={handleGetSuggestions}
            disabled={loadingSuggestions}
            size="sm"
            variant="outline"
            className="text-xs border-amber-200 hover:bg-amber-50"
          >
            {loadingSuggestions ? (
              <>
                <Loader className="w-3 h-3 mr-1 animate-spin" />
                Thinking...
              </>
            ) : (
              'Get Suggestions'
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* AI Suggestions Grid */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="space-y-3 pb-4 border-b border-slate-200">
            <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">Suggested by AI:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {suggestions.map((suggestion, idx) => (
                <ContributionSuggestionCard
                  key={idx}
                  suggestion={suggestion}
                  onAddItem={handleAddSuggestedItem}
                  isLoading={loadingSuggestions}
                  index={idx}
                />
              ))}
            </div>
          </div>
        )}

        {/* Manual Contribution Input */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={newContribution}
            onChange={(e) => setNewContribution(e.target.value)}
            placeholder="Add custom contribution..."
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