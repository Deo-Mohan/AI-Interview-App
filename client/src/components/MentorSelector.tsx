import React from 'react';
import { MentorGender } from '../types/engine';
import { Volume2, Sliders, Sparkles } from 'lucide-react';

interface MentorSelectorProps {
  selectedMentor: MentorGender;
  onSelectMentor: (gender: MentorGender) => void;
  onOpenVoiceSettings?: () => void;
  onTestVoice?: () => void;
  disabled?: boolean;
  className?: string;
}

export const MentorSelector: React.FC<MentorSelectorProps> = ({
  selectedMentor,
  onSelectMentor,
  onOpenVoiceSettings,
  onTestVoice,
  disabled = false,
  className = ''
}) => {
  return (
    <div className={`flex items-center justify-between gap-2 bg-white/95 backdrop-blur-sm p-1.5 rounded-xl border border-slate-200/90 shadow-2xs ${className}`}>
      {/* Segmented Mentor Pill */}
      <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-lg">
        <button
          type="button"
          onClick={() => !disabled && onSelectMentor('female')}
          disabled={disabled}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer select-none ${
            selectedMentor === 'female'
              ? 'bg-white text-violet-700 shadow-2xs font-extrabold ring-1 ring-violet-200'
              : 'text-slate-600 hover:text-slate-900'
          } ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
          title="Switch to Sophia (Female Coach)"
        >
          <span className="size-2 rounded-full bg-violet-500 ring-2 ring-violet-200"></span>
          <span>Sophia</span>
          <span className="text-[10px] text-slate-400 font-normal hidden sm:inline">Female</span>
        </button>

        <button
          type="button"
          onClick={() => !disabled && onSelectMentor('male')}
          disabled={disabled}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer select-none ${
            selectedMentor === 'male'
              ? 'bg-white text-blue-700 shadow-2xs font-extrabold ring-1 ring-blue-200'
              : 'text-slate-600 hover:text-slate-900'
          } ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
          title="Switch to Marcus (Male Specialist)"
        >
          <span className="size-2 rounded-full bg-blue-500 ring-2 ring-blue-200"></span>
          <span>Marcus</span>
          <span className="text-[10px] text-slate-400 font-normal hidden sm:inline">Male</span>
        </button>
      </div>

      {/* Quick Icon Actions */}
      <div className="flex items-center gap-1">
        {onTestVoice && (
          <button
            type="button"
            onClick={onTestVoice}
            disabled={disabled}
            className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-slate-100 transition cursor-pointer"
            title="Test mentor voice"
          >
            <Volume2 className="size-3.5" />
          </button>
        )}

        {onOpenVoiceSettings && (
          <button
            type="button"
            onClick={onOpenVoiceSettings}
            disabled={disabled}
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
            title="Voice Speed & Pitch Settings"
          >
            <Sliders className="size-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
