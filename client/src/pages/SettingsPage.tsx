import React, { useState } from 'react';
import { 
  Settings, 
  Key, 
  ShieldCheck, 
  Mic, 
  Volume2, 
  Server, 
  CheckCircle2, 
  AlertCircle,
  RefreshCw,
  Sliders
} from 'lucide-react';
import { Button, Card, Badge } from '../components/ui';

export const SettingsPage: React.FC = () => {
  const [llmProvider, setLlmProvider] = useState<'openai' | 'anthropic' | 'gemini'>('openai');
  const [sttProvider, setSttProvider] = useState<'whisper' | 'browser'>('browser');
  const [ttsProvider, setTtsProvider] = useState<'elevenlabs' | 'browser'>('browser');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Settings & Provider Architecture
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          Configure AI intelligence models, audio synthesis engines, speech-to-text fallbacks, and security policies
        </p>
      </div>

      {/* Security Architecture Notice */}
      <Card variant="subtle" className="border-blue-200 bg-blue-50/60 p-4 flex items-start gap-3">
        <ShieldCheck className="size-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs text-blue-900 leading-relaxed font-medium">
          <span className="font-bold block">Zero Client Secrets Architecture</span>
          <p>
            All provider secret keys (OpenAI, Anthropic, ElevenLabs, Supabase Service Role) reside strictly in the server-side environment. The browser never receives or transmits sensitive API credentials.
          </p>
        </div>
      </Card>

      {/* LLM Intelligence Provider */}
      <Card variant="default" className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Server className="size-5 text-slate-700" />
            <h3 className="text-base font-bold text-slate-900">LLM Conversational Engine</h3>
          </div>
          <Badge variant="blue" size="sm">Backend Proxy</Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { id: 'openai', name: 'OpenAI (GPT-4o / GPT-4o-mini)', desc: 'High responsiveness, excellent conversational latency.' },
            { id: 'anthropic', name: 'Anthropic (Claude 3.5 Sonnet)', desc: 'Exceptional pedagogical nuance and natural grammar coaching.' },
            { id: 'gemini', name: 'Google Gemini (1.5 Flash / Pro)', desc: 'Ultra-fast multimodal processing and low latency.' },
          ].map(p => (
            <div
              key={p.id}
              onClick={() => setLlmProvider(p.id as any)}
              className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                llmProvider === p.id
                  ? 'bg-blue-50/50 border-blue-600 ring-2 ring-blue-600/20'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <span className="text-sm font-bold text-slate-900 block mb-1">{p.name}</span>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">{p.desc}</p>
              </div>
              <div className="pt-3 mt-3 border-t border-slate-100">
                <span className={`text-[11px] font-bold ${llmProvider === p.id ? 'text-blue-600' : 'text-slate-400'}`}>
                  {llmProvider === p.id ? '✓ Selected Provider' : 'Select'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Speech-to-Text (STT) Settings */}
      <Card variant="default" className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Mic className="size-5 text-slate-700" />
            <h3 className="text-base font-bold text-slate-900">Speech-to-Text (STT) Adapter</h3>
          </div>
          <Badge variant="emerald" size="sm">Zero Latency Local Fallback</Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div
            onClick={() => setSttProvider('browser')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              sttProvider === 'browser'
                ? 'bg-blue-50/50 border-blue-600 ring-2 ring-blue-600/20'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <span className="text-sm font-bold text-slate-900 block mb-1">Web Speech API (Browser Native)</span>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Zero additional cost, instantaneous transcription, works completely offline in supported browsers.
            </p>
          </div>

          <div
            onClick={() => setSttProvider('whisper')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              sttProvider === 'whisper'
                ? 'bg-blue-50/50 border-blue-600 ring-2 ring-blue-600/20'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <span className="text-sm font-bold text-slate-900 block mb-1">Whisper Cloud Adapter (Server Proxy)</span>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Superior accuracy for accented speech and noisy environments.
            </p>
          </div>
        </div>
      </Card>

      {/* Text-to-Speech (TTS) Settings */}
      <Card variant="default" className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Volume2 className="size-5 text-slate-700" />
            <h3 className="text-base font-bold text-slate-900">Text-to-Speech (TTS) & Voice Synthesis</h3>
          </div>
          <Badge variant="blue" size="sm">Realistic Mentor Voice</Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div
            onClick={() => setTtsProvider('browser')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              ttsProvider === 'browser'
                ? 'bg-blue-50/50 border-blue-600 ring-2 ring-blue-600/20'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <span className="text-sm font-bold text-slate-900 block mb-1">Web SpeechSynthesis (Native Browser)</span>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Default fallback requiring no third-party API keys or external quotas.
            </p>
          </div>

          <div
            onClick={() => setTtsProvider('elevenlabs')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              ttsProvider === 'elevenlabs'
                ? 'bg-blue-50/50 border-blue-600 ring-2 ring-blue-600/20'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <span className="text-sm font-bold text-slate-900 block mb-1">ElevenLabs Neural Voice (Ultra-Realistic)</span>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Human-grade intonation, empathetic cadence, and natural pauses.
            </p>
          </div>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex items-center justify-end gap-3 pt-2">
        {isSaved && (
          <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
            <CheckCircle2 className="size-4" /> Preferences saved!
          </span>
        )}
        <Button
          variant="tactile"
          size="md"
          onClick={handleSave}
        >
          Save Configuration
        </Button>
      </div>
    </div>
  );
};
