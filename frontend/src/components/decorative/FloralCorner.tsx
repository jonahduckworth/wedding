import { motion } from 'framer-motion';

interface FloralCornerProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  className?: string;
}

export default function FloralCorner({
  position = 'top-left',
  className = ''
}: FloralCornerProps) {
  const positionClasses = {
    'top-left': 'top-0 left-0',
    'top-right': 'top-0 right-0 scale-x-[-1]',
    'bottom-left': 'bottom-0 left-0 scale-y-[-1]',
    'bottom-right': 'bottom-0 right-0 scale-[-1]'
  };

  const pathVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 0.4,
      transition: { duration: 2.5, ease: 'easeInOut' as const }
    }
  };

  return (
    <div className={`absolute ${positionClasses[position]} pointer-events-none ${className}`}>
      <motion.svg
        width="200"
        height="200"
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        initial="hidden"
        animate="visible"
      >
        {/* Main branch */}
        <motion.path
          d="M10 10 Q40 30, 60 70 T80 150"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          variants={pathVariants}
        />

        {/* Small leaves */}
        <motion.path
          d="M30 35 Q25 30, 20 32 M30 35 Q28 40, 25 42"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          variants={pathVariants}
        />
        <motion.path
          d="M45 55 Q40 50, 35 52 M45 55 Q43 60, 40 62"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          variants={pathVariants}
        />
        <motion.path
          d="M55 85 Q50 80, 45 82 M55 85 Q53 90, 50 92"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          variants={pathVariants}
        />

        {/* Flowers */}
        <motion.circle
          cx="60"
          cy="45"
          r="8"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
          variants={pathVariants}
        />
        <motion.circle
          cx="60"
          cy="45"
          r="3"
          fill="currentColor"
          opacity="0.3"
        />

        <motion.circle
          cx="70"
          cy="100"
          r="10"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
          variants={pathVariants}
        />
        <motion.circle
          cx="70"
          cy="100"
          r="4"
          fill="currentColor"
          opacity="0.3"
        />

        {/* Decorative curls */}
        <motion.path
          d="M75 60 Q85 55, 90 58 Q95 61, 93 66"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          variants={pathVariants}
        />
      </motion.svg>
    </div>
  );
}
