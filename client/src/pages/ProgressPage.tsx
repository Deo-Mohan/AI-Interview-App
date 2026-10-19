import React from 'react';
import { 
  BarChart2, 
  Flame, 
  Clock, 
  Award, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  Calendar,
  Sparkles
} from 'lucide-react';
import { Button, Card, Badge } from '../components/ui';
import { MOCK_USER_PROGRESS } from '../data/mockData';

export const ProgressPage: React.FC = () => {
  const stats = MOCK_USER_PROGRESS;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          My Progress & Fluency Analytics
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          Track speaking time consistency, CEFR level progression, and recurring grammar hot-spots
        </p>
      </div>

      {/* High Level Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card variant="default">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Speaking Streak
          </span>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-black text-slate-900 font-mono">{stats.speakingStreakDays}</span>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">Active</span>
          </div>
          <span className="text-xs text-slate-500 mt-1 block">Consecutive practice days</span>
        </Card>

        <Card variant="default">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Total Time Spoken
          </span>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-black text-slate-900 font-mono">{stats.totalSpeakingMinutes}</span>
            <span className="text-xs text-slate-500 font-mono">minutes</span>
          </div>
          <span className="text-xs text-slate-500 mt-1 block">Across {stats.sessionsCompleted} sessions</span>
        </Card>

        <Card variant="default">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Average Fluency Score
          </span>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-black text-emerald-600 font-mono">{stats.averageFluencyScore}%</span>
          </div>
          <span className="text-xs text-slate-500 mt-1 block">Cadence & vocabulary rating</span>
        </Card>

        <Card variant="default">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Current CEFR Estimate
          </span>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-black text-blue-600 font-mono">{stats.currentCefrEstimate}</span>
          </div>
          <span className="text-xs text-slate-500 mt-1 block">Upper-Intermediate to Advanced</span>
        </Card>
      </div>

      {/* Recurring Grammar Error Hot-Spots */}
      <Card variant="default" className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="size-4 text-amber-500" />
              Recurring Error Detection & Personalized Revision
            </h3>
            <p className="text-xs text-slate-500">
              Grammatical habits flagged across multiple sessions that require deliberate attention
            </p>
          </div>
          <Badge variant="amber" size="sm">3 Habit Patterns</Badge>
        </div>

        <div className="space-y-3">
          {stats.recurringGrammarPatterns.map((pattern, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900">{pattern.category}</span>
                  <span className="text-xs font-mono font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                    Triggered {pattern.frequency} times
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-medium">
                  {pattern.tip}
                </p>
              </div>

              <div className="shrink-0">
                <Button variant="outline" size="sm">
                  Drill Pattern
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Weekly Speaking Breakdown Chart Simulation */}
      <Card variant="default" className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="size-4 text-blue-600" />
            Weekly Practice Volume
          </h3>
          <span className="text-xs font-mono text-slate-400">Target: 100 mins/week</span>
        </div>

        <div className="grid grid-cols-7 gap-2 pt-2 text-center">
          {[
            { day: 'Mon', mins: 25 },
            { day: 'Tue', mins: 18 },
            { day: 'Wed', mins: 30 },
            { day: 'Thu', mins: 15 },
            { day: 'Fri', mins: 22 },
            { day: 'Sat', mins: 40 },
            { day: 'Sun', mins: 20 },
          ].map((col, idx) => (
            <div key={idx} className="flex flex-col items-center gap-2">
              <div className="h-28 w-full max-w-[36px] bg-slate-100 rounded-lg flex flex-col justify-end p-1">
                <div
                  className="bg-blue-600 rounded-md w-full transition-all"
                  style={{ height: `${(col.mins / 40) * 100}%` }}
                />
              </div>
              <span className="font-mono text-[11px] font-bold text-slate-700">{col.mins}m</span>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">{col.day}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
