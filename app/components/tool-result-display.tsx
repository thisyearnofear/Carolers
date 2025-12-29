'use client';

import { motion } from 'framer-motion';
import { Search, Music, Users, Gift } from 'lucide-react';

interface ToolCall {
  tool: string;
  args: any;
  result: any;
}

const TOOL_CONFIG: Record<string, {
  icon: React.ComponentType<any>;
  label: string;
  color: string;
}> = {
  searchCarols: {
    icon: Search,
    label: 'Carol Search',
    color: 'bg-blue-50 border-blue-200 text-blue-700'
  },
  summarizeChat: {
    icon: Users,
    label: 'Chat Summary',
    color: 'bg-purple-50 border-purple-200 text-purple-700'
  },
  suggestSetlist: {
    icon: Music,
    label: 'Setlist Generator',
    color: 'bg-pink-50 border-pink-200 text-pink-700'
  },
  addContribution: {
    icon: Gift,
    label: 'Contribution Ideas',
    color: 'bg-green-50 border-green-200 text-green-700'
  }
};

interface ToolResultDisplayProps {
  toolCall: ToolCall;
  index: number;
}

export function ToolResultDisplay({ toolCall, index }: ToolResultDisplayProps) {
  const config = TOOL_CONFIG[toolCall.tool];
  if (!config) return null;

  const Icon = config.icon;
  const { result } = toolCall;

  if (!result?.success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className={`rounded-lg border p-3 text-xs ${config.color}`}
      >
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 flex-shrink-0" />
          <p className="font-semibold">{config.label} - Error</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.1 }}
      className={`rounded-lg border p-3 text-xs ${config.color}`}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 flex-shrink-0" />
        <p className="font-semibold">{config.label}</p>
      </div>

      {/* Search Carols Results */}
      {toolCall.tool === 'searchCarols' && result.results?.length > 0 && (
        <div className="space-y-1.5">
          <p className="font-medium">Found {result.count} carols:</p>
          <ul className="space-y-1">
            {result.results.slice(0, 5).map((carol: any, i: number) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="text-opacity-60 flex-shrink-0">•</span>
                <span>
                  <strong>{carol.title}</strong>
                  {carol.artist && <span className="text-opacity-75"> by {carol.artist}</span>}
                  {carol.energy && <span className="text-opacity-60"> ({carol.energy})</span>}
                </span>
              </li>
            ))}
          </ul>
          {result.results.length > 5 && (
            <p className="text-opacity-60 text-[11px] mt-1">... and {result.results.length - 5} more</p>
          )}
        </div>
      )}

      {/* Setlist Results */}
      {toolCall.tool === 'suggestSetlist' && result.setlist?.length > 0 && (
        <div className="space-y-1.5">
          <p className="font-medium">Suggested setlist ({result.count} songs, {result.totalDuration}):</p>
          <ul className="space-y-1">
            {result.setlist.slice(0, 6).map((song: any, i: number) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="text-opacity-60 flex-shrink-0">{i + 1}.</span>
                <span>
                  <strong>{song.title}</strong>
                  {song.artist && <span className="text-opacity-75"> by {song.artist}</span>}
                  {song.duration && <span className="text-opacity-60"> ({song.duration})</span>}
                </span>
              </li>
            ))}
          </ul>
          {result.setlist.length > 6 && (
            <p className="text-opacity-60 text-[11px] mt-1">... and {result.setlist.length - 6} more</p>
          )}
        </div>
      )}

      {/* Chat Summary */}
      {toolCall.tool === 'summarizeChat' && (
        <div className="space-y-1.5">
          <div className="space-y-1">
            {result.summary && (
              <>
                <p className="font-medium text-opacity-75">Recent activity:</p>
                <p className="text-opacity-75 italic line-clamp-3">{result.summary.split('\n').slice(0, 2).join(' ')}</p>
              </>
            )}
          </div>
          {result.participants && result.participants.length > 0 && (
            <p className="text-opacity-60 text-[11px]">
              {result.participants.length} participant{result.participants.length > 1 ? 's' : ''}
            </p>
          )}
          {result.topics && result.topics.length > 0 && (
            <p className="text-opacity-60 text-[11px]">
              Topics: {result.topics.join(', ')}
            </p>
          )}
        </div>
      )}

      {/* Contribution Suggestions */}
      {toolCall.tool === 'addContribution' && result.suggestions?.length > 0 && (
        <div className="space-y-1.5">
          <p className="font-medium">Suggested contributions ({result.suggestionsCount}):</p>
          <ul className="space-y-1">
            {result.suggestions.slice(0, 4).map((suggestion: any, i: number) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="text-opacity-60 flex-shrink-0">•</span>
                <span>
                  <strong>{suggestion.item}</strong>
                  <span className="text-opacity-60"> ({suggestion.category})</span>
                </span>
              </li>
            ))}
          </ul>
          {result.suggestions.length > 4 && (
            <p className="text-opacity-60 text-[11px] mt-1">... and {result.suggestions.length - 4} more</p>
          )}
        </div>
      )}

      {/* Fallback: Show summary */}
      {!((toolCall.tool === 'searchCarols' && result.results?.length > 0) ||
         (toolCall.tool === 'suggestSetlist' && result.setlist?.length > 0) ||
         (toolCall.tool === 'summarizeChat') ||
         (toolCall.tool === 'addContribution' && result.suggestions?.length > 0)) && (
        <p className="text-opacity-75">
          {result.count && `${result.count} result${result.count !== 1 ? 's' : ''}`}
          {result.suggestionsCount && `${result.suggestionsCount} suggestion${result.suggestionsCount !== 1 ? 's' : ''}`}
        </p>
      )}
    </motion.div>
  );
}
