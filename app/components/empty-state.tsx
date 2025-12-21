import { ReactNode } from 'react';
import { Button } from './ui/button';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  variant?: 'default' | 'compact';
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  variant = 'default',
}: EmptyStateProps) {
  if (variant === 'compact') {
    return (
      <div className="py-lg px-md text-center border-2 border-dashed border-slate-200 rounded-card-sm bg-slate-50">
        {icon && <div className="text-slate-400 mb-md opacity-40 flex justify-center">{icon}</div>}
        <h3 className="font-display text-lg text-slate-700 mb-xs">{title}</h3>
        <p className="text-sm text-slate-500 mb-md">{description}</p>
        {action && (
          <Button onClick={action.onClick} size="sm">
            {action.label}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="py-2xl px-lg text-center border-2 border-dashed border-primary/10 rounded-card-xl bg-primary/5">
      {icon && <div className="text-primary/20 mb-lg flex justify-center">{icon}</div>}
      <h3 className="font-display text-2xl text-primary mb-md leading-tight">{title}</h3>
      <p className="text-base text-slate-600 mb-2xl max-w-sm mx-auto">{description}</p>
      {action && (
        <Button onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
