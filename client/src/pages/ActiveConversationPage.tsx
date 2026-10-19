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
  FileText,
  MessageSquare,
  Sliders
} from 'lucide-react';
import { Button, Card, Badge } from '../components/ui';
import { Avatar3DCanvas } from '../components/Avatar3DCanvas';
import { TalkingAvatarIntegration } from '../components/TalkingAvatarIntegration';
import { MentorSelector } from '../components/MentorSelector';
import { VoiceSettingsModal } from '../components/VoiceSettingsModal';
import { MentorGender } from '../types/engine';
import { MENTORS } from '../data/mentors';
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

  const [avatarEngine, setAvatarEngine] = useState<'studio' | 'sdk'>('sdk');
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [isVoiceSettingsOpen, setIsVoiceSettingsOpen] = useState<boolean>(false);

  // Persistent Mentor & Voice Profile Configuration
  const [selectedMentor, setSelectedMentor] = useState<MentorGender>(() => {
    const saved = localStorage.getItem('krish_selected_mentor');
    return (saved === 'male' || saved === 'female') ? saved : 'female';
  });

  const [speechRate, setSpeechRate] = useState<number>(() => {
    const saved = localStorage.getItem('krish_speech_rate');
    return saved ? parseFloat(saved) : 1.0;
  });

  const [speechPitch, setSpeechPitch] = useState<number>(() => {
    const saved = localStorage.getItem('krish_speech_pitch');
    return saved ? parseFloat(saved) : (selectedMentor === 'male' ? 0.92 : 1.05);
  });

  const [selectedVoiceUri, setSelectedVoiceUri] = useState<string>(() => {
    return localStorage.getItem('krish_voice_uri') || '';
  });

  const [activeRightTab, setActiveRightTab] = useState<'transcript' | 'feedback'>('transcript');

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
    previewVoice,
    stopAudioPlayback,
    interviewStage,
    interviewQuestionIndex,
    interviewTotalQuestions,
    interviewCategory,
    latestEvaluation,
    finalInterviewReport,
  } = useConversationEngine({
    mode: modeParam,
    voiceGender: selectedMentor,
    speechRate,
    speechPitch,
    preferredVoiceUri: selectedVoiceUri,
    onSessionEnd: (notes: any) => {
      navigate('/session-complete', { state: { notes } });
    },
  });

  // Switch Mentor Handler with safe speech transition
  const handleSelectMentor = (gender: MentorGender) => {
    if (gender === selectedMentor) return;
    // Safely interrupt any active speech before switching avatar/voice
    stopAudioPlayback();
    setSelectedMentor(gender);
    localStorage.setItem('krish_selected_mentor', gender);

    // If no explicit voice override, reset pitch to default for the selected gender
    if (!selectedVoiceUri) {
      const defaultPitch = gender === 'male' ? 0.92 : 1.05;
      setSpeechPitch(defaultPitch);
      localStorage.setItem('krish_speech_pitch', defaultPitch.toString());
    }
  };

  const handleSpeechRateChange = (rate: number) => {
    setSpeechRate(rate);
    localStorage.setItem('krish_speech_rate', rate.toString());
  };

  const handleSpeechPitchChange = (pitch: number) => {
    setSpeechPitch(pitch);
    localStorage.setItem('krish_speech_pitch', pitch.toString());
  };

  const handleVoiceUriChange = (uri: string) => {
    setSelectedVoiceUri(uri);
    localStorage.setItem('krish_voice_uri', uri);
  };

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
    <PageTransition className="h-[calc(100vh-4.25rem)] flex flex-col gap-2.5 overflow-hidden">
      {/* Sleek Top Studio Bar (Single Compact Row) */}
      <div className="flex items-center justify-between gap-3 bg-white px-3.5 py-2 rounded-xl border border-slate-200/90 shadow-2xs shrink-0">
        {/* Left: Mode Title & Category */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="size-8 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center font-bold shrink-0">
            <Bot className="size-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-extrabold text-slate-900 tracking-tight truncate">
                {getModeTitle(modeParam)}
              </span>
              {modeParam === 'resume-interview' ? (
                <Badge variant="blue" size="sm">Q{interviewQuestionIndex + 1}/{interviewTotalQuestions}</Badge>
              ) : (
                <Badge variant="slate" size="sm">Live</Badge>
              )}
            </div>
          </div>
        </div>

        {/* Center: Sleek Segmented Mentor Selector */}
        <MentorSelector
          selectedMentor={selectedMentor}
          onSelectMentor={handleSelectMentor}
          onOpenVoiceSettings={() => setIsVoiceSettingsOpen(true)}
          onTestVoice={() => previewVoice()}
          disabled={state === 'speaking'}
        />

        {/* Right: Key Config, Duration & End Session */}
        <div className="flex items-center gap-1.5 shrink-0">
          {hasCheckedCreds && !isConfigured && (
            <button
              onClick={() => navigate('/settings')}
              className="px-2.5 py-1 text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer"
              title="Add API Key for Live Speech"
            >
              <Key className="size-3 text-amber-600" />
              <span className="hidden sm:inline">Set Key</span>
            </button>
          )}

          {finalInterviewReport && (
            <button
              onClick={() => setShowReportModal(true)}
              className="px-2.5 py-1 bg-emerald-600 text-white hover:bg-emerald-500 rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-2xs cursor-pointer"
            >
              <Award className="size-3.5" />
              <span className="hidden sm:inline">Report</span>
            </button>
          )}

          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-slate-700 shadow-2xs">
            <Clock className="size-3 text-blue-600" />
            <span>{formatTimer(durationSeconds)}</span>
          </div>

          <button
            onClick={endConversation}
            disabled={state === 'idle' || state === 'ending'}
            className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition flex items-center gap-1 cursor-pointer disabled:opacity-40"
            title="End Session"
          >
            <PhoneOff className="size-3" />
            <span>End</span>
          </button>
        </div>
      </div>

      {/* Permission or Connection Failure Notice (Compact) */}
      {errorMessage && (
        <div className="border border-rose-200 bg-rose-50/90 px-3.5 py-2 rounded-xl flex items-center justify-between shrink-0 text-xs text-rose-900 shadow-2xs">
          <div className="flex items-center gap-2">
            <ShieldAlert className="size-4 text-rose-600 shrink-0" />
            <span className="font-semibold">{errorMessage}</span>
          </div>
          <button onClick={retry} className="px-2 py-0.5 rounded bg-white border border-rose-300 font-bold hover:bg-rose-50 cursor-pointer">
            Retry
          </button>
        </div>
      )}

      {/* Main Grid: Avatar Stage (7 cols) vs Unified Studio Hub (5 cols) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0">
        {/* Left: 3D Avatar Viewport with Floating Glass Control Dock */}
        <div className="lg:col-span-7 flex flex-col min-h-0 h-full">
          <div className="flex-1 relative flex flex-col items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800 shadow-xl min-h-0">
            {/* Top State Badge with Pulse Beacon */}
            <div className="absolute top-3 left-3 z-20 flex items-center gap-2 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full border border-slate-800 shadow-md">
              <PulseBeacon 
                variant={
                  state === 'listening' ? 'emerald' : 
                  state === 'speaking' ? 'blue' : 
                  state === 'processing' ? 'amber' : 'slate'
                } 
                size="sm" 
              />
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-300 font-mono">
                {selectedMentor === 'female' ? 'Sophia' : 'Marcus'} &bull; {state.replace('_', ' ')}
              </span>
            </div>

            {/* Top-Right Avatar Engine Switcher */}
            <div className="absolute top-3 right-3 z-20 flex items-center bg-slate-950/80 backdrop-blur-md p-0.5 rounded-lg border border-slate-800 text-[10px] font-bold">
              <button
                onClick={() => setAvatarEngine('studio')}
                className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                  avatarEngine === 'studio' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Studio Rig 3D Model"
              >
                Studio
              </button>
              <button
                onClick={() => setAvatarEngine('sdk')}
                className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                  avatarEngine === 'sdk' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Talking Avatar SDK"
              >
                SDK
              </button>
            </div>

            {/* 3D Human-like Avatar Canvas */}
            <div className="w-full h-full relative">
              <ErrorBoundary name="3D Mentor Avatar">
                {avatarEngine === 'studio' ? (
                  <Avatar3DCanvas 
                    state={state} 
                    mentorGender={selectedMentor}
                    className="w-full h-full" 
                  />
                ) : (
                  <TalkingAvatarIntegration
                    state={state}
                    mentorGender={selectedMentor}
                    className="w-full h-full"
                    onFallback={() => setAvatarEngine('studio')}
                  />
                )}
              </ErrorBoundary>
            </div>

            {/* Reactive Dynamic Audio Waveform Overlay */}
            <div className="absolute bottom-16 left-6 right-6 pointer-events-none z-10 flex justify-center">
              <ReactiveAudioWaveform
                isActive={state !== 'idle'}
                state={state === 'processing' ? 'thinking' : state as any}
                barCount={24}
                className="max-w-xs"
              />
            </div>

            {/* Floating Glass Control Dock */}
            <div className="absolute bottom-3 inset-x-0 z-20 flex items-center justify-center pointer-events-none">
              <div className="pointer-events-auto flex items-center gap-2 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-800/90 shadow-2xl">
                {state === 'idle' ? (
                  <button
                    onClick={startConversation}
                    className="flex items-center gap-2 px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition-all cursor-pointer"
                  >
                    <Play className="size-3.5 fill-white" />
                    <span>Start Practice</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={toggleMute}
                      className={`size-9 rounded-full flex items-center justify-center font-bold transition-all cursor-pointer ${
                        isMuted 
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/50 hover:bg-rose-500/30' 
                          : 'bg-blue-600 text-white hover:bg-blue-500 shadow-md shadow-blue-600/25'
                      }`}
                      title={isMuted ? "Unmute Mic" : "Mute Mic"}
                    >
                      {isMuted ? <MicOff className="size-4" /> : <Mic className="size-4" />}
                    </button>

                    {isPaused ? (
                      <button
                        onClick={resumeConversation}
                        className="size-9 rounded-full flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 font-bold transition-all cursor-pointer"
                        title="Resume Session"
                      >
                        <Play className="size-4 fill-emerald-400" />
                      </button>
                    ) : (
                      <button
                        onClick={pauseConversation}
                        className="size-9 rounded-full flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-bold transition-all cursor-pointer"
                        title="Pause Session"
                      >
                        <Pause className="size-4" />
                      </button>
                    )}

                    {state === 'speaking' && (
                      <button
                        onClick={interruptSpeech}
                        className="size-9 rounded-full flex items-center justify-center bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/40 font-bold transition-all cursor-pointer"
                        title="Interrupt Mentor"
                      >
                        <VolumeX className="size-4" />
                      </button>
                    )}

                    <div className="h-4 w-px bg-slate-800 mx-0.5" />

                    <button
                      onClick={() => setIsVoiceSettingsOpen(true)}
                      className="size-9 rounded-full flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 font-bold transition-all cursor-pointer"
                      title="Voice Audio Settings"
                    >
                      <Sliders className="size-3.5" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Unified Tabbed Workspace (Transcript & AI Feedback) */}
        <div className="lg:col-span-5 flex flex-col min-h-0 h-full">
          <div className="flex-1 flex flex-col min-h-0 bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            {/* Tab Navigation Header */}
            <div className="flex items-center justify-between px-3.5 py-2 border-b border-slate-100 bg-slate-50/70 shrink-0">
              <div className="flex items-center bg-slate-200/70 p-0.5 rounded-lg text-xs font-bold">
                <button
                  onClick={() => setActiveRightTab('transcript')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all cursor-pointer ${
                    activeRightTab === 'transcript'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <MessageSquare className="size-3.5 text-blue-600" />
                  <span>Transcript</span>
                  {messages.length > 0 && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600">
                      {messages.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveRightTab('feedback')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all cursor-pointer relative ${
                    activeRightTab === 'feedback'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Sparkles className="size-3.5 text-amber-500" />
                  <span>Feedback</span>
                  {(latestEvaluation || latestMessageWithGrammar || latestMessageWithAlternative) && (
                    <span className="size-2 rounded-full bg-amber-500 animate-pulse ml-0.5" />
                  )}
                </button>
              </div>

              {/* Status indicator or action */}
              {activeRightTab === 'transcript' ? (
                <div className="flex items-center gap-1 text-[11px] font-mono text-slate-500">
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                  <span>STT Active</span>
                </div>
              ) : finalInterviewReport ? (
                <button
                  onClick={() => setShowReportModal(true)}
                  className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 hover:bg-emerald-100 cursor-pointer"
                >
                  <Award className="size-3 text-emerald-600" />
                  <span>Report</span>
                </button>
              ) : (
                <span className="text-[11px] font-medium text-slate-400">Live Diagnostics</span>
              )}
            </div>

            {/* Tab 1: Scrollable Dialogue Stream */}
            {activeRightTab === 'transcript' && (
              <div className="flex-1 overflow-y-auto p-3.5 space-y-3 min-h-0 text-xs">
                {messages.length === 0 && !partialTranscript ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                    <div className="size-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mb-2">
                      <MessageSquare className="size-5" />
                    </div>
                    <span className="text-xs font-bold text-slate-700">Start the conversation</span>
                    <p className="text-[11px] text-slate-400 mt-0.5 max-w-[200px]">
                      Your dialogue with Krish AI will appear here in real time.
                    </p>
                  </div>
                ) : (
                  <>
                    <AnimatePresence initial={false}>
                      {messages.map((item) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.15 }}
                          className={`flex flex-col ${item.sender === 'user' ? 'items-end' : 'items-start'}`}
                        >
                          <div className="flex items-center gap-1.5 mb-1 px-1">
                            <span className="text-[10px] font-bold text-slate-400">
                              {item.sender === 'user' ? 'You' : (selectedMentor === 'female' ? 'Sophia' : 'Marcus')}
                            </span>
                            <span className="font-mono text-[9px] text-slate-400">{item.timestamp}</span>
                          </div>

                          <div
                            className={`p-3 rounded-2xl text-xs leading-relaxed max-w-[92%] ${
                              item.sender === 'user'
                                ? 'bg-blue-600 text-white font-medium rounded-tr-xs shadow-2xs'
                                : 'bg-slate-50 border border-slate-200 text-slate-800 font-medium rounded-tl-xs shadow-2xs'
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
                        <div className="flex items-center gap-1 mb-1 px-1 text-[10px] font-bold text-blue-600">
                          <span className="size-1.5 rounded-full bg-blue-600 animate-ping" />
                          <span>Listening</span>
                        </div>
                        <div className="p-2.5 rounded-2xl text-xs bg-blue-50/80 border border-dashed border-blue-300 text-slate-700 italic rounded-tr-xs">
                          "{partialTranscript}..."
                        </div>
                      </motion.div>
                    )}
                  </>
                )}
                <div ref={transcriptBottomRef} />
              </div>
            )}

            {/* Tab 2: Feedback & Evaluation Rail */}
            {activeRightTab === 'feedback' && (
              <div className="flex-1 overflow-y-auto p-3.5 space-y-3 min-h-0 text-xs">
                {modeParam === 'resume-interview' && latestEvaluation ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-2.5"
                  >
                    {/* Dual Score Cards */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-blue-50/50 p-2.5 rounded-xl border border-blue-200/80 shadow-2xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700">Technical</span>
                          <span className="text-xs font-mono font-extrabold text-blue-900">{latestEvaluation.technicalCorrectnessScore}/100</span>
                        </div>
                        <p className="text-[11px] text-slate-600 line-clamp-3 leading-snug">{latestEvaluation.technicalCritique}</p>
                      </div>

                      <div className="bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-200/80 shadow-2xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">Fluency</span>
                          <span className="text-xs font-mono font-extrabold text-emerald-900">{latestEvaluation.englishFluencyScore}/100</span>
                        </div>
                        <p className="text-[11px] text-slate-600 line-clamp-3 leading-snug">{latestEvaluation.englishCritique}</p>
                      </div>
                    </div>

                    {/* Vague or Incomplete Follow-up Alert */}
                    {latestEvaluation.isVagueOrIncomplete && (
                      <div className="bg-amber-50 border border-amber-300 p-2.5 rounded-xl text-amber-950 flex items-start gap-2 shadow-2xs">
                        <AlertCircle className="size-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block text-[11px] font-extrabold uppercase tracking-wider text-amber-900">Follow-up Probing</strong>
                          <span className="text-[11px] text-amber-800 leading-snug">Answer was generic or incomplete. Provide specific metrics or real-world examples.</span>
                        </div>
                      </div>
                    )}

                    {/* Grammar Correction */}
                    {latestEvaluation.grammarCorrections?.[0] && (
                      <div className="bg-white p-3 rounded-xl border border-amber-200 shadow-2xs space-y-1.5">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-600 flex items-center gap-1">
                          <AlertCircle className="size-3 text-rose-500" /> Grammar Refinement
                        </span>
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="line-through text-slate-400 font-medium">{latestEvaluation.grammarCorrections[0].original}</span>
                          <ArrowRight className="size-3 text-slate-400 shrink-0" />
                          <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {latestEvaluation.grammarCorrections[0].suggested}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600">{latestEvaluation.grammarCorrections[0].explanation}</p>
                      </div>
                    )}

                    {/* Natural Executive Alternative */}
                    {latestEvaluation.naturalNativeAlternative && (
                      <div className="bg-white p-3 rounded-xl border border-blue-200 shadow-2xs space-y-1.5">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 flex items-center gap-1">
                          <Sparkles className="size-3 text-blue-500" /> Executive Phrasing
                        </span>
                        <p className="text-xs font-semibold text-slate-800 italic bg-blue-50/50 p-2.5 rounded-lg border border-blue-100 leading-relaxed">
                          "{latestEvaluation.naturalNativeAlternative}"
                        </p>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  /* Standard Mode Diagnostics */
                  <div className="space-y-3">
                    {latestMessageWithGrammar?.grammarFeedback ? (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white p-3 rounded-xl border border-amber-200 shadow-2xs space-y-1.5"
                      >
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-600 flex items-center gap-1">
                          <AlertCircle className="size-3 text-rose-500" /> Grammar Refinement
                        </span>
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="line-through text-slate-400 font-medium">
                            {latestMessageWithGrammar.grammarFeedback.original}
                          </span>
                          <ArrowRight className="size-3 text-slate-400 shrink-0" />
                          <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {latestMessageWithGrammar.grammarFeedback.suggested}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600">
                          {latestMessageWithGrammar.grammarFeedback.explanation}
                        </p>
                      </motion.div>
                    ) : null}

                    {latestMessageWithAlternative?.naturalAlternative ? (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white p-3 rounded-xl border border-blue-200 shadow-2xs space-y-1.5"
                      >
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 flex items-center gap-1">
                          <Sparkles className="size-3 text-blue-500" /> Native Phrasing
                        </span>
                        <p className="text-xs font-semibold text-slate-800 italic bg-blue-50/50 p-2.5 rounded-lg border border-blue-100">
                          "{latestMessageWithAlternative.naturalAlternative}"
                        </p>
                      </motion.div>
                    ) : null}

                    {!latestMessageWithGrammar?.grammarFeedback && !latestMessageWithAlternative?.naturalAlternative && (
                      <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                        <div className="size-10 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mb-2">
                          <Sparkles className="size-5" />
                        </div>
                        <span className="text-xs font-bold text-slate-700">Real-Time Feedback Active</span>
                        <p className="text-[11px] text-slate-400 mt-0.5 max-w-[200px]">
                          Grammar corrections and natural expression tips will appear here as you speak.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
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

      {/* Voice & Speech Calibration Modal */}
      <VoiceSettingsModal
        isOpen={isVoiceSettingsOpen}
        onClose={() => setIsVoiceSettingsOpen(false)}
        selectedMentor={selectedMentor}
        speechRate={speechRate}
        onSpeechRateChange={handleSpeechRateChange}
        speechPitch={speechPitch}
        onSpeechPitchChange={handleSpeechPitchChange}
        selectedVoiceUri={selectedVoiceUri}
        onVoiceUriChange={handleVoiceUriChange}
        onTestVoice={() => previewVoice()}
      />
    </PageTransition>
  );
};
