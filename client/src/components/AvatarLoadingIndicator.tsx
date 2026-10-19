import React from 'react';
import { motion } from 'motion/react';
import { Bot, Sparkles } from 'lucide-react';

interface AvatarLoadingIndicatorProps {
  mentorGender?: 'female' | 'male';
  progress?: number;
  message?: string;
  className?: string;
}

/**
 * Sleek, Minimalist Studio Avatar Loading Indicator:
 * Replaces the previous heavy skeleton with a refined, professional frosted-glass loader.
 */
export const AvatarLoadingIndicator: React.FC<AvatarLoadingIndicatorProps> = ({
  mentorGender = 'female',
  progress,
  message,
  className = ''
}) => {
  const isMale = mentorGender === 'male';
  const mentorName = isMale ? 'Marcus' : 'Sophia';
  const accentColor = isMale ? 'text-cyan-400' : 'text-violet-400';
  const ringColor = isMale ? 'ring-cyan-500/30 border-cyan-500/40' : 'ring-violet-500/30 border-violet-500/40';
  const barGradient = isMale
    ? 'from-blue-600 via-cyan-500 to-blue-400'
    : 'from-violet-600 via-fuchsia-500 to-violet-400';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className={`absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm select-none ${className}`}
    >
      <div className="flex flex-col items-center gap-3">
        {/* Mentor Avatar Halo */}
        <div className="relative">
          <div
            className={`size-14 rounded-2xl bg-slate-900 border ${ringColor} shadow-xl flex items-center justify-center text-white relative`}
          >
            <Bot className={`size-7 ${accentColor}`} />
            {/* Subtle rotating glow ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
              className="absolute -inset-1 rounded-2xl border border-dashed border-white/20 pointer-events-none"
            />
          </div>
        </div>

        {/* Status Pill */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 shadow-md">
          <Sparkles className={`size-3 ${accentColor} animate-spin`} />
          <span className="text-xs font-semibold text-slate-200">
            {message || `Loading ${mentorName} • 3D Studio Rig`}
          </span>
          <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </div>

        {/* Sleek Minimal Progress Track */}
        <div className="w-36 h-1 rounded-full bg-slate-800/80 overflow-hidden relative border border-slate-700/40">
          {progress !== undefined && progress > 0 ? (
            <motion.div
              className={`h-full bg-gradient-to-r ${barGradient} rounded-full`}
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.2 }}
            />
          ) : (
            <motion.div
              animate={{
                x: ['-100%', '100%']
              }}
              transition={{
                repeat: Infinity,
                duration: 1.2,
                ease: 'easeInOut'
              }}
              className={`w-1/2 h-full bg-gradient-to-r ${barGradient} rounded-full`}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
};
