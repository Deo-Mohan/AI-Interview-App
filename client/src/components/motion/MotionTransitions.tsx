import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Smooth, accessible page entrance transition.
 * Uses hardware-accelerated transforms with cubic-bezier easing.
 */
export const PageTransition: React.FC<PageTransitionProps> = ({ children, className = '' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.24, ease: [0.2, 0.8, 0.2, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

interface StaggerContainerProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

/**
 * Container that staggers the entrance of child elements (e.g. card grids).
 */
export const StaggerContainer: React.FC<StaggerContainerProps> = ({ 
  children, 
  className = '',
  delay = 0.05
}) => {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: {
            staggerChildren: delay,
            delayChildren: 0.02
          }
        }
      }}
      initial="hidden"
      animate="show"
      className={className}
    >
      {children}
    </motion.div>
  );
};

interface StaggerItemProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Child item for StaggerContainer with subtle vertical slide and fade.
 */
export const StaggerItem: React.FC<StaggerItemProps> = ({ children, className = '' }) => {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 14 },
        show: { 
          opacity: 1, 
          y: 0, 
          transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] } 
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

interface PulseBeaconProps {
  variant?: 'emerald' | 'blue' | 'amber' | 'rose' | 'slate';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * High-craft pulse beacon with a radiant expanding ring to communicate live status.
 */
export const PulseBeacon: React.FC<PulseBeaconProps> = ({
  variant = 'emerald',
  size = 'md',
  className = ''
}) => {
  const colorMap = {
    emerald: { core: 'bg-emerald-500', ring: 'bg-emerald-400' },
    blue: { core: 'bg-blue-600', ring: 'bg-blue-400' },
    amber: { core: 'bg-amber-500', ring: 'bg-amber-400' },
    rose: { core: 'bg-rose-500', ring: 'bg-rose-400' },
    slate: { core: 'bg-slate-400', ring: 'bg-slate-300' },
  };

  const sizeMap = {
    sm: 'size-2',
    md: 'size-2.5',
    lg: 'size-3.5',
  };

  const ringSizeMap = {
    sm: 'size-4',
    md: 'size-5',
    lg: 'size-7',
  };

  const colors = colorMap[variant];

  return (
    <span className={`relative flex items-center justify-center shrink-0 ${sizeMap[size]} ${className}`}>
      <motion.span
        animate={{
          scale: [1, 2, 2.2],
          opacity: [0.65, 0.2, 0]
        }}
        transition={{
          duration: 1.8,
          repeat: Infinity,
          ease: "easeOut"
        }}
        className={`absolute rounded-full ${colors.ring} ${ringSizeMap[size]}`}
      />
      <span className={`relative rounded-full ${colors.core} ${sizeMap[size]}`} />
    </span>
  );
};

interface ReactiveAudioWaveformProps {
  isActive: boolean;
  state?: 'idle' | 'listening' | 'thinking' | 'speaking';
  barCount?: number;
  className?: string;
}

/**
 * Reactive multi-bar audio waveform with organic animated frequency simulation.
 */
export const ReactiveAudioWaveform: React.FC<ReactiveAudioWaveformProps> = ({
  isActive,
  state = 'idle',
  barCount = 18,
  className = ''
}) => {
  // Height profiles based on mentor conversation state
  const getBarColor = (index: number) => {
    if (!isActive || state === 'idle') return 'bg-slate-300';
    if (state === 'speaking') return 'bg-gradient-to-t from-blue-600 to-indigo-400';
    if (state === 'listening') return 'bg-gradient-to-t from-emerald-600 to-teal-400';
    return 'bg-gradient-to-t from-amber-500 to-amber-300'; // thinking
  };

  const heights = [35, 65, 95, 45, 80, 100, 70, 55, 40, 85, 95, 60, 45, 75, 90, 50, 35, 60];

  return (
    <div className={`flex items-center justify-center gap-1.5 h-10 ${className}`} aria-hidden="true">
      {Array.from({ length: barCount }).map((_, i) => {
        const baseHeight = heights[i % heights.length];
        const animationDuration = 0.6 + (i % 5) * 0.15;

        return (
          <motion.div
            key={i}
            className={`w-1 rounded-full transition-colors duration-200 ${getBarColor(i)}`}
            animate={
              isActive && (state === 'speaking' || state === 'listening')
                ? {
                    height: [`${Math.max(15, baseHeight * 0.25)}%`, `${baseHeight}%`, `${Math.max(20, baseHeight * 0.4)}%`],
                    opacity: [0.6, 1, 0.7]
                  }
                : state === 'thinking'
                ? {
                    height: ['20%', '50%', '20%'],
                    opacity: [0.4, 0.8, 0.4]
                  }
                : {
                    height: '15%',
                    opacity: 0.3
                  }
            }
            transition={{
              duration: animationDuration,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
              delay: (i * 0.06) % 0.4
            }}
          />
        );
      })}
    </div>
  );
};
