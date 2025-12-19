import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface CountdownProps {
  targetDate: Date;
  label?: string;
}

export function Countdown({ targetDate, label }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const target = targetDate.getTime();
      const distance = target - now;

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className="text-center">
      {label && <p className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wider">{label}</p>}
      <div className="grid grid-cols-4 gap-2">
        {[
          { value: timeLeft.days, unit: 'Days' },
          { value: timeLeft.hours, unit: 'Hrs' },
          { value: timeLeft.minutes, unit: 'Min' },
          { value: timeLeft.seconds, unit: 'Sec' }
        ].map((item, idx) => (
          <motion.div
            key={idx}
            animate={{ scale: 1 }}
            className="bg-primary/10 border border-primary/30 rounded-lg p-2 backdrop-blur-sm"
          >
            <div className="font-display text-2xl font-bold text-primary">{String(item.value).padStart(2, '0')}</div>
            <div className="text-xs text-muted-foreground">{item.unit}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
