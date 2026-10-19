import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Mic, 
  Upload, 
  FileText, 
  Sparkles, 
  Bot, 
  Theater, 
  Briefcase, 
  Coffee, 
  Users,
  CheckCircle2,
  Sliders
} from 'lucide-react';
import { Button, Card, Badge } from '../components/ui';
import { MOCK_PRACTICE_MODES } from '../data/mockData';
import { ConversationModeId } from '../types';

export const ConversationSetupPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialMode = (searchParams.get('mode') as ConversationModeId) || 'resume-interview';

  const [selectedMode, setSelectedMode] = useState<ConversationModeId>(initialMode);
  const [mentorTone, setMentorTone] = useState<'supportive' | 'challenging' | 'conversational'>('supportive');
  const [speakingSpeed, setSpeakingSpeed] = useState<'slow' | 'natural' | 'brisk'>('natural');
  const [sessionDurationMinutes, setSessionDurationMinutes] = useState<number>(15);

  // Mode Specific Form States
  // 1. Resume Interview
  const [resumeText, setResumeText] = useState('Senior Full Stack Developer with 5 years experience in React, TypeScript, Node.js, and cloud architectures.');
  const [jobDescription, setJobDescription] = useState('Staff Frontend Engineer at a high-scale SaaS company. Lead design system and frontend architecture.');

  // 2. Scenario Roleplay
  const [scenarioTopic, setScenarioTopic] = useState('Negotiating a higher equity package and sign-on bonus for a senior tech role.');

  // 3. Office English
  const [officeContext, setOfficeContext] = useState('Diplomatically pushing back against unrealistic project deadlines during a sprint planning call.');

  // 4. Free Conversation
  const [freeChatTopic, setFreeChatTopic] = useState('Casual chat on personal productivity, habits, tech podcasts, and remote work balance.');

  // 5. Group Discussion
  const [discussionTopic, setDiscussionTopic] = useState('Should remote work remain the default standard for software engineering teams?');

  const currentModeDetails = MOCK_PRACTICE_MODES.find(m => m.id === selectedMode) || MOCK_PRACTICE_MODES[0];

  const handleStartSession = () => {
    // Navigate to active conversation with query state
    navigate(`/conversation?mode=${selectedMode}&duration=${sessionDurationMinutes}`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button and page title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/modes')}
          className="size-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 transition-colors"
        >
          <ArrowLeft className="size-4" />
        </button>
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Configure Your Practice Session
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Personalize your AI mentor's pacing, focus topic, and scenario guidelines
          </p>
        </div>
      </div>

      {/* Mode Selector Segment */}
      <Card variant="subtle" className="space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
          Current Practice Mode
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {MOCK_PRACTICE_MODES.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setSelectedMode(mode.id)}
              className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                selectedMode === mode.id
                  ? 'bg-blue-600 text-white border-blue-700 shadow-sm font-bold'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300'
              }`}
            >
              <span className="text-xs font-bold leading-tight truncate">{mode.shortTitle}</span>
              <span className={`text-[10px] mt-2 ${selectedMode === mode.id ? 'text-blue-100' : 'text-slate-400'}`}>
                {mode.difficulty}
              </span>
            </button>
          ))}
        </div>
      </Card>

      {/* Mode Specific Configuration Block */}
      <Card variant="default" className="space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">
              {currentModeDetails.title} Setup
            </h3>
          </div>
          <Badge variant="blue" size="sm">Active Setup</Badge>
        </div>

        {/* 1. Resume Interview Form */}
        {selectedMode === 'resume-interview' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Resume Overview or Experience Highlights:
              </label>
              <textarea
                rows={3}
                className="w-full text-xs font-medium text-slate-800 p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste key skills, projects, or work history..."
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Target Role / Job Description (Optional):
              </label>
              <textarea
                rows={2}
                className="w-full text-xs font-medium text-slate-800 p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste job title or key qualifications..."
              />
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between text-xs text-blue-800">
              <span className="font-medium">Have a PDF resume? Upload feature ready for Phase 5.</span>
              <Button variant="outline" size="sm" icon={<Upload className="size-3.5" />}>
                Upload Resume PDF
              </Button>
            </div>
          </div>
        )}

        {/* 2. Scenario Roleplay Form */}
        {selectedMode === 'scenario-roleplay' && (
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Describe the Scenario You Want to Roleplay:
            </label>
            <textarea
              rows={3}
              className="w-full text-xs font-medium text-slate-800 p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              value={scenarioTopic}
              onChange={(e) => setScenarioTopic(e.target.value)}
            />
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="text-slate-400 font-medium">Quick presets:</span>
              {['Salary Negotiation', 'Airport Lost Luggage', 'Coffee Shop Barista', 'Hotel Check-in Issue'].map((preset) => (
                <button
                  key={preset}
                  onClick={() => setScenarioTopic(preset)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 3. Office English Form */}
        {selectedMode === 'office-english' && (
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Meeting or Workplace Communication Goal:
            </label>
            <textarea
              rows={3}
              className="w-full text-xs font-medium text-slate-800 p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              value={officeContext}
              onChange={(e) => setOfficeContext(e.target.value)}
            />
          </div>
        )}

        {/* 4. Free Conversation Form */}
        {selectedMode === 'free-conversation' && (
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Any Specific Conversational Theme Today?
            </label>
            <input
              type="text"
              className="w-full text-xs font-medium text-slate-800 p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              value={freeChatTopic}
              onChange={(e) => setFreeChatTopic(e.target.value)}
            />
          </div>
        )}

        {/* 5. Topic & Group Discussion Form */}
        {selectedMode === 'topic-discussion' && (
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Debate Motion or Group Discussion Topic:
            </label>
            <textarea
              rows={3}
              className="w-full text-xs font-medium text-slate-800 p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              value={discussionTopic}
              onChange={(e) => setDiscussionTopic(e.target.value)}
            />
          </div>
        )}
      </Card>

      {/* Mentor Preferences & Duration */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Mentor Tone */}
        <Card variant="default" className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
            Mentor Persona
          </label>
          <div className="space-y-1.5">
            {[
              { id: 'supportive', title: 'Gentle & Encouraging' },
              { id: 'conversational', title: 'Casual & Fluid' },
              { id: 'challenging', title: 'In-Depth & Rigorous' },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setMentorTone(t.id as any)}
                className={`w-full p-2.5 rounded-xl border text-xs font-bold text-left transition-all ${
                  mentorTone === t.id
                    ? 'bg-blue-50 border-blue-600 text-blue-700'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {t.title}
              </button>
            ))}
          </div>
        </Card>

        {/* Speaking Pace */}
        <Card variant="default" className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
            Speech Rate
          </label>
          <div className="space-y-1.5">
            {[
              { id: 'slow', title: 'Relaxed (0.85x)' },
              { id: 'natural', title: 'Natural Everyday (1.0x)' },
              { id: 'brisk', title: 'Fast Native (1.15x)' },
            ].map(p => (
              <button
                key={p.id}
                onClick={() => setSpeakingSpeed(p.id as any)}
                className={`w-full p-2.5 rounded-xl border text-xs font-bold text-left transition-all ${
                  speakingSpeed === p.id
                    ? 'bg-blue-50 border-blue-600 text-blue-700'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {p.title}
              </button>
            ))}
          </div>
        </Card>

        {/* Duration */}
        <Card variant="default" className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
            Target Duration
          </label>
          <div className="space-y-1.5">
            {[
              { minutes: 10, label: '10 Minutes (Quick)' },
              { minutes: 15, label: '15 Minutes (Standard)' },
              { minutes: 25, label: '25 Minutes (Deep)' },
            ].map(d => (
              <button
                key={d.minutes}
                onClick={() => setSessionDurationMinutes(d.minutes)}
                className={`w-full p-2.5 rounded-xl border text-xs font-bold text-left transition-all ${
                  sessionDurationMinutes === d.minutes
                    ? 'bg-blue-50 border-blue-600 text-blue-700'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </Card>
      </div>

      {/* Start Button */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button
          variant="outline"
          size="lg"
          onClick={() => navigate('/modes')}
        >
          Cancel
        </Button>
        <Button
          variant="tactile"
          size="lg"
          onClick={handleStartSession}
          icon={<Mic className="size-5" />}
        >
          Launch Voice Session
        </Button>
      </div>
    </div>
  );
};
