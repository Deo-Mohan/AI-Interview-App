import React, { useState, useEffect } from 'react';
import { MentorGender } from '../types/engine';
import { MENTORS } from '../data/mentors';
import { 
  X, 
  Volume2, 
  Play, 
  RotateCcw, 
  Sliders, 
  Sparkles, 
  Globe, 
  Check 
} from 'lucide-react';
import { Button, Badge } from './ui';

interface VoiceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMentor: MentorGender;
  speechRate: number;
  onSpeechRateChange: (rate: number) => void;
  speechPitch: number;
  onSpeechPitchChange: (pitch: number) => void;
  selectedVoiceUri: string;
  onVoiceUriChange: (uri: string) => void;
  onTestVoice: (sampleText?: string) => void;
}

export const VoiceSettingsModal: React.FC<VoiceSettingsModalProps> = ({
  isOpen,
  onClose,
  selectedMentor,
  speechRate,
  onSpeechRateChange,
  speechPitch,
  onSpeechPitchChange,
  selectedVoiceUri,
  onVoiceUriChange,
  onTestVoice,
}) => {
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const mentor = MENTORS[selectedMentor];

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const updateVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        // Filter english voices
        const english = voices.filter(v => v.lang.toLowerCase().startsWith('en'));
        setAvailableVoices(english.length > 0 ? english : voices);
      };

      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  if (!isOpen) return null;

  const handleResetDefaults = () => {
    onSpeechRateChange(1.0);
    onSpeechPitchChange(selectedMentor === 'male' ? 0.92 : 1.05);
    onVoiceUriChange('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center font-bold">
              <Sliders className="size-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                Voice & Speech Calibration
                <Badge variant={selectedMentor === 'female' ? 'blue' : 'slate'} size="sm">
                  {mentor.name}
                </Badge>
              </h3>
              <p className="text-xs text-slate-500">
                Adjust speaking pace, pitch, and operating system synthetic voices.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="size-8 rounded-lg hover:bg-slate-200/60 text-slate-500 flex items-center justify-center transition cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 overflow-y-auto max-h-[75vh]">
          {/* Active Profile Info */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-slate-50 to-blue-50/40 border border-slate-200/80 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-extrabold text-sm shadow-xs">
                {mentor.name[0]}
              </div>
              <div>
                <span className="text-xs font-extrabold text-slate-900 block">
                  {mentor.name} ({selectedMentor === 'female' ? 'Female Mentor' : 'Male Mentor'})
                </span>
                <span className="text-[11px] text-slate-500 block">
                  Default profile: <strong className="text-slate-700">{mentor.voiceName}</strong>
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onTestVoice()}
              icon={<Play className="size-3 text-blue-600" />}
              className="text-xs"
            >
              Test Voice
            </Button>
          </div>

          {/* Speech Rate Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800">
              <span>Speaking Speed (Cadence)</span>
              <span className="font-mono text-blue-600">{speechRate.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.80"
              max="1.25"
              step="0.05"
              value={speechRate}
              onChange={(e) => onSpeechRateChange(parseFloat(e.target.value))}
              className="w-full accent-blue-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-medium">
              <span>0.80x (Deliberate Learning)</span>
              <span>1.00x (Natural Pace)</span>
              <span>1.25x (Fast Conversational)</span>
            </div>
          </div>

          {/* Speech Pitch Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800">
              <span>Voice Pitch</span>
              <span className="font-mono text-blue-600">{speechPitch.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.75"
              max="1.30"
              step="0.05"
              value={speechPitch}
              onChange={(e) => onSpeechPitchChange(parseFloat(e.target.value))}
              className="w-full accent-blue-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-medium">
              <span>Lower / Deeper (0.75)</span>
              <span>Balanced</span>
              <span>Higher / Brighter (1.30)</span>
            </div>
          </div>

          {/* OS Voice Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800">
              <span className="flex items-center gap-1.5">
                <Globe className="size-3.5 text-slate-500" />
                Browser / OS Synthesizer Voice Override
              </span>
              {selectedVoiceUri && (
                <button
                  onClick={() => onVoiceUriChange('')}
                  className="text-[10px] text-blue-600 hover:underline cursor-pointer"
                >
                  Clear Override
                </button>
              )}
            </div>
            <select
              value={selectedVoiceUri}
              onChange={(e) => onVoiceUriChange(e.target.value)}
              className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
            >
              <option value="">Auto-detected ({selectedMentor === 'female' ? 'Natural Female' : 'Natural Male'})</option>
              {availableVoices.map((v) => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
            <span className="text-[11px] text-slate-500 block">
              Auto-detect automatically selects high-definition neural voices matching the active mentor.
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetDefaults}
            icon={<RotateCcw className="size-3.5" />}
            className="text-xs text-slate-600"
          >
            Reset Defaults
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={onClose}
            className="text-xs"
          >
            Done
          </Button>
        </div>
      </div>
    </div>
  );
};
