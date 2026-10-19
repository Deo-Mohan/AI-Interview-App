import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  BarChart2, 
  Flame, 
  Clock, 
  Award, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  Calendar,
  Sparkles,
  ArrowRight,
  Compass,
  Check
} from 'lucide-react';
import { Button, Card, Badge } from '../components/ui';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { PageTransition, StaggerContainer, StaggerItem, PulseBeacon } from '../components/motion/MotionTransitions';
import { MOCK_USER_PROGRESS } from '../data/mockData';

export const ProgressPage: React.FC = () => {
  const navigate = useNavigate();
  const stats = MOCK_USER_PROGRESS;

  const cefrLevels = [
    { level: 'A1', label: 'Beginner', achieved: true },
    { level: 'A2', label: 'Elementary', achieved: true },
    { level: 'B1', label: 'Intermediate', achieved: true },
    { level: 'B2', label: 'Upper Intermediate', achieved: true, current: true },
    { level: 'C1', label: 'Advanced', achieved: false },
    { level: 'C2', label: 'Mastery', achieved: false },
  ];

  return (
    <PageTransition className="space-y-6 max-w-5xl mx-auto">
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <Badge variant="blue" size="sm" dot>Spoken English Analytics</Badge>
          <span className="text-xs text-slate-400 font-mono font-bold">Continuous Telemetry</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Speaking Fluency & CEFR Progression
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          Track active speaking volume, CEFR benchmark progress, and personalized grammar patterns flagged across sessions
        </p>
      </div>

      {/* CEFR Level Milestone Roadmap */}
      <Card variant="default" className="space-y-4 border-slate-200 shadow-subtle">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Award className="size-5 text-blue-600" />
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight">CEFR Fluency Roadmap</h3>
          </div>
          <span className="text-xs font-mono font-bold text-slate-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
            Current Tier: <strong className="text-blue-700">{stats.currentCefrEstimate}</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-2">
          {cefrLevels.map((lvl) => (
            <div
              key={lvl.level}
              className={`p-3 rounded-2xl border text-center transition-all ${
                lvl.current
                  ? 'bg-blue-50 border-blue-600 ring-2 ring-blue-500/30 shadow-xs'
                  : lvl.achieved
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                  : 'bg-slate-50 border-slate-200 opacity-60'
              }`}
            >
              <div className="flex items-center justify-center mb-1">
                {lvl.current ? (
                  <PulseBeacon variant="blue" size="sm" />
                ) : lvl.achieved ? (
                  <Check className="size-4 text-emerald-600 font-bold" />
                ) : (
                  <span className="size-2 rounded-full bg-slate-300" />
                )}
              </div>
              <span className="text-lg font-black font-mono block leading-none">{lvl.level}</span>
              <span className="text-[10px] font-bold text-slate-500 block mt-1">{lvl.label}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* High Level Stats Grid */}
      <ErrorBoundary name="Fluency Metrics Grid" compact>
        <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StaggerItem>
            <Card variant="default" className="hover:border-amber-300 card-hover-lift">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                Speaking Streak
              </span>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-black text-slate-900 font-mono">{stats.speakingStreakDays}</span>
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                  <Flame className="size-3 fill-amber-500 text-amber-500" /> Active
                </span>
              </div>
              <span className="text-xs text-slate-500 mt-1 block font-medium">12 consecutive practice days</span>
            </Card>
          </StaggerItem>

          <StaggerItem>
            <Card variant="default" className="hover:border-blue-300 card-hover-lift">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                Total Time Spoken
              </span>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-black text-slate-900 font-mono">{stats.totalSpeakingMinutes}</span>
                <span className="text-xs font-mono font-bold text-slate-500">minutes</span>
              </div>
              <span className="text-xs text-slate-500 mt-1 block font-medium">Across {stats.sessionsCompleted} live sessions</span>
            </Card>
          </StaggerItem>

          <StaggerItem>
            <Card variant="default" className="hover:border-emerald-300 card-hover-lift">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                Average Fluency Score
              </span>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-black text-emerald-600 font-mono">{stats.averageFluencyScore}%</span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">+3%</span>
              </div>
              <span className="text-xs text-slate-500 mt-1 block font-medium">Cadence & vocabulary rating</span>
            </Card>
          </StaggerItem>

          <StaggerItem>
            <Card variant="default" className="hover:border-indigo-300 card-hover-lift">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                Words Mastered
              </span>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-black text-indigo-600 font-mono">{stats.vocabularyMastered}</span>
                <span className="text-xs font-mono font-bold text-slate-500">words</span>
              </div>
              <span className="text-xs text-slate-500 mt-1 block font-medium">Spaced repetition retention</span>
            </Card>
          </StaggerItem>
        </StaggerContainer>
      </ErrorBoundary>

      {/* Recurring Grammar Error Hot-Spots */}
      <ErrorBoundary name="Recurring Grammar Detection">
        <Card variant="default" className="space-y-4 border-slate-200 shadow-subtle">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2 tracking-tight">
                <AlertTriangle className="size-4 text-amber-500" />
                Recurring Error Detection & Personalized Revision
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Grammatical habits flagged across multiple sessions that require deliberate speech practice
              </p>
            </div>
            <Badge variant="amber" size="sm">3 Habit Patterns</Badge>
          </div>

          <div className="space-y-3">
            {stats.recurringGrammarPatterns.map((pattern, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-300 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-extrabold text-slate-900">{pattern.category}</span>
                    <span className="text-xs font-mono font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      Triggered {pattern.frequency} times
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    {pattern.tip}
                  </p>
                </div>

                <div className="shrink-0">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate('/conversation?mode=topic-discussion')}
                    icon={<Compass className="size-3.5 text-blue-600" />}
                    className="font-bold hover:text-blue-600"
                  >
                    Drill In Conversation
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </ErrorBoundary>

      {/* Weekly Speaking Breakdown Chart */}
      <ErrorBoundary name="Practice Volume Chart">
        <Card variant="default" className="space-y-4 border-slate-200 shadow-subtle">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2 tracking-tight">
              <TrendingUp className="size-4 text-blue-600" />
              Weekly Practice Volume
            </h3>
            <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
              Weekly Target: 100 mins
            </span>
          </div>

          <div className="grid grid-cols-7 gap-3 pt-3 text-center">
            {[
              { day: 'Mon', mins: 25 },
              { day: 'Tue', mins: 18 },
              { day: 'Wed', mins: 30 },
              { day: 'Thu', mins: 15 },
              { day: 'Fri', mins: 22 },
              { day: 'Sat', mins: 40 },
              { day: 'Sun', mins: 20 },
            ].map((col, idx) => (
              <div key={idx} className="flex flex-col items-center gap-2 group">
                <div className="h-32 w-full max-w-[42px] bg-slate-100 rounded-xl flex flex-col justify-end p-1 border border-slate-200/60 group-hover:border-blue-300 transition-colors">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(col.mins / 40) * 100}%` }}
                    transition={{ duration: 0.6, delay: idx * 0.08, ease: "easeOut" }}
                    className="bg-gradient-to-t from-blue-700 to-blue-500 rounded-lg w-full transition-all group-hover:brightness-110 shadow-xs"
                  />
                </div>
                <span className="font-mono text-xs font-bold text-slate-900">{col.mins}m</span>
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">{col.day}</span>
              </div>
            ))}
          </div>
        </Card>
      </ErrorBoundary>
    </PageTransition>
  );
};
