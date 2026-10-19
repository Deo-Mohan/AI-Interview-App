import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
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
  Loader2,
  Key,
  VolumeX,
  Volume2,
  Award,
  Sparkles,
  ChevronRight,
  X,
  TrendingUp,
  FileText
} from 'lucide-react';
import { Button, Card, Badge } from '../components/ui';
import { Avatar3DCanvas } from '../components/Avatar3DCanvas';
import { TalkingAvatarIntegration } from '../components/TalkingAvatarIntegration';
import { useConversationEngine } from '../hooks/useConversationEngine';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { PageTransition, ReactiveAudioWaveform, PulseBeacon } from '../components/motion/MotionTransitions';

export const ActiveConversationPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const modeParam = searchParams.get('mode') || 'free-conversation';

  const transcriptBottomRef = useRef<HTMLDivElement>(null);
  const [hasCheckedCreds, setHasCheckedCreds] = useState(false);
  const [isConfigured, setIsConfigured] = useState(true);

  // Check if AI provider credentials are configured
  useEffect(() => {
    fetch('http://localhost:5000/api/credentials/status')
      .then(r => r.json())
      .then(data => {
        setIsConfigured(Boolean(data.isConfigured));
        setHasCheckedCreds(true);
      })
      .catch(() => {
        setIsConfigured(true);
        setHasCheckedCreds(true);
      });
  }, []);

  const [avatarEngine, setAvatarEngine] = useState<'studio' | 'sdk'>('studio');
  const [showReportModal, setShowReportModal] = useState<boolean>(false);

  const {
    state,
    messages,
    partialTranscript,
    isMuted,
    isPaused,
    durationSeconds,
    errorMessage,
    startConversation,
    pauseConversation,
    resumeConversation,
    toggleMute,
    endConversation,
    retry,
    interruptSpeech,
    interviewStage,
    interviewQuestionIndex,
    interviewTotalQuestions,
    interviewCategory,
    latestEvaluation,
    finalInterviewReport,
  } = useConversationEngine({
    mode: modeParam,
    onSessionEnd: (notes: any) => {
      navigate('/session-complete', { state: { notes } });
    },
  });

  // When final interview report arrives, open report modal
  useEffect(() => {
    if (finalInterviewReport) {
      setShowReportModal(true);
    }
  }, [finalInterviewReport]);

  // Auto-scroll transcript to bottom smoothly
  useEffect(() => {
    transcriptBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, partialTranscript]);

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getModeTitle = (id: string) => {
    switch (id) {
      case 'resume-interview': return 'Resume-Aware Technical & HR Mock';
      case 'scenario-roleplay': return 'Real-World Scenario Roleplay';
      case 'office-english': return 'Office & Workplace Communication';
      case 'free-conversation': return 'Casual Free Conversation';
      case 'topic-discussion': return 'Topic Discussion & Group Debate';
      default: return 'English Mentorship Session';
    }
  };

  // Find latest message with grammar feedback or alternatives for the coaching rail
  const latestMessageWithGrammar = [...messages].reverse().find(m => m.grammarFeedback);
  const latestMessageWithAlternative = [...messages].reverse().find(m => m.naturalAlternative);

  return (
    <PageTransition className="h-[calc(100vh-6.5rem)] flex flex-col gap-4">
      {/* Missing BYOK Warning Banner */}
      {hasCheckedCreds && !isConfigured && (
        <Card variant="subtle" className="border-amber-200 bg-amber-50/90 p-3.5 flex items-center justify-between shrink-0 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-lg bg-amber-100 border border-amber-300 text-amber-700 flex items-center justify-center shrink-0">
              <Key className="size-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-amber-950 block">No AI Provider Configured</span>
              <span className="text-[11px] text-amber-800">
                To enable live speech responses from Krish AI, add your personal Gemini, OpenAI, or Anthropic API key.
              </span>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/settings')}
            className="border-amber-300 text-amber-900 hover:bg-amber-100 shrink-0 font-bold"
          >
            Configure Key →
          </Button>
        </Card>
      )}

      {/* Top Session Status Ribbon */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 sm:px-5 rounded-2xl border border-slate-200/90 shadow-2xs shrink-0">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0 font-bold">
            <Bot className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-extrabold text-slate-900 tracking-tight">
                {getModeTitle(modeParam)}
              </h2>
              {modeParam === 'resume-interview' ? (
                <>
                  <Badge variant="blue" size="sm">Q{interviewQuestionIndex + 1} of {interviewTotalQuestions}</Badge>
                  <Badge variant="slate" size="sm">{interviewStage}</Badge>
                </>
              ) : (
                <Badge variant="blue" size="sm">Active Mode</Badge>
              )}
            </div>
            <span className="text-xs text-slate-500 font-medium">
              {modeParam === 'resume-interview' ? (
                <>Category: <strong className="text-slate-800 capitalize">{interviewCategory.replace(/_/g, ' ')}</strong> • Role: Senior Full Stack Engineer</>
              ) : (
                'Target CEFR: B2-C1 • Live Pronunciation & Grammar Coach'
              )}
            </span>
          </div>
        </div>

        {/* Live Audio & Duration Indicators */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          {finalInterviewReport && (
            <Button
              variant="tactile"
              size="sm"
              onClick={() => setShowReportModal(true)}
              className="bg-emerald-600 text-white hover:bg-emerald-500 text-xs"
            >
              <Award className="size-3.5 mr-1" /> View Final Report
            </Button>
          )}

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-slate-700 shadow-2xs">
            <Clock className="size-3.5 text-blue-600" />
            <span>{formatTimer(durationSeconds)}</span>
          </div>

          <Button
            variant="destructive"
            size="sm"
            onClick={endConversation}
            disabled={state === 'idle' || state === 'ending'}
            icon={<PhoneOff className="size-4" />}
          >
            End Session
          </Button>
        </div>
      </div>

      {/* Permission or Connection Failure Notice */}
      {errorMessage && (
        <Card variant="subtle" className="border-rose-200 bg-rose-50/80 p-4 flex items-center justify-between shrink-0 shadow-2xs">
          <div className="flex items-center gap-3">
            <ShieldAlert className="size-5 text-rose-600 shrink-0" />
            <div className="text-xs font-bold text-rose-900">
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
          <Card variant="default" className="flex-1 relative flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-slate-800 p-2 sm:p-4 text-white min-h-[340px] shadow-lg">
            {/* Top State Badge with Pulse Beacon */}
            <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700/80 shadow-md">
              <PulseBeacon 
                variant={
                  state === 'listening' ? 'emerald' : 
                  state === 'speaking' ? 'blue' : 
                  state === 'processing' ? 'amber' : 'slate'
                } 
                size="sm" 
              />
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-200 font-mono">
                Krish AI: {state.replace('_', ' ')}
              </span>
            </div>

            {/* Top-Right Avatar Engine Switcher */}
            <div className="absolute top-4 right-4 z-10 flex items-center bg-slate-900/90 backdrop-blur-md p-1 rounded-lg border border-slate-700/80 text-[10px] font-bold">
              <button
                onClick={() => setAvatarEngine('studio')}
                className={`px-2 py-1 rounded transition-all ${
                  avatarEngine === 'studio' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Studio Rig
              </button>
              <button
                onClick={() => setAvatarEngine('sdk')}
                className={`px-2 py-1 rounded transition-all ${
                  avatarEngine === 'sdk' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                talking-avatar SDK
              </button>
            </div>

            {/* 3D Human-like Avatar Canvas (Protected by ErrorBoundary) */}
            <ErrorBoundary name="3D Mentor Avatar">
              {avatarEngine === 'studio' ? (
                <Avatar3DCanvas state={state} className="w-full h-full" />
              ) : (
                <TalkingAvatarIntegration
                  state={state}
                  className="w-full h-full"
                  onFallback={() => setAvatarEngine('studio')}
                />
              )}
            </ErrorBoundary>

            {/* Reactive Dynamic Audio Waveform Overlay */}
            <div className="absolute bottom-4 left-6 right-6 pointer-events-none z-10">
              <ReactiveAudioWaveform
                isActive={state !== 'idle'}
                state={state === 'processing' ? 'thinking' : state as any}
                barCount={22}
                className="max-w-md mx-auto"
              />
            </div>
          </Card>

          {/* Interactive Voice Controls Bar */}
          <Card variant="default" className="flex items-center justify-between p-4 shrink-0 shadow-2xs border-slate-200">
            {state === 'idle' ? (
              <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <span className="text-sm font-extrabold text-slate-900 block tracking-tight">Ready to start?</span>
                  <span className="text-xs text-slate-500 font-medium">Click below to allow microphone access and connect to Krish AI</span>
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
                    className={`size-11 rounded-xl flex items-center justify-center font-bold transition-all cursor-pointer ${
                      isMuted 
                        ? 'bg-rose-50 border border-rose-200 text-rose-600 shadow-2xs' 
                        : 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm'
                    }`}
                    title={isMuted ? "Unmute microphone" : "Mute microphone"}
                  >
                    {isMuted ? <MicOff className="size-5" /> : <Mic className="size-5" />}
                  </button>

                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-800">
                      {isMuted ? 'Microphone Muted' : 'Microphone Live'}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {isMuted ? 'Krish AI is not listening' : 'Speak naturally anytime'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {state === 'speaking' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={interruptSpeech}
                      icon={<VolumeX className="size-3.5 text-rose-600" />}
                      className="border-rose-200 text-rose-700 hover:bg-rose-50"
                    >
                      Interrupt
                    </Button>
                  )}

                  {isPaused ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={resumeConversation}
                      icon={<Play className="size-3.5 text-emerald-600" />}
                    >
                      Resume
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={pauseConversation}
                      icon={<Pause className="size-3.5 text-slate-600" />}
                    >
                      Pause
                    </Button>
                  )}
                </div>
              </>
            )}
          </Card>
        </div>

        {/* Right: Live Transcript & Real-Time AI Coaching Rail (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4 min-h-0">
          {/* Transcript Panel */}
          <Card variant="default" className="flex-1 flex flex-col min-h-0 overflow-hidden p-4 shadow-2xs border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 tracking-tight">
                <Layers className="size-4 text-blue-600" />
                Live Transcript
              </h3>
              <Badge variant="slate" size="sm">Real-time STT</Badge>
            </div>

            {/* Scrollable Dialogue Stream with Motion Entrance */}
            <div className="flex-1 overflow-y-auto space-y-3.5 py-3 pr-1">
              {messages.length === 0 && !partialTranscript && (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                  <Bot className="size-8 mb-2 opacity-50" />
                  <span className="text-xs font-semibold">Click "Start Conversation" to begin your practice</span>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
                    Krish AI will greet you and guide the conversation according to your chosen practice mode.
                  </p>
                </div>
              )}

              <AnimatePresence initial={false}>
                {messages.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex flex-col ${item.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 px-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                        {item.sender === 'user' ? 'You' : 'Krish AI (Mentor)'}
                      </span>
                      <span className="font-mono text-[9px] text-slate-400">{item.timestamp}</span>
                    </div>

                    <div
                      className={`p-3.5 rounded-2xl text-xs leading-relaxed max-w-[90%] ${
                        item.sender === 'user'
                          ? 'bg-blue-600 text-white font-medium rounded-tr-none shadow-xs'
                          : 'bg-slate-50 border border-slate-200 text-slate-800 font-medium rounded-tl-none shadow-2xs'
                      }`}
                    >
                      {item.text}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Streaming Partial Transcript Indicator */}
              {partialTranscript && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-end"
                >
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1">
                      <span className="size-1.5 rounded-full bg-blue-600 animate-ping"></span>
                      Listening...
                    </span>
                  </div>
                  <div className="p-3 rounded-2xl text-xs leading-relaxed max-w-[90%] bg-blue-50/80 border border-dashed border-blue-300 text-slate-700 italic rounded-tr-none">
                    "{partialTranscript}..."
                  </div>
                </motion.div>
              )}

              <div ref={transcriptBottomRef} />
            </div>
          </Card>

          {/* Real-Time AI Coaching Rail / Candidate Evaluation (Protected by ErrorBoundary) */}
          <ErrorBoundary name="Real-Time Coaching Rail" compact>
            <Card variant="subtle" className="space-y-3 shrink-0 border-amber-200/90 bg-amber-50/40 p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-amber-900 font-extrabold text-xs">
                  <Lightbulb className="size-4 text-amber-600" />
                  <span>{modeParam === 'resume-interview' ? 'Candidate Evaluation Rail' : 'Real-Time Coaching Rail'}</span>
                </div>
                {finalInterviewReport ? (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setShowReportModal(true)}
                    className="text-[11px] font-bold px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white"
                  >
                    <Award className="size-3 mr-1" /> View Final Scorecard
                  </Button>
                ) : (
                  <Badge variant="amber" size="sm" dot>Active Feedback</Badge>
                )}
              </div>

              {/* In Interview Mode: Show Technical vs Fluency Dual Score & Follow-up alert */}
              {modeParam === 'resume-interview' && latestEvaluation ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-2.5"
                >
                  {/* Dual Score Cards */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white p-2.5 rounded-xl border border-blue-200 shadow-2xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700">Technical Depth</span>
                        <span className="text-xs font-mono font-extrabold text-blue-900">{latestEvaluation.technicalCorrectnessScore}/100</span>
                      </div>
                      <p className="text-[11px] text-slate-600 line-clamp-3 leading-tight">{latestEvaluation.technicalCritique}</p>
                    </div>

                    <div className="bg-white p-2.5 rounded-xl border border-emerald-200 shadow-2xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">English Fluency</span>
                        <span className="text-xs font-mono font-extrabold text-emerald-900">{latestEvaluation.englishFluencyScore}/100</span>
                      </div>
                      <p className="text-[11px] text-slate-600 line-clamp-3 leading-tight">{latestEvaluation.englishCritique}</p>
                    </div>
                  </div>

                  {/* Vague or Incomplete Follow-up Alert */}
                  {latestEvaluation.isVagueOrIncomplete && (
                    <div className="bg-amber-100/90 border border-amber-300 p-2.5 rounded-xl text-amber-950 text-xs flex items-start gap-2 shadow-2xs">
                      <AlertCircle className="size-4 text-amber-700 shrink-0 mt-0.5" />
                      <div>
                        <strong className="block text-[11px] uppercase tracking-wider">Follow-Up Probing Active</strong>
                        <span className="text-[11px] leading-tight">Interviewer detected generic or incomplete answer. Probing deeper into metrics and implementation.</span>
                      </div>
                    </div>
                  )}

                  {/* Grammar Correction */}
                  {latestEvaluation.grammarCorrections?.[0] && (
                    <div className="bg-white p-3 rounded-xl border border-amber-200 shadow-2xs space-y-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-600 block">Grammar Refinement:</span>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="line-through text-slate-400 font-medium">{latestEvaluation.grammarCorrections[0].original}</span>
                        <ArrowRight className="size-3 text-slate-400" />
                        <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {latestEvaluation.grammarCorrections[0].suggested}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 pt-0.5">{latestEvaluation.grammarCorrections[0].explanation}</p>
                    </div>
                  )}

                  {/* Natural Native Executive Alternative */}
                  {latestEvaluation.naturalNativeAlternative && (
                    <div className="bg-white p-3 rounded-xl border border-blue-200 shadow-2xs space-y-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 block">Recommended Executive Phrasing:</span>
                      <p className="text-xs font-semibold text-slate-800 italic bg-blue-50/50 p-2 rounded-lg border border-blue-100 leading-relaxed">
                        "{latestEvaluation.naturalNativeAlternative}"
                      </p>
                    </div>
                  )}
                </motion.div>
              ) : (
                /* Standard Non-interview Rail */
                <>
                  {latestMessageWithGrammar?.grammarFeedback ? (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-2xs space-y-1.5"
                    >
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-600 block">
                        Grammar Diagnostic:
                      </span>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="line-through text-slate-400 font-medium">
                          {latestMessageWithGrammar.grammarFeedback.original}
                        </span>
                        <ArrowRight className="size-3 text-slate-400" />
                        <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {latestMessageWithGrammar.grammarFeedback.suggested}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 font-medium pt-1">
                        {latestMessageWithGrammar.grammarFeedback.explanation}
                      </p>
                    </motion.div>
                  ) : (
                    <div className="text-xs text-slate-500 font-medium italic bg-white/80 p-2.5 rounded-xl border border-slate-200/60">
                      {modeParam === 'resume-interview' ? 'Listening to candidate response for technical correctness and communication...' : 'Listening for grammar patterns, verb tenses, and natural phrasing...'}
                    </div>
                  )}

                  {latestMessageWithAlternative?.naturalAlternative && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white p-3.5 rounded-xl border border-blue-200 shadow-2xs space-y-1"
                    >
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 block">
                        More Natural Native Expression:
                      </span>
                      <p className="text-xs font-semibold text-slate-800 italic bg-blue-50/50 p-2 rounded-lg border border-blue-100">
                        "{latestMessageWithAlternative.naturalAlternative}"
                      </p>
                    </motion.div>
                  )}
                </>
              )}
            </Card>
          </ErrorBoundary>
        </div>
      </div>

      {/* Comprehensive Final Interview Report Modal */}
      <AnimatePresence>
        {showReportModal && finalInterviewReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
                    <Award className="size-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">Executive Technical Interview Report</h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Evaluated Seniority: <strong>{finalInterviewReport.calibratedSeniority}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge 
                    variant={
                      finalInterviewReport.hiringRecommendation === 'Strong Hire' ? 'emerald' :
                      finalInterviewReport.hiringRecommendation === 'Hire' ? 'blue' :
                      finalInterviewReport.hiringRecommendation === 'Leaning Hire' ? 'amber' : 'rose'
                    }
                    size="md"
                    dot
                  >
                    {finalInterviewReport.hiringRecommendation}
                  </Badge>
                  <button
                    onClick={() => setShowReportModal(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                  >
                    <X className="size-5" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-6">
                {/* Score Comparison Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200">
                    <span className="text-xs font-bold text-blue-800 uppercase tracking-wider block mb-1">Overall Technical Depth</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-extrabold text-blue-950 font-mono">{finalInterviewReport.overallTechnicalScore}</span>
                      <span className="text-xs text-blue-700 font-medium">/ 100</span>
                    </div>
                    <div className="w-full bg-blue-200 h-2 rounded-full mt-2 overflow-hidden">
                      <div className="bg-blue-600 h-full rounded-full" style={{ width: `${finalInterviewReport.overallTechnicalScore}%` }} />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200">
                    <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block mb-1">Overall English Fluency</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-extrabold text-emerald-950 font-mono">{finalInterviewReport.overallFluencyScore}</span>
                      <span className="text-xs text-emerald-700 font-medium">/ 100</span>
                    </div>
                    <div className="w-full bg-emerald-200 h-2 rounded-full mt-2 overflow-hidden">
                      <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${finalInterviewReport.overallFluencyScore}%` }} />
                    </div>
                  </div>
                </div>

                {/* Key Strengths & Growth Areas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 uppercase tracking-wider">
                      <CheckCircle2 className="size-4" /> Key Strengths
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-700">
                      {finalInterviewReport.keyStrengths?.map((str, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-emerald-500 font-bold">•</span>
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 uppercase tracking-wider">
                      <TrendingUp className="size-4" /> Growth Areas
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-700">
                      {finalInterviewReport.growthAreas?.map((area, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-amber-500 font-bold">•</span>
                          <span>{area}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Per-Question Detailed Breakdown */}
                {finalInterviewReport.detailedQuestionAssessments?.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                      Question-by-Question Deep Dive ({finalInterviewReport.detailedQuestionAssessments.length})
                    </h4>
                    <div className="space-y-3">
                      {finalInterviewReport.detailedQuestionAssessments.map((item, idx) => (
                        <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">Q{idx + 1}: {item.question}</span>
                            <Badge variant="slate" size="sm">{item.category}</Badge>
                          </div>
                          <p className="text-slate-600 italic">Candidate Summary: "{item.candidateAnswerSummary}"</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-200">
                            <div>
                              <strong className="text-blue-900 block text-[11px]">Technical Critique:</strong>
                              <span className="text-slate-700">{item.technicalEvaluation}</span>
                            </div>
                            <div>
                              <strong className="text-emerald-900 block text-[11px]">Communication Critique:</strong>
                              <span className="text-slate-700">{item.fluencyEvaluation}</span>
                            </div>
                          </div>
                          {item.recommendedNativeFraming && (
                            <div className="bg-white p-2.5 rounded-lg border border-blue-100 mt-1">
                              <strong className="text-blue-700 block text-[10px] uppercase">Recommended Executive Framing:</strong>
                              <span className="text-slate-800 italic">"{item.recommendedNativeFraming}"</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowReportModal(false)}
                >
                  Close Report
                </Button>
                <Button
                  variant="tactile"
                  size="sm"
                  onClick={() => {
                    navigate('/session-complete', { state: { notes: finalInterviewReport } });
                  }}
                  className="bg-blue-600 text-white hover:bg-blue-500"
                >
                  Save to Notes & Dashboard →
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
};
