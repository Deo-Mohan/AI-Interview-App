import React, { useRef, useState, useEffect } from 'react';
import { TalkingAvatar } from '@interviewflowai/talking-avatar';
import { ConversationState } from '../types/engine';
import { AlertCircle, Sparkles, RefreshCw } from 'lucide-react';
import { Badge } from './ui';

export const SKY_MORPH_TARGET_MAP: Record<string, string> = {
  viseme_aa: 'aa',
  viseme_E: 'E',
  viseme_I: 'ih',
  viseme_O: 'oh',
  viseme_U: 'ou',
  viseme_PP: 'PP',
  viseme_FF: 'FF',
  viseme_TH: 'TH',
  viseme_DD: 'DD',
  viseme_kk: 'kk',
  viseme_CH: 'CH',
  viseme_SS: 'SS',
  viseme_nn: 'nn',
  viseme_RR: 'RR',
  viseme_sil: 'sil',
  eyeBlinkLeft: 'eyeBlinkLeft',
  eyeBlinkRight: 'eyeBlinkRight',
  browInnerUp: 'browInnerUp',
  jawOpen: 'jawOpen',
  mouthFunnel: 'mouthFunnel',
  mouthPucker: 'mouthPucker',
  mouthRollLower: 'mouthRollLower',
  mouthClose: 'mouthClose'
};

interface TalkingAvatarIntegrationProps {
  state: ConversationState;
  className?: string;
  onFallback?: () => void;
}

export const TalkingAvatarIntegration: React.FC<TalkingAvatarIntegrationProps> = ({
  state,
  className = '',
  onFallback
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const avatarInstanceRef = useRef<TalkingAvatar | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Map ConversationState to SDK AvatarStatus ("listening" | "thinking")
  const sdkStatus = state === 'processing' ? 'thinking' : 'listening';

  useEffect(() => {
    if (!containerRef.current) return;

    let isDisposed = false;
    let avatar: TalkingAvatar | null = null;

    try {
      avatar = new TalkingAvatar({
        container: containerRef.current,
        avatarUrl: '/models/english-coach.glb',
        modelUrl: '/models/viseme-model.bin',
        morphTargets: SKY_MORPH_TARGET_MAP,
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

    return () => {
      isDisposed = true;
      if (avatar) {
        avatar.dispose();
      }
      avatarInstanceRef.current = null;
    };
  }, []);

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
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-slate-950/80">
          <RefreshCw className="size-6 text-blue-400 animate-spin mb-2" />
          <span className="text-xs font-semibold text-slate-300">Initializing talking-avatar SDK...</span>
        </div>
      )}

      {/* Direct DOM mount point for TalkingAvatar canvas */}
      <div ref={containerRef} className="w-full h-full flex items-center justify-center" />

      {/* Floating State Badge */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
        <Badge variant={
          state === 'speaking' ? 'blue' :
          state === 'listening' ? 'emerald' :
          state === 'processing' ? 'amber' : 'slate'
        } size="sm" dot>
          {state === 'speaking' ? 'Interviewer Speaking' :
           state === 'listening' ? 'Listening Attentively' :
           state === 'processing' ? 'Evaluating Answer' : 'Ready'}
        </Badge>
        <span className="text-[10px] text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
          talking-avatar.dev SDK
        </span>
      </div>
    </div>
  );
};
