import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function Countdown() {
  const weddingDate = new Date('2026-08-15T15:45:00'); // 3:45 PM

  const calculateTimeLeft = (): TimeLeft => {
    const difference = weddingDate.getTime() - new Date().getTime();

    if (difference > 0) {
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      };
    }

    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  };

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5 }
    }
  };

  const timeUnits = [
    { value: timeLeft.days, label: 'Days' },
    { value: timeLeft.hours, label: 'Hours' },
    { value: timeLeft.minutes, label: 'Minutes' },
    { value: timeLeft.seconds, label: 'Seconds' }
  ];

  return (
    <motion.div
      className="flex gap-4 md:gap-8 justify-center items-center flex-wrap"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {timeUnits.map((unit, index) => (
        <motion.div
          key={unit.label}
          variants={itemVariants}
          className="relative"
        >
          <div className="bg-off-white border-2 border-dusty-rose/30 rounded-lg shadow-lg px-6 py-4 md:px-8 md:py-6 min-w-[100px] md:min-w-[120px]">
            {/* Decorative corner accent */}
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-dusty-rose/20 rounded-full" />
            <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-sage/20 rounded-full" />

            <div className="text-center">
              <motion.div
                key={unit.value}
                initial={{ scale: 1.2, opacity: 0.5 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="text-4xl md:text-5xl font-display text-dusty-rose mb-1"
              >
                {String(unit.value).padStart(2, '0')}
              </motion.div>
              <div className="text-xs md:text-sm font-medium text-warm-gray uppercase tracking-wider">
                {unit.label}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
