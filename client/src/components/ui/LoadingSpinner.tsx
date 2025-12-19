// MODULAR: Reusable loading spinner with smooth animations
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8', 
  lg: 'w-12 h-12'
};

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  return (
    <motion.div
      className={cn(
        'animate-spin rounded-full border-2 border-muted-foreground/20 border-t-primary',
        sizeMap[size],
        className
      )}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    />
  );
}

// PERFORMANT: Skeleton component for loading states
interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <motion.div
      className={cn('animate-pulse rounded-md bg-muted/50', className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    />
  );
}

// ENHANCEMENT FIRST: Enhanced skeleton for event cards
export function EventCardSkeleton() {
  return (
    <motion.div
      className="rounded-xl border bg-card p-6 shadow-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-24 w-full" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-20" />
        </div>
      </div>
    </motion.div>
  );
}