import React, { useRef, useState, useEffect } from 'react';
import { TalkingAvatar } from '@interviewflowai/talking-avatar';
import { ConversationState } from '../types/engine';
import { AlertCircle, Sparkles } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { AvatarLoadingIndicator } from './AvatarLoadingIndicator';
import { speechEventBus } from '../services/speechEvents';

interface TalkingAvatarIntegrationProps {
  state: ConversationState;
  mentorGender?: 'female' | 'male';
  modelUrl?: string;
  className?: string;
  onFallback?: () => void;
}

export const TalkingAvatarIntegration: React.FC<TalkingAvatarIntegrationProps> = ({
  state,
  mentorGender = 'female',
  modelUrl,
  className = '',
  onFallback
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const avatarInstanceRef = useRef<TalkingAvatar | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Resolved 3D Model URL based on gender or explicit prop
  const resolvedModelUrl = modelUrl || (mentorGender === 'male' 
    ? '/models/realistic-male.glb' 
    : '/models/realistic-female.glb');

  // Map ConversationState to SDK AvatarStatus ("listening" | "thinking")
  const sdkStatus = state === 'processing' ? 'thinking' : 'listening';

  useEffect(() => {
    if (!containerRef.current) return;

    let isDisposed = false;
    let avatar: TalkingAvatar | null = null;
    setIsLoading(true);
    setLoadError(null);

    try {
      avatar = new TalkingAvatar({
        container: containerRef.current,
        avatarUrl: resolvedModelUrl,
        modelUrl: '/models/viseme-model.bin',
        onError: (err: Error) => {
          if (!isDisposed) {
            console.warn('[TalkingAvatarSDK] Error:', err);
            setLoadError(err.message || 'SDK error initializing avatar.');
            setIsLoading(false);
          }
        }
      });

      avatarInstanceRef.current = avatar;

      avatar.ready.then(() => {
        if (!isDisposed) {
          setIsLoading(false);
        }
      }).catch((err) => {
        if (!isDisposed) {
          setLoadError(err?.message || 'Failed to load avatar model.');
          setIsLoading(false);
        }
      });
    } catch (err: any) {
      setLoadError(err.message || 'Failed to construct TalkingAvatar.');
      setIsLoading(false);
    }

    // Subscribe to speech events
    const unsubEnd = speechEventBus.onEnd(() => {
      if (avatarInstanceRef.current) {
        avatarInstanceRef.current.stopSpeaking();
        avatarInstanceRef.current.setStatus('listening');
      }
    });

    return () => {
      isDisposed = true;
      unsubEnd();
      if (avatar) {
        avatar.dispose();
      }
      avatarInstanceRef.current = null;
    };
  }, [resolvedModelUrl]);

  useEffect(() => {
    if (avatarInstanceRef.current) {
      avatarInstanceRef.current.setStatus(sdkStatus);
    }
  }, [sdkStatus]);

  if (loadError) {
    return (
      <div className={`relative w-full h-full flex flex-col items-center justify-center bg-slate-900 rounded-2xl text-white p-6 ${className}`}>
        <div className="size-16 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mb-3">
          <AlertCircle className="size-8" />
        </div>
        <p className="text-sm font-semibold text-rose-300 mb-1">Talking-Avatar SDK Notice</p>
        <p className="text-xs text-slate-400 text-center max-w-xs mb-4">{loadError}</p>
        {onFallback && (
          <button
            onClick={onFallback}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all shadow-subtle flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="size-3.5" /> Switch to Studio Rig Avatar
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full overflow-hidden rounded-2xl bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center ${className}`}>
      <AnimatePresence>
        {isLoading && (
          <AvatarLoadingIndicator
            mentorGender={mentorGender}
            message="Initializing TalkingAvatar SDK..."
          />
        )}
      </AnimatePresence>

      {/* Direct DOM mount point for TalkingAvatar canvas */}
      <div ref={containerRef} className="w-full h-full flex items-center justify-center" />
    </div>
  );
};
