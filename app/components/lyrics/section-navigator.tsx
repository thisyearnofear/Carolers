/**
 * Section Navigator
 * 
 * Quick jump buttons to verse/chorus/bridge
 */

'use client';

import { useState } from 'react';
import { Button } from '../ui/button';
import { ChevronDown } from 'lucide-react';

interface SectionNavigatorProps {
  sections: string[];
  currentSection?: string;
  onSelectSection: (section: string) => void;
}

export function SectionNavigator({
  sections,
  currentSection,
  onSelectSection,
}: SectionNavigatorProps) {
  const [open, setOpen] = useState(false);

  if (sections.length === 0) return null;

  return (
    <div className="relative inline-block">
      <Button
        onClick={() => setOpen(!open)}
        variant="outline"
        size="sm"
        className="flex gap-2 bg-white/50"
      >
        {currentSection || 'Go to section'}
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </Button>

      {open && (
        <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-50">
          {sections.map((section) => (
            <button
              key={section}
              onClick={() => {
                onSelectSection(section);
                setOpen(false);
              }}
              className={`block w-full text-left px-4 py-2 text-sm hover:bg-slate-100 first:rounded-t-lg last:rounded-b-lg ${
                currentSection === section ? 'bg-primary/10 text-primary font-medium' : ''
              }`}
            >
              {section}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
