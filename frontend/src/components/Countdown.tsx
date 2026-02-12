import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function Countdown({ compact = false }: { compact?: boolean }) {
  const weddingDate = new Date('2026-08-15T15:45:00'); // 3:45 PM

  const calculateTimeLeft = (): TimeLeft => {
    const difference = weddingDate.getTime() - new Date().getTime();

    if (difference > 0) {
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  };

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeUnits = [
    { value: timeLeft.days, label: 'Days' },
    { value: timeLeft.hours, label: 'Hours' },
    { value: timeLeft.minutes, label: 'Minutes' },
    { value: timeLeft.seconds, label: 'Seconds' },
  ];

  if (compact) {
    return (
      <div className="flex items-center justify-center gap-6 md:gap-10">
        {timeUnits.map((unit, index) => (
          <div key={unit.label} className="flex items-center gap-6 md:gap-10">
            <div className="text-center">
              <div
                className="text-3xl md:text-4xl font-display text-gold leading-none"
                style={{ fontWeight: 300 }}
              >
                {String(unit.value).padStart(2, '0')}
              </div>
              <div className="text-[10px] text-subtle uppercase tracking-[0.2em] mt-1.5">
                {unit.label}
              </div>
            </div>
            {index < 3 && (
              <span className="text-gold/25 text-xl font-light -mt-3">·</span>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <motion.div
      className="flex gap-10 md:gap-16 justify-center items-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
    >
      {timeUnits.map((unit) => (
        <div key={unit.label} className="text-center">
          <motion.div
            key={unit.value}
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="text-5xl md:text-6xl font-display text-heading leading-none"
            style={{ fontWeight: 300 }}
          >
            {String(unit.value).padStart(2, '0')}
          </motion.div>
          <div className="text-[10px] md:text-xs text-subtle uppercase tracking-[0.25em] mt-2">
            {unit.label}
          </div>
        </div>
      ))}
    </motion.div>
  );
}
