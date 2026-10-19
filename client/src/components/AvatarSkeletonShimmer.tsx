import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Bot } from 'lucide-react';

interface AvatarSkeletonShimmerProps {
  mentorGender?: 'female' | 'male';
  progress?: number;
  message?: string;
  className?: string;
}

/**
 * Ultra-Premium Humanoid Shimmer Skeleton Loader for 3D Mentor Avatar:
 * - Anatomical bust silhouette (head, neck, contoured shoulders, collarbone)
 * - Sweeping diagonal glass shimmer light wave
 * - Ambient radial glow matching mentor color theme (Sophia = Violet/Rose, Marcus = Ocean Blue/Cyan)
 * - Biometric pulse line and status badge
 */
export const AvatarSkeletonShimmer: React.FC<AvatarSkeletonShimmerProps> = ({
  mentorGender = 'female',
  progress,
  message,
  className = ''
}) => {
  const isMale = mentorGender === 'male';
  const mentorName = isMale ? 'Marcus' : 'Sophia';
  const accentTheme = isMale
    ? {
        glow: 'from-blue-600/25 via-cyan-500/15 to-transparent',
        border: 'border-blue-500/30',
        ring: 'ring-blue-500/20',
        accentText: 'text-cyan-400',
        bar: 'bg-gradient-to-r from-blue-600 to-cyan-400',
        dot: 'bg-cyan-400'
      }
    : {
        glow: 'from-violet-600/25 via-fuchsia-500/15 to-transparent',
        border: 'border-violet-500/30',
        ring: 'ring-violet-500/20',
        accentText: 'text-violet-300',
        bar: 'bg-gradient-to-r from-violet-600 to-fuchsia-400',
        dot: 'bg-fuchsia-400'
      };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className={`absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-950/95 backdrop-blur-md overflow-hidden select-none ${className}`}
    >
      {/* Background Ambient Aura */}
      <div
        className={`absolute inset-0 bg-radial ${accentTheme.glow} opacity-60 pointer-events-none`}
      />

      {/* Sweeping Diagonal Shimmer Beam */}
      <motion.div
        animate={{
          x: ['-100%', '200%']
        }}
        transition={{
          repeat: Infinity,
          duration: 1.8,
          ease: 'easeInOut'
        }}
        className="absolute inset-0 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none z-10"
      />

      {/* Humanoid Anatomical Bust Skeleton */}
      <div className="relative flex flex-col items-center justify-center w-64 h-72">
        {/* Head Silhouette */}
        <div className="relative flex items-center justify-center">
          <div
            className={`w-24 h-32 rounded-[48%] bg-gradient-to-b from-slate-800/90 to-slate-900/90 border ${accentTheme.border} shadow-2xl relative overflow-hidden flex flex-col items-center justify-center`}
          >
            {/* Eye Line Scanning Beam */}
            <div className="w-16 h-1 rounded-full bg-slate-700/60 mb-2 flex justify-between px-2">
              <span className={`size-1.5 rounded-full ${accentTheme.dot} animate-ping`} />
              <span className={`size-1.5 rounded-full ${accentTheme.dot} animate-ping`} />
            </div>

            {/* Jaw/Chin subtle curve */}
            <div className="w-8 h-1 rounded-full bg-slate-700/40 mt-4" />

            {/* Internal Shimmer Sweep for Head */}
            <motion.div
              animate={{ y: ['-100%', '200%'] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
              className="absolute inset-0 bg-gradient-to-b from-transparent via-white/15 to-transparent pointer-events-none"
            />
          </div>

          {/* Micro Ear hints */}
          <div className="absolute -left-1.5 w-1.5 h-6 rounded-l-full bg-slate-800/80 border-l border-slate-700" />
          <div className="absolute -right-1.5 w-1.5 h-6 rounded-r-full bg-slate-800/80 border-r border-slate-700" />
        </div>

        {/* Neck Pillar */}
        <div className="w-9 h-8 bg-gradient-to-b from-slate-900 to-slate-800/90 border-x border-slate-700/60 -mt-1 z-1 relative overflow-hidden">
          <div className="w-full h-full bg-slate-800/40" />
        </div>

        {/* Torso & Shoulders Silhouette */}
        <div className="w-60 h-24 relative -mt-1 flex justify-center">
          {/* Suit/Blazer Contoured Shoulders */}
          <div
            className={`w-full h-full rounded-t-[50px] bg-gradient-to-b from-slate-800/90 via-slate-800/70 to-transparent border-t border-x ${accentTheme.border} relative overflow-hidden shadow-2xl flex flex-col items-center`}
          >
            {/* Collar / Tie V-Shape Skeleton */}
            <div className="w-12 h-10 border-b-2 border-x-2 border-slate-700/60 rounded-b-xl mt-0.5 flex items-center justify-center">
              <div className="w-2 h-6 bg-slate-700/50 rounded-full" />
            </div>

            {/* Subtle Rib / Chest Skeleton Guides */}
            <div className="flex gap-4 mt-2">
              <div className="w-16 h-1 rounded-full bg-slate-700/30" />
              <div className="w-16 h-1 rounded-full bg-slate-700/30" />
            </div>

            {/* Torso Shimmer Light */}
            <motion.div
              animate={{ x: ['-100%', '200%'] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"
            />
          </div>
        </div>
      </div>

      {/* Floating Status Pill */}
      <div className="relative z-20 flex flex-col items-center gap-2 -mt-4">
        <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-800 shadow-xl">
          <Sparkles className={`size-3.5 ${accentTheme.accentText} animate-spin`} />
          <span className="text-xs font-bold text-slate-200 tracking-tight">
            {message || `Loading ${mentorName} • 3D Realistic Rig`}
          </span>
          <span className={`size-2 rounded-full ${accentTheme.dot} animate-pulse`} />
        </div>

        {/* Progress or Loading Bar */}
        <div className="w-44 h-1.5 rounded-full bg-slate-800/80 border border-slate-700/50 overflow-hidden relative">
          {progress !== undefined && progress > 0 ? (
            <motion.div
              className={`h-full ${accentTheme.bar} rounded-full transition-all duration-200`}
              style={{ width: `${progress}%` }}
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
              className={`w-1/2 h-full ${accentTheme.bar} rounded-full`}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
};
