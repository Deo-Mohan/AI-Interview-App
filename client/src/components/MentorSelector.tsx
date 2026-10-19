import React from 'react';
import { MENTORS } from '../data/mentors';
import { MentorGender } from '../types/engine';
import { ArrowLeftRight, CheckCircle2, Sparkles, Volume2, Sliders } from 'lucide-react';
import { Badge } from './ui';

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
  const mentorsList: MentorGender[] = ['female', 'male'];

  const handleToggle = () => {
    if (disabled) return;
    const nextGender: MentorGender = selectedMentor === 'female' ? 'male' : 'female';
    onSelectMentor(nextGender);
  };

  return (
    <div className={`flex flex-col gap-2.5 ${className}`}>
      {/* Header bar with Switch Button & Voice Controls */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="size-6 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
            <Sparkles className="size-3.5" />
          </div>
          <span className="text-xs font-extrabold text-slate-800 tracking-tight">
            AI Mentor & Voice Studio
          </span>
          <Badge variant="blue" size="sm">Dual 3D Models</Badge>
        </div>

        <div className="flex items-center gap-2">
          {onTestVoice && (
            <button
              onClick={onTestVoice}
              disabled={disabled}
              className="px-2.5 py-1 text-[11px] font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Test current AI mentor voice"
            >
              <Volume2 className="size-3 text-blue-600" />
              <span className="hidden sm:inline">Test Voice</span>
            </button>
          )}

          {onOpenVoiceSettings && (
            <button
              onClick={onOpenVoiceSettings}
              disabled={disabled}
              className="px-2.5 py-1 text-[11px] font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Configure voice speed, pitch and OS voice"
            >
              <Sliders className="size-3 text-slate-600" />
              <span className="hidden sm:inline">Voice Settings</span>
            </button>
          )}

          <button
            onClick={handleToggle}
            disabled={disabled}
            className="px-3 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg text-xs font-bold shadow-xs hover:shadow transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 active:translate-y-px"
            title={`Switch to ${selectedMentor === 'female' ? 'Marcus (Male)' : 'Sophia (Female)'}`}
          >
            <ArrowLeftRight className="size-3.5" />
            <span>Switch Mentor</span>
          </button>
        </div>
      </div>

      {/* Side-by-side Mentor Cards */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
        {mentorsList.map((gender) => {
          const mentor = MENTORS[gender];
          const isSelected = selectedMentor === gender;
          const isFemale = gender === 'female';

          return (
            <div
              key={gender}
              onClick={() => !disabled && onSelectMentor(gender)}
              className={`relative rounded-xl p-3 sm:p-3.5 transition-all cursor-pointer border select-none ${
                isSelected
                  ? isFemale
                    ? 'bg-gradient-to-br from-violet-50/90 to-purple-50/50 border-violet-500/80 shadow-[0_2px_12px_rgba(139,92,246,0.18)] ring-2 ring-violet-500/30'
                    : 'bg-gradient-to-br from-blue-50/90 to-indigo-50/50 border-blue-500/80 shadow-[0_2px_12px_rgba(53,99,245,0.18)] ring-2 ring-blue-500/30'
                  : 'bg-white hover:bg-slate-50/80 border-slate-200/90 shadow-2xs opacity-75 hover:opacity-100'
              } ${disabled ? 'pointer-events-none opacity-50' : ''}`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`size-8 sm:size-9 rounded-xl flex items-center justify-center font-bold text-xs sm:text-sm text-white shadow-2xs ${
                      isFemale
                        ? 'bg-gradient-to-tr from-violet-600 to-fuchsia-500'
                        : 'bg-gradient-to-tr from-blue-600 to-cyan-500'
                    }`}
                  >
                    {mentor.name[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs sm:text-sm font-extrabold text-slate-900 tracking-tight">
                        {mentor.name}
                      </span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                        isFemale ? 'bg-violet-100 text-violet-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {isFemale ? 'Female' : 'Male'}
                      </span>
                    </div>
                    <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium block truncate max-w-[130px] sm:max-w-[200px]">
                      {mentor.role}
                    </span>
                  </div>
                </div>

                {isSelected ? (
                  <CheckCircle2 className={`size-4 sm:size-5 shrink-0 ${
                    isFemale ? 'text-violet-600' : 'text-blue-600'
                  }`} />
                ) : (
                  <div className="size-4 rounded-full border border-slate-300 shrink-0" />
                )}
              </div>

              {/* Voice profile tag */}
              <div className="flex items-center justify-between text-[10px] pt-2 border-t border-slate-200/60 font-mono">
                <span className="text-slate-500 flex items-center gap-1">
                  <Volume2 className="size-3 text-slate-400" />
                  Voice:
                </span>
                <span className={`font-bold truncate max-w-[120px] ${
                  isSelected 
                    ? isFemale ? 'text-violet-900' : 'text-blue-900'
                    : 'text-slate-600'
                }`}>
                  {isFemale ? 'Sophia (Natural)' : 'Marcus (Clear)'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
