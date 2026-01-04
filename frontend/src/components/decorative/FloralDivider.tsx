import { motion } from 'framer-motion';

interface FloralDividerProps {
  className?: string;
  animate?: boolean;
}

export default function FloralDivider({ className = '', animate = true }: FloralDividerProps) {
  const pathVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: { duration: 2, ease: 'easeInOut' }
    }
  };

  const Svg = animate ? motion.svg : 'svg';
  const Path = animate ? motion.path : 'path';

  return (
    <Svg
      viewBox="0 0 400 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`w-full max-w-md mx-auto ${className}`}
      initial={animate ? "hidden" : undefined}
      animate={animate ? "visible" : undefined}
    >
      {/* Center flower */}
      <Path
        d="M200 30 C200 25, 195 20, 190 20 C185 20, 180 25, 180 30 C180 35, 185 40, 190 40 C195 40, 200 35, 200 30 Z"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        variants={animate ? pathVariants : undefined}
      />
      <Path
        d="M210 30 C210 25, 215 20, 220 20 C225 20, 230 25, 230 30 C230 35, 225 40, 220 40 C215 40, 210 35, 210 30 Z"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        variants={animate ? pathVariants : undefined}
      />

      {/* Center circle */}
      <Path
        d="M195 30 C195 27.5, 197.5 25, 200 25 C202.5 25, 205 27.5, 205 30 C205 32.5, 202.5 35, 200 35 C197.5 35, 195 32.5, 195 30 Z"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        variants={animate ? pathVariants : undefined}
      />

      {/* Decorative leaves - left side */}
      <Path
        d="M170 30 Q160 25, 150 28 M170 30 Q165 35, 155 37"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        variants={animate ? pathVariants : undefined}
      />
      <Path
        d="M140 30 Q130 28, 120 32 M140 32 Q132 36, 125 38"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        variants={animate ? pathVariants : undefined}
      />
      <Path
        d="M110 32 Q95 30, 80 35 M110 34 Q100 37, 90 40"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        variants={animate ? pathVariants : undefined}
      />
      <Path
        d="M70 35 Q55 33, 40 38 M70 37 Q60 40, 50 42"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        variants={animate ? pathVariants : undefined}
      />

      {/* Decorative leaves - right side */}
      <Path
        d="M230 30 Q240 25, 250 28 M230 30 Q235 35, 245 37"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        variants={animate ? pathVariants : undefined}
      />
      <Path
        d="M260 30 Q270 28, 280 32 M260 32 Q268 36, 275 38"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        variants={animate ? pathVariants : undefined}
      />
      <Path
        d="M290 32 Q305 30, 320 35 M290 34 Q300 37, 310 40"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        variants={animate ? pathVariants : undefined}
      />
      <Path
        d="M330 35 Q345 33, 360 38 M330 37 Q340 40, 350 42"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        variants={animate ? pathVariants : undefined}
      />

      {/* Small accent dots */}
      <circle cx="175" cy="25" r="1.5" fill="currentColor" opacity="0.6" />
      <circle cx="225" cy="25" r="1.5" fill="currentColor" opacity="0.6" />
      <circle cx="180" cy="35" r="1.5" fill="currentColor" opacity="0.6" />
      <circle cx="220" cy="35" r="1.5" fill="currentColor" opacity="0.6" />
    </Svg>
  );
}
