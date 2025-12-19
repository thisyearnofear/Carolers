// ENHANCEMENT FIRST: Enhanced version of existing Card with smooth animations
import { motion, type HTMLMotionProps } from 'framer-motion';
import { Card, CardProps } from './card';
import { forwardRef } from 'react';

interface AnimatedCardProps extends Omit<HTMLMotionProps<"div">, keyof CardProps>, CardProps {
  delay?: number;
}

export const AnimatedCard = forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ delay = 0, children, className, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        transition={{
          duration: 0.3,
          delay,
          ease: [0.25, 0.25, 0, 1] // Custom easing for smooth feel
        }}
        whileHover={{ 
          y: -4,
          transition: { duration: 0.2 }
        }}
        {...props}
      >
        <Card className={className}>
          {children}
        </Card>
      </motion.div>
    );
  }
);

AnimatedCard.displayName = 'AnimatedCard';