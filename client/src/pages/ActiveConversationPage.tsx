import React, { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Mic, 
  MicOff, 
  PhoneOff, 
  Play, 
  Pause, 
  RotateCcw, 
  AlertCircle, 
  CheckCircle2, 
  Lightbulb, 
  Clock, 
  Bot, 
  Layers, 
  ArrowRight,
  ShieldAlert,
  Loader2
} from 'lucide-react';
import { Button, Card, Badge } from '../components/ui';
import { useConversationEngine } from '../hooks/useConversationEngine';

export const ActiveConversationPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const modeParam = searchParams.get('mode') || 'free-conversation';

  const transcriptBottomRef = useRef<HTMLDivElement>(null);

  // Initialize Conversation Engine
  const {
    state,
    messages,
    partialTranscript,
    isMuted,
    errorMessage,
    startConversation,
    togglePause,
    toggleMute,
    endConversation,
    retry
  } = useConversationEngine({
    modeId: modeParam,
    onSessionEnded: (finalMessages) => {
      // Store session messages in sessionStorage for the Generate Notes review
      sessionStorage.setItem('currentSessionMessages', JSON.stringify(finalMessages));
      navigate('/session-complete');
    }
  });

  // Auto-scroll transcript container
  useEffect(() => {
    transcriptBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, partialTranscript]);

  // Extract most recent AI coaching suggestions
  const latestMessageWithGrammar = [...messages].reverse().find(m => m.grammarFeedback);
  const latestMessageWithAlternative = [...messages].reverse().find(m => m.naturalAlternative);

  const getStatusBadge = () => {
    switch (state) {
      case 'idle':
        return <Badge variant="slate" size="sm">Idle</Badge>;
      case 'requesting_permission':
        return <Badge variant="amber" size="sm" dot>Requesting Mic Access</Badge>;
      case 'connecting':
        return <Badge variant="blue" size="sm" dot>Connecting Provider</Badge>;
      case 'listening':
        return <Badge variant="emerald" size="sm" dot>Listening to You</Badge>;
      case 'processing':
        return <Badge variant="blue" size="sm" dot>AI Thinking</Badge>;
      case 'speaking':
        return <Badge variant="blue" size="sm" dot>Mentor Speaking</Badge>;
      case 'paused':
        return <Badge variant="amber" size="sm">Paused</Badge>;
      case 'ending':
        return <Badge variant="slate" size="sm">Finalizing Session</Badge>;
      case 'completed':
        return <Badge variant="emerald" size="sm">Completed</Badge>;
      case 'failed':
        return <Badge variant="rose" size="sm" dot>Connection Failed</Badge>;
    }
  };

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col gap-4 animate-fade-in">
      {/* Top Session Status Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-white border border-slate-200 shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          {getStatusBadge()}
          <span className="text-xs font-bold text-slate-800 capitalize">
            Mode: {modeParam.replace('-', ' ')}
          </span>
          <span className="text-xs text-slate-400 hidden sm:inline">• Interruptible Speech Engine</span>
        </div>

        <div className="flex items-center gap-2">
          {state !== 'idle' && state !== 'failed' && (
            <Button
              variant="outline"
              size="sm"
              onClick={togglePause}
              icon={state === 'paused' ? <Play className="size-3.5" /> : <Pause className="size-3.5" />}
            >
              {state === 'paused' ? 'Resume' : 'Pause'}
            </Button>
          )}

          <Button
            variant="destructive"
            size="sm"
            onClick={endConversation}
            disabled={state === 'idle' || state === 'ending'}
            icon={<PhoneOff className="size-4" />}
          >
            End Conversation
          </Button>
        </div>
      </div>

      {/* Permission or Connection Failure Notice */}
      {errorMessage && (
        <Card variant="subtle" className="border-rose-200 bg-rose-50/70 p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <ShieldAlert className="size-5 text-rose-600 shrink-0" />
            <div className="text-xs font-semibold text-rose-900">
              {errorMessage}
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={retry} icon={<RotateCcw className="size-3.5" />}>
            Retry
          </Button>
        </Card>
      )}

      {/* Main Grid: Avatar & Waveform (7 cols) vs Transcript & Coaching Rail (5 cols) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0">
        {/* Left/Center: 3D Avatar Stage & Audio Controls */}
        <div className="lg:col-span-7 flex flex-col gap-4 min-h-0">
          <Card variant="default" className="flex-1 relative flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950 border-slate-800 p-6 text-white min-h-[300px]">
            {/* Top State Badge */}
            <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
              <span className={`size-2.5 rounded-full ${
                state === 'listening' ? 'bg-emerald-400 animate-ping' :
                state === 'speaking' ? 'bg-blue-400 animate-pulse' :
                state === 'processing' ? 'bg-amber-400 animate-pulse' : 'bg-slate-500'
              }`} />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Mentor State: {state.replace('_', ' ')}
              </span>
            </div>

            {/* Avatar Center Node */}
            <div className="relative flex flex-col items-center justify-center space-y-4">
              <div className={`relative size-36 sm:size-44 rounded-full bg-slate-800/80 border-4 transition-all duration-300 flex items-center justify-center shadow-2xl ${
                state === 'speaking' ? 'border-blue-500/80 scale-105' :
                state === 'listening' ? 'border-emerald-500/80' : 'border-slate-700'
              }`}>
                {state === 'speaking' && (
                  <div className="absolute inset-0 rounded-full border-2 border-blue-400 animate-ping opacity-40"></div>
                )}
                {state === 'listening' && (
                  <div className="absolute inset-0 rounded-full border-2 border-emerald-400 animate-pulse opacity-30"></div>
                )}
                <Bot className={`size-20 transition-colors ${
                  state === 'speaking' ? 'text-blue-400' :
                  state === 'listening' ? 'text-emerald-400' : 'text-slate-400'
                }`} />
              </div>

              <div className="text-center">
                <span className="text-sm font-bold text-slate-200 block">AI English Mentor</span>
                <span className="text-xs text-slate-400 font-medium">Rachel (Patient & Supportive)</span>
              </div>
            </div>

            {/* Simulated Audio Frequency Visualizer */}
            <div className="absolute bottom-6 left-6 right-6 flex items-center justify-center gap-1.5 h-10">
              {[20, 45, 70, 35, 90, 100, 65, 50, 30, 80, 95, 40, 25, 60, 85, 30].map((h, i) => (
                <div
                  key={i}
                  className={`w-1.5 rounded-full transition-all duration-150 ${
                    state === 'speaking' ? 'bg-blue-400' :
                    state === 'listening' ? 'bg-emerald-400' : 'bg-slate-700'
                  }`}
                  style={{
                    height: state === 'speaking' || state === 'listening' ? `${h}%` : '15%',
                    opacity: state === 'speaking' || state === 'listening' ? 0.9 : 0.2
                  }}
                />
              ))}
            </div>
          </Card>

          {/* Interactive Voice Controls Bar */}
          <Card variant="default" className="flex items-center justify-between p-4 shrink-0">
            {state === 'idle' ? (
              <div className="w-full flex items-center justify-between">
                <div>
                  <span className="text-sm font-bold text-slate-900 block">Ready to start?</span>
                  <span className="text-xs text-slate-500">Click below to allow microphone access and connect to Rachel</span>
                </div>
                <Button
                  variant="tactile"
                  size="md"
                  onClick={startConversation}
                  icon={<Mic className="size-4" />}
                >
                  Start Conversation
                </Button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <button
                    onClick={toggleMute}
                    className={`size-11 rounded-xl flex items-center justify-center font-bold transition-all ${
                      isMuted 
                        ? 'bg-rose-50 border border-rose-200 text-rose-600' 
                        : 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm'
                    }`}
                    title={isMuted ? "Unmute microphone" : "Mute microphone"}
                  >
                    {isMuted ? <MicOff className="size-5" /> : <Mic className="size-5" />}
                  </button>

                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-800">
                      {isMuted ? 'Microphone Muted' : state === 'listening' ? 'Listening to You...' : 'Mentor Speaking'}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {isMuted ? 'Click mic icon to resume speaking' : 'You can interrupt Rachel at any time'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">
                    {messages.length} exchanges
                  </span>
                </div>
              </>
            )}
          </Card>
        </div>

        {/* Right: Dual Transcript Stream & Coaching Rail */}
        <div className="lg:col-span-5 flex flex-col gap-4 min-h-0">
          {/* Transcript Panel */}
          <Card variant="default" className="flex-1 flex flex-col min-h-0 overflow-hidden p-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Layers className="size-4 text-blue-600" />
                Live Transcript
              </h3>
              <Badge variant="slate" size="sm">Real-time STT</Badge>
            </div>

            {/* Scrollable Dialogue Stream */}
            <div className="flex-1 overflow-y-auto space-y-3 py-3 pr-1">
              {messages.length === 0 && !partialTranscript && (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                  <Bot className="size-8 mb-2 opacity-50" />
                  <span className="text-xs font-medium">Click "Start Conversation" to begin your session</span>
                </div>
              )}

              {messages.map((item) => (
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

              {/* Streaming Partial Transcript Indicator (Prevents duplicate text) */}
              {partialTranscript && (
                <div className="flex flex-col items-end animate-pulse">
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                      Speaking...
                    </span>
                  </div>
                  <div className="p-3 rounded-2xl text-xs leading-relaxed max-w-[90%] bg-blue-50/70 border border-dashed border-blue-300 text-slate-700 italic rounded-tr-none">
                    "{partialTranscript}..."
                  </div>
                </div>
              )}

              <div ref={transcriptBottomRef} />
            </div>
          </Card>

          {/* Real-Time AI Coaching Rail */}
          <Card variant="subtle" className="space-y-3 shrink-0 border-amber-200 bg-amber-50/50 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-amber-800 font-bold text-xs">
                <Lightbulb className="size-4 text-amber-600" />
                <span>Real-Time Coaching Rail</span>
              </div>
              <Badge variant="amber" size="sm">Active Feedback</Badge>
            </div>

            {/* Grammar Correction Card */}
            {latestMessageWithGrammar?.grammarFeedback ? (
              <div className="bg-white p-3 rounded-xl border border-amber-200 shadow-sm space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 block">
                  Grammar Check:
                </span>
                <div className="flex items-center gap-2 text-xs">
                  <span className="line-through text-slate-400 font-medium">
                    {latestMessageWithGrammar.grammarFeedback.original}
                  </span>
                  <ArrowRight className="size-3 text-slate-400" />
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    {latestMessageWithGrammar.grammarFeedback.suggested}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 font-medium pt-1">
                  {latestMessageWithGrammar.grammarFeedback.explanation}
                </p>
              </div>
            ) : (
              <div className="text-xs text-slate-500 italic bg-white/70 p-2.5 rounded-xl border border-slate-200/60">
                Listening for grammar patterns and verb tenses...
              </div>
            )}

            {/* Natural Phrasing Alternative */}
            {latestMessageWithAlternative?.naturalAlternative && (
              <div className="bg-white p-3 rounded-xl border border-blue-200 shadow-sm space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block">
                  More Natural Native Expression:
                </span>
                <p className="text-xs font-semibold text-slate-800 italic">
                  "{latestMessageWithAlternative.naturalAlternative}"
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
