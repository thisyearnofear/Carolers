import { useState, useEffect } from 'react';

export function useCountdown(targetDate: Date) {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [hasEnded, setHasEnded] = useState<boolean>(false);

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const ms = targetDate.getTime() - now.getTime();

      if (ms <= 0) {
        setTimeLeft('Event has started!');
        setHasEnded(true);
        return;
      }

      const total = Math.floor(ms / 1000);
      const h = Math.floor(total / 3600);
      const m = Math.floor((total % 3600) / 60);
      const s = total % 60;
      
      // Format with leading zeros for consistency
      const hours = h.toString().padStart(2, '0');
      const minutes = m.toString().padStart(2, '0');
      const seconds = s.toString().padStart(2, '0');
      
      setTimeLeft(`${hours}:${minutes}:${seconds}`);
      setHasEnded(false);
    };

    // Initial update
    updateCountdown();
    
    // Set up interval
    const interval = setInterval(updateCountdown, 1000);

    // Clean up
    return () => clearInterval(interval);
  }, [targetDate]);

  return { timeLeft, hasEnded };
}