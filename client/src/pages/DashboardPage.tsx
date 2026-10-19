import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Flame, 
  Clock, 
  Award, 
  Sparkles, 
  ArrowRight, 
  Mic, 
  FileText, 
  BookOpen, 
  Bot, 
  Theater, 
  Briefcase, 
  Coffee, 
  Users,
  AlertTriangle,
  ChevronRight,
  Volume2,
  CheckCircle2,
  Zap,
  Target
} from 'lucide-react';
import { Button, Card, Badge } from '../components/ui';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { PageTransition, StaggerContainer, StaggerItem, PulseBeacon } from '../components/motion/MotionTransitions';
import { 
  MOCK_PRACTICE_MODES, 
  MOCK_USER_PROGRESS, 
  MOCK_RECENT_SESSIONS, 
  MOCK_VOCABULARY, 
  MOCK_SAVED_NOTES 
} from '../data/mockData';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const stats = MOCK_USER_PROGRESS;
  const wordOfTheDay = MOCK_VOCABULARY[0];

  const getModeIcon = (id: string) => {
    switch (id) {
      case 'resume-interview': return <Bot className="size-5 text-blue-600" />;
      case 'scenario-roleplay': return <Theater className="size-5 text-emerald-600" />;
      case 'office-english': return <Briefcase className="size-5 text-amber-600" />;
      case 'free-conversation': return <Coffee className="size-5 text-indigo-600" />;
      case 'topic-discussion': return <Users className="size-5 text-rose-600" />;
      default: return <Sparkles className="size-5 text-blue-600" />;
    }
  };

  const playPronunciation = (word: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.rate = 0.9;
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <PageTransition className="space-y-8 animate-fade-in">
      {/* Hero Welcome Card - EventLooped Engineering Aesthetic */}
      <Card variant="hero" className="border-slate-200/90 relative overflow-hidden bg-white shadow-subtle">
        {/* Decorative corner math grid overlay */}
        <div className="absolute top-0 right-0 w-80 h-full opacity-35 bg-engineering-grid pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                <PulseBeacon variant="emerald" size="sm" />
                Live AI Mentorship Ready
              </span>
              <span className="font-mono text-xs text-slate-500 font-bold bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                CEFR Current: <strong className="text-slate-800">{stats.currentCefrEstimate}</strong>
              </span>
              <span className="font-mono text-xs text-amber-700 font-bold bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 flex items-center gap-1">
                <Flame className="size-3.5 fill-amber-500 text-amber-500" />
                {stats.speakingStreakDays}-Day Streak
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Ready to speak today, Krish?
            </h2>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium">
              Practice spontaneous conversations with Rachel, your 3D AI mentor. Rachel listens actively, tracks verb tenses, and offers natural native alternatives in real time.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-500 font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-emerald-600" />
                <span>Microphone speech recognition</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-emerald-600" />
                <span>Audio viseme lip-sync</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-emerald-600" />
                <span>Gentle real-time grammar feedback</span>
              </div>
            </div>
          </div>

          {/* Primary Action Button & Daily Goal */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-3.5 w-full lg:w-auto shrink-0">
            <Button
              variant="tactile"
              size="lg"
              className="w-full sm:w-auto shadow-md"
              onClick={() => navigate('/conversation')}
              icon={<Mic className="size-5" />}
            >
              Start Practice Session
            </Button>
            
            <div className="flex items-center justify-between sm:justify-start lg:justify-end gap-3 p-2 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-medium text-slate-600">
              <span className="flex items-center gap-1 font-mono text-slate-700 font-bold">
                <Target className="size-3.5 text-blue-600" /> Daily Target: 15 / 20 mins
              </span>
              <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: '75%' }} />
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Metric Cards Row - Staggered Entrances */}
      <ErrorBoundary name="Speaking Metrics" compact>
        <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Speaking Streak */}
          <StaggerItem>
            <Card variant="default" className="flex items-center gap-4 hover:border-amber-300 card-hover-lift">
              <div className="size-12 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0 shadow-2xs">
                <Flame className="size-6 fill-amber-500 text-amber-500 animate-pulse" />
              </div>
              <div>
                <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">Speaking Streak</span>
                <span className="text-2xl font-black text-slate-900 font-mono">{stats.speakingStreakDays} Days</span>
                <span className="text-[11px] text-emerald-600 font-semibold block mt-0.5">Top 5% of learners</span>
              </div>
            </Card>
          </StaggerItem>

          {/* Total Time */}
          <StaggerItem>
            <Card variant="default" className="flex items-center gap-4 hover:border-blue-300 card-hover-lift">
              <div className="size-12 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0 shadow-2xs">
                <Clock className="size-6" />
              </div>
              <div>
                <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">Time Spoken</span>
                <span className="text-2xl font-black text-slate-900 font-mono">{stats.totalSpeakingMinutes} Mins</span>
                <span className="text-[11px] text-blue-600 font-semibold block mt-0.5">+45 mins this week</span>
              </div>
            </Card>
          </StaggerItem>

          {/* Fluency Score */}
          <StaggerItem>
            <Card variant="default" className="flex items-center gap-4 hover:border-emerald-300 card-hover-lift">
              <div className="size-12 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0 shadow-2xs">
                <Award className="size-6" />
              </div>
              <div>
                <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">Average Fluency</span>
                <span className="text-2xl font-black text-slate-900 font-mono">{stats.averageFluencyScore}%</span>
                <span className="text-[11px] text-emerald-600 font-semibold block mt-0.5">+3% accuracy growth</span>
              </div>
            </Card>
          </StaggerItem>

          {/* Vocabulary Goal */}
          <StaggerItem>
            <Card variant="default" className="flex items-center gap-4 hover:border-indigo-300 card-hover-lift">
              <div className="size-12 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center shrink-0 shadow-2xs">
                <BookOpen className="size-6" />
              </div>
              <div>
                <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">Words Mastered</span>
                <span className="text-2xl font-black text-slate-900 font-mono">{stats.vocabularyMastered}</span>
                <span className="text-[11px] text-indigo-600 font-semibold block mt-0.5">4 new words today</span>
              </div>
            </Card>
          </StaggerItem>
        </StaggerContainer>
      </ErrorBoundary>

      {/* Main Grid: Modes & Daily Vocab Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: 5 Practice Modes */}
        <div className="lg:col-span-2 space-y-4">
          <ErrorBoundary name="Practice Modes">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">Five Practice Environments</h3>
                <p className="text-xs text-slate-500 font-medium">Select a focused real-world scenario or technical roleplay</p>
              </div>
              <Link to="/modes" className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors">
                View all modes <ChevronRight className="size-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {MOCK_PRACTICE_MODES.map((mode) => (
                <Card
                  key={mode.id}
                  variant="interactive"
                  className="flex flex-col justify-between"
                  onClick={() => navigate(`/conversation-setup?mode=${mode.id}`)}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 shrink-0 group-hover:bg-blue-50 group-hover:border-blue-200 transition-colors">
                        {getModeIcon(mode.id)}
                      </div>
                      {mode.badge && (
                        <Badge variant={mode.badge === 'Popular' ? 'blue' : 'emerald'} size="sm">
                          {mode.badge}
                        </Badge>
                      )}
                    </div>
                    <h4 className="text-base font-extrabold text-slate-900 tracking-tight mb-1.5 group-hover:text-blue-600 transition-colors">
                      {mode.shortTitle}
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium line-clamp-2">
                      {mode.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-400">
                    <span className="font-mono text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {mode.suggestedDuration}
                    </span>
                    <span className="font-bold text-blue-600 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      Practice Now <ArrowRight className="size-3.5" />
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </ErrorBoundary>
        </div>

        {/* Right Col: Daily Vocabulary & Error Trend */}
        <div className="space-y-6">
          <ErrorBoundary name="Daily Vocabulary & Revision Spotlight">
            <div className="space-y-6">
              {/* Daily Word Highlight */}
              <Card variant="default" className="space-y-3.5 border-slate-200">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Word of the Day</span>
                  <Badge variant="emerald" size="sm" dot>Daily Goal 3/5</Badge>
                </div>

                <div>
                  <div className="flex items-baseline justify-between mb-1">
                    <div className="flex items-baseline gap-2">
                      <h4 className="text-2xl font-black text-slate-900 tracking-tight">{wordOfTheDay.word}</h4>
                      <span className="font-mono text-xs text-slate-500 font-bold">{wordOfTheDay.phonetic}</span>
                    </div>
                    <button
                      onClick={() => playPronunciation(wordOfTheDay.word)}
                      className="size-8 rounded-lg border border-slate-200 hover:bg-slate-50 hover:text-blue-600 flex items-center justify-center text-slate-500 transition-colors cursor-pointer"
                      title="Listen to pronunciation"
                    >
                      <Volume2 className="size-4" />
                    </button>
                  </div>

                  <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 mb-2">
                    {wordOfTheDay.partOfSpeech}
                  </span>

                  <p className="text-xs text-slate-700 leading-relaxed font-medium mb-3">
                    {wordOfTheDay.definition}
                  </p>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 italic">
                    "{wordOfTheDay.exampleSentences[0]}"
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => navigate('/vocabulary')}
                  icon={<BookOpen className="size-3.5" />}
                >
                  Open Vocabulary Lab
                </Button>
              </Card>

              {/* Recurring Grammar Watchlist */}
              <Card variant="subtle" className="space-y-3 border-amber-200/90 bg-amber-50/40">
                <div className="flex items-center justify-between border-b border-amber-200/60 pb-2">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                    <AlertTriangle className="size-4 text-amber-600" />
                    <span>Personalized Revision Spotlight</span>
                  </div>
                  <Badge variant="amber" size="sm">Grammar Focus</Badge>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  Based on your last 5 sessions, watch out for <span className="font-bold text-slate-900">Past Tense Auxiliaries ("didn't knew" → "didn't know")</span>.
                </p>

                <div className="p-2.5 rounded-xl bg-white border border-amber-200/80 text-xs space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="line-through text-slate-400 font-medium">I didn't knew that.</span>
                    <ArrowRight className="size-3 text-slate-400" />
                    <span className="font-bold text-emerald-700">I didn't know that.</span>
                  </div>
                </div>

                <div className="pt-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-blue-600 font-bold p-0 hover:bg-transparent"
                    onClick={() => navigate('/progress')}
                  >
                    View all recurring error patterns →
                  </Button>
                </div>
              </Card>
            </div>
          </ErrorBoundary>
        </div>
      </div>

      {/* Bottom Section: Recent Sessions & Saved Notes */}
      <ErrorBoundary name="Recent Sessions & Saved Notes">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
          {/* Recent Sessions */}
          <Card variant="default" className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight">Recent Practice Sessions</h3>
                <span className="text-xs text-slate-400 font-medium">Last 3 recorded live dialogues</span>
              </div>
              <span className="text-xs text-slate-400 font-mono font-bold">Updated today</span>
            </div>

            <div className="space-y-3">
              {MOCK_RECENT_SESSIONS.map((sess) => (
                <div key={sess.id} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
                  <div className="space-y-1">
                    <span className="text-sm font-bold text-slate-900 block leading-tight">{sess.modeTitle}</span>
                    <span className="text-xs text-slate-500 font-medium">{sess.keyTopic}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md block mb-1 border border-emerald-200">
                      {sess.fluencyScore}% Fluency
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono font-medium">{sess.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Recently Saved Notes */}
          <Card variant="default" className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight">Recently Saved Notes</h3>
                <span className="text-xs text-slate-400 font-medium">Full transcripts & grammar corrections</span>
              </div>
              <Link to="/notes" className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                View all notes <ChevronRight className="size-3" />
              </Link>
            </div>

            <div className="space-y-3">
              {MOCK_SAVED_NOTES.map((note) => (
                <div key={note.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900">{note.title}</span>
                    <Badge variant="blue" size="sm">{note.cefrLevel}</Badge>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {note.overview}
                  </p>
                  <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400 font-mono">
                    <span>{note.date}</span>
                    <Link to={`/notes?id=${note.id}`} className="text-blue-600 font-bold hover:underline flex items-center gap-1">
                      Read lesson notes →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </ErrorBoundary>
    </PageTransition>
  );
};
