'use client';

import { motion } from 'framer-motion';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Package, Plus } from 'lucide-react';

interface ContributionSuggestion {
  category: string;
  items: string[];
  reasoning: string;
}

interface ContributionSuggestionCardProps {
  suggestion: ContributionSuggestion;
  onAddItem: (item: string, category: string) => void;
  isLoading?: boolean;
  index?: number;
}

const CATEGORY_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  'Food & Beverages': {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-700'
  },
  'Music Equipment': {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700'
  },
  'Logistics': {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-700'
  },
  'Decorations': {
    bg: 'bg-pink-50',
    border: 'border-pink-200',
    text: 'text-pink-700'
  },
  'Other': {
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    text: 'text-slate-700'
  }
};

export function ContributionSuggestionCard({
  suggestion,
  onAddItem,
  isLoading = false,
  index = 0
}: ContributionSuggestionCardProps) {
  const colors = CATEGORY_COLORS[suggestion.category] || CATEGORY_COLORS['Other'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className={`border ${colors.border} ${colors.bg} overflow-hidden`}>
        <div className="p-4 space-y-3">
          {/* Category Header */}
          <div className="flex items-center gap-2">
            <Package className={`w-5 h-5 ${colors.text}`} />
            <h3 className={`font-semibold text-sm ${colors.text}`}>
              {suggestion.category}
            </h3>
          </div>

          {/* Reasoning */}
          <p className="text-xs text-slate-600 italic">
            "{suggestion.reasoning}"
          </p>

          {/* Items List */}
          <div className="space-y-1.5">
            {suggestion.items.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + idx * 0.05 }}
                className="flex items-center justify-between gap-2"
              >
                <span className="text-sm text-slate-900">• {item}</span>
                <Button
                  onClick={() => onAddItem(item, suggestion.category)}
                  disabled={isLoading}
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 hover:bg-white"
                  title="Add this contribution"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
