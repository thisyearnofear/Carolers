'use client';

import { useState } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ThumbsUp, ThumbsDown, Loader2 } from 'lucide-react';
import { type TranslationProposal } from '@shared/schema';

interface ProposalVotingProps {
  proposal: TranslationProposal;
  userVoted?: boolean;
  votingPower?: number;
  onVoteSubmitted?: () => void;
}

export function ProposalVoting({
  proposal,
  userVoted = false,
  votingPower = 1,
  onVoteSubmitted,
}: ProposalVotingProps) {
  const [voting, setVoting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalVotes = (proposal.upvotes || 0) + (proposal.downvotes || 0);
  const approvalRate = totalVotes > 0 ? Math.round(((proposal.upvotes || 0) / totalVotes) * 100) : 0;
  
  const isApproved = (proposal.upvotes || 0) > (proposal.downvotes || 0);
  const votesRemaining = (proposal.requiredQuorum || 5) - totalVotes;
  const votingEnded = proposal.votingEndsAt ? new Date() > new Date(proposal.votingEndsAt) : false;

  const handleVote = async (vote: 'upvote' | 'downvote') => {
    if (userVoted) {
      setError('You have already voted on this proposal');
      return;
    }

    setVoting(true);
    setError(null);

    try {
      const response = await fetch(`/api/translations/proposals/${proposal.id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vote }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to vote');
      }

      onVoteSubmitted?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Vote failed');
    } finally {
      setVoting(false);
    }
  };

  const statusColor = votingEnded
    ? proposal.status === 'merged'
      ? 'text-green-600'
      : 'text-red-600'
    : 'text-amber-600';

  return (
    <div className="flex flex-col gap-4 p-4 border border-slate-200 rounded-lg bg-slate-50">
      {/* Status */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-700">Vote Status</span>
        <Badge className={statusColor}>
          {votingEnded
            ? proposal.status === 'merged'
              ? 'Approved ✓'
              : 'Rejected ✗'
            : 'Voting Active'}
        </Badge>
      </div>

      {/* Voting progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600">
            {totalVotes} vote{totalVotes !== 1 ? 's' : ''} / {proposal.requiredQuorum || 5} needed
          </span>
          <span className="font-semibold text-slate-700">{approvalRate}% approval</span>
        </div>

        {/* Progress bar */}
        <div className="flex gap-1 h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="bg-green-500"
            style={{ width: `${totalVotes > 0 ? ((proposal.upvotes || 0) / totalVotes) * 100 : 0}%` }}
          />
          <div
            className="bg-red-500"
            style={{ width: `${totalVotes > 0 ? ((proposal.downvotes || 0) / totalVotes) * 100 : 0}%` }}
          />
        </div>

        <div className="flex justify-between text-xs text-slate-500">
          <span>👍 {proposal.upvotes || 0}</span>
          <span>👎 {proposal.downvotes || 0}</span>
        </div>
      </div>

      {/* Voting info */}
      {!votingEnded && (
        <div className="text-xs text-slate-600 bg-white p-2 rounded">
          Your voting power: <strong>{votingPower}x</strong>
          {votingPower > 1 && ' (expert contributor)'}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
          {error}
        </div>
      )}

      {/* Voting buttons */}
      {!votingEnded && (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-2"
            onClick={() => handleVote('upvote')}
            disabled={voting || userVoted}
          >
            {voting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ThumbsUp className="w-4 h-4" />}
            Support
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-2"
            onClick={() => handleVote('downvote')}
            disabled={voting || userVoted}
          >
            {voting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ThumbsDown className="w-4 h-4" />}
            Oppose
          </Button>
        </div>
      )}

      {/* Voting ended message */}
      {votingEnded && (
        <div className="text-xs text-slate-600 text-center py-2">
          Voting ended {proposal.votingEndsAt ? new Date(proposal.votingEndsAt).toLocaleDateString() : ''}
        </div>
      )}
    </div>
  );
}
