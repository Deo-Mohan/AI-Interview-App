import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Mic, 
  MicOff, 
  PhoneOff, 
  Volume2, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Lightbulb, 
  Clock, 
  Bot, 
  User, 
  Layers,
  ArrowRight
} from 'lucide-react';
import { Button, Card, Badge } from '../components/ui';

interface TranscriptItem {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  correction?: {
    original: string;
    suggested: string;
    tip: string;
  };
  naturalAlternative?: string;
}

export const ActiveConversationPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const modeParam = searchParams.get('mode') || 'free-conversation';

  // Voice Interaction State
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [mentorState, setMentorState] = useState<'idle' | 'listening' | 'speaking'>('speaking');
  const [elapsedSeconds, setElapsedSeconds] = useState(82); // Initial simulated timer

  // Dual Transcript Stream
  const [transcripts, setTranscripts] = useState<TranscriptItem[]>([
    {
      id: 't-1',
      sender: 'ai',
      text: "Hello Krish! It's fantastic to connect. Today we are focusing on your tech interview communication. Could you briefly introduce yourself and describe a recent architectural challenge you resolved?",
      timestamp: '00:05'
    },
    {
      id: 't-2',
      sender: 'user',
      text: "Sure! In my last project, I didn't knew how to scale the real-time cache. So we discuss about Redis replication with the team.",
      timestamp: '00:32',
      correction: {
        original: "didn't knew",
        suggested: "didn't know",
        tip: "Past tense is already carried by 'did/didn't', so use the base verb 'know'."
      },
      naturalAlternative: "We evaluated Redis replication strategies to handle our throughput constraints."
    },
    {
      id: 't-3',
      sender: 'ai',
      text: "That sounds like a great engineering problem to tackle. When you implemented Redis replication, how did you handle data consistency and potential read latency across replicas?",
      timestamp: '00:48'
    }
  ]);

  // Real-time Coaching Rail Highlights
  const activeCorrection = transcripts.find(t => t.correction)?.correction;
  const activeAlternative = transcripts.find(t => t.naturalAlternative)?.naturalAlternative;

  // Timer Tick
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndSession = () => {
    navigate('/session-complete');
  };

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col gap-4 animate-fade-in">
      {/* Top Session Status Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-white border border-slate-200 shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <Badge variant="rose" size="sm" dot>Live Session</Badge>
          <span className="text-xs font-bold text-slate-800 capitalize">
            Mode: {modeParam.replace('-', ' ')}
          </span>
          <span className="text-xs text-slate-400">• Web Speech API Active</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full">
            <Clock className="size-3.5 text-blue-600" />
            <span>{formatTimer(elapsedSeconds)}</span>
          </div>

          <Button
            variant="destructive"
            size="sm"
            onClick={handleEndSession}
            icon={<PhoneOff className="size-4" />}
          >
            End & Generate Notes
          </Button>
        </div>
      </div>

      {/* Main Grid: Avatar & Waveform (Left/Center) vs Transcript & Coaching Rail (Right) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0">
        {/* Left/Center: 3D Avatar Workspace & Audio Controls (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4 min-h-0">
          {/* Avatar Canvas Stage */}
          <Card variant="default" className="flex-1 relative flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950 border-slate-800 p-6 text-white min-h-[300px]">
            {/* Status floating badge */}
            <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
              <span className="size-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Mentor State: {mentorState}
              </span>
            </div>

            {/* 3D Avatar Center Placeholder for Phase 3 */}
            <div className="relative flex flex-col items-center justify-center space-y-4">
              <div className="relative size-36 sm:size-44 rounded-full bg-slate-800/80 border-4 border-blue-500/30 flex items-center justify-center shadow-2xl">
                {/* Visual pulse ring */}
                {mentorState === 'speaking' && (
                  <div className="absolute inset-0 rounded-full border-2 border-blue-400 animate-ping opacity-40"></div>
                )}
                <Bot className="size-20 text-blue-400" />
              </div>

              <div className="text-center">
                <span className="text-sm font-bold text-slate-200 block">AI English Mentor</span>
                <span className="text-xs text-slate-400 font-medium">Rachel (Patient & Supportive)</span>
              </div>
            </div>

            {/* Simulated Audio Frequency Visualizer */}
            <div className="absolute bottom-6 left-6 right-6 flex items-center justify-center gap-1.5 h-10">
              {[18, 35, 60, 42, 85, 95, 68, 55, 30, 75, 90, 45, 20, 65, 80, 40].map((h, i) => (
                <div
                  key={i}
                  className="w-1.5 bg-blue-500 rounded-full transition-all duration-150"
                  style={{
                    height: mentorState === 'speaking' ? `${h}%` : '20%',
                    opacity: mentorState === 'speaking' ? 0.9 : 0.3
                  }}
                />
              ))}
            </div>
          </Card>

          {/* Interactive Voice Controls Bar */}
          <Card variant="default" className="flex items-center justify-between p-4 shrink-0">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMicMuted(!isMicMuted)}
                className={`size-11 rounded-xl flex items-center justify-center font-bold transition-all ${
                  isMicMuted 
                    ? 'bg-rose-50 border border-rose-200 text-rose-600' 
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm'
                }`}
                title={isMicMuted ? "Unmute microphone" : "Mute microphone"}
              >
                {isMicMuted ? <MicOff className="size-5" /> : <Mic className="size-5" />}
              </button>

              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-800">
                  {isMicMuted ? 'Microphone Muted' : 'Microphone Listening'}
                </span>
                <span className="text-[11px] text-slate-400">
                  {isMicMuted ? 'Click to speak' : 'Speak naturally anytime'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMentorState(mentorState === 'speaking' ? 'listening' : 'speaking')}
              >
                Toggle Demo Lip-Sync
              </Button>
            </div>
          </Card>
        </div>

        {/* Right: Dual Transcript Stream & Coaching Rail (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4 min-h-0">
          {/* Transcript Panel */}
          <Card variant="default" className="flex-1 flex flex-col min-h-0 overflow-hidden p-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Layers className="size-4 text-blue-600" />
                Live Transcript
              </h3>
              <Badge variant="slate" size="sm">Auto-scrolling</Badge>
            </div>

            {/* Scrollable Dialogue Stream */}
            <div className="flex-1 overflow-y-auto space-y-3 py-3 pr-1">
              {transcripts.map((item) => (
                <div
                  key={item.id}
                  className={`flex flex-col ${item.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {item.sender === 'user' ? 'You' : 'AI Mentor'}
                    </span>
                    <span className="font-mono text-[9px] text-slate-400">{item.timestamp}</span>
                  </div>

                  <div
                    className={`p-3 rounded-2xl text-xs leading-relaxed max-w-[90%] ${
                      item.sender === 'user'
                        ? 'bg-blue-50 border border-blue-200 text-slate-900 rounded-tr-none'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm'
                    }`}
                  >
                    {item.text}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Real-Time AI Coaching Rail */}
          <Card variant="subtle" className="space-y-3 shrink-0 border-amber-200 bg-amber-50/50 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-amber-800 font-bold text-xs">
                <Lightbulb className="size-4 text-amber-600" />
                <span>Real-Time Coaching Rail</span>
              </div>
              <Badge variant="amber" size="sm">Gentle Feedback</Badge>
            </div>

            {/* Grammar Correction Card */}
            {activeCorrection && (
              <div className="bg-white p-3 rounded-xl border border-amber-200 shadow-sm space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 block">
                  Grammar Check:
                </span>
                <div className="flex items-center gap-2 text-xs">
                  <span className="line-through text-slate-400 font-medium">{activeCorrection.original}</span>
                  <ArrowRight className="size-3 text-slate-400" />
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                    {activeCorrection.suggested}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 font-medium pt-1">
                  {activeCorrection.tip}
                </p>
              </div>
            )}

            {/* Natural Phrasing Alternative */}
            {activeAlternative && (
              <div className="bg-white p-3 rounded-xl border border-blue-200 shadow-sm space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block">
                  Natural Everyday Expression:
                </span>
                <p className="text-xs font-semibold text-slate-800 italic">
                  "{activeAlternative}"
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
