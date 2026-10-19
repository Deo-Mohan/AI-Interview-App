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
  ChevronRight
} from 'lucide-react';
import { Button, Card, Badge } from '../components/ui';
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
      case 'free-conversation': return <Coffee className="size-5 text-slate-700" />;
      case 'topic-discussion': return <Users className="size-5 text-rose-600" />;
      default: return <Sparkles className="size-5 text-blue-600" />;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Welcome Card */}
      <Card variant="hero" className="relative overflow-hidden bg-white border border-slate-200">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="blue" size="sm">
                Ready for Practice
              </Badge>
              <span className="font-mono text-xs text-slate-500 font-bold">CEFR Current Level: {stats.currentCefrEstimate}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Ready to speak, Krish?
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium">
              Your AI mentor is ready with a supportive, natural session. Today’s recommended focus is <span className="font-bold text-slate-900">Technical & Behavioral Interview Practice</span>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Button
              variant="tactile"
              size="lg"
              onClick={() => navigate('/conversation-setup?mode=resume-interview')}
              icon={<Mic className="size-5" />}
            >
              Start Live Practice
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/modes')}
            >
              Browse All Modes
            </Button>
          </div>
        </div>
      </Card>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Speaking Streak */}
        <Card variant="default" className="flex items-center gap-4">
          <div className="size-12 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
            <Flame className="size-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Speaking Streak</span>
            <span className="text-2xl font-black text-slate-900 font-mono">{stats.speakingStreakDays} Days</span>
          </div>
        </Card>

        {/* Total Time */}
        <Card variant="default" className="flex items-center gap-4">
          <div className="size-12 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
            <Clock className="size-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Time Spoken</span>
            <span className="text-2xl font-black text-slate-900 font-mono">{stats.totalSpeakingMinutes} Mins</span>
          </div>
        </Card>

        {/* Fluency Score */}
        <Card variant="default" className="flex items-center gap-4">
          <div className="size-12 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
            <Award className="size-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Average Fluency</span>
            <span className="text-2xl font-black text-slate-900 font-mono">{stats.averageFluencyScore}%</span>
          </div>
        </Card>

        {/* Vocabulary Goal */}
        <Card variant="default" className="flex items-center gap-4">
          <div className="size-12 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center shrink-0">
            <BookOpen className="size-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Words Mastered</span>
            <span className="text-2xl font-black text-slate-900 font-mono">{stats.vocabularyMastered}</span>
          </div>
        </Card>
      </div>

      {/* Main Grid: Modes & Daily Vocab Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: 5 Conversation Modes */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">Five Practice Modes</h3>
              <p className="text-xs text-slate-500 font-medium">Select a focused environment for your spoken English session</p>
            </div>
            <Link to="/modes" className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              View all <ChevronRight className="size-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {MOCK_PRACTICE_MODES.map((mode) => (
              <Card
                key={mode.id}
                variant="interactive"
                className="flex flex-col justify-between"
                onClick={() => navigate(`/conversation-setup?mode=${mode.id}`)}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 shrink-0">
                      {getModeIcon(mode.id)}
                    </div>
                    {mode.badge && (
                      <Badge variant={mode.badge === 'Popular' ? 'blue' : 'emerald'} size="sm">
                        {mode.badge}
                      </Badge>
                    )}
                  </div>
                  <h4 className="text-base font-bold text-slate-900 tracking-tight mb-1">
                    {mode.shortTitle}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium line-clamp-2">
                    {mode.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-400">
                  <span className="font-mono">{mode.suggestedDuration}</span>
                  <span className="font-bold text-blue-600 flex items-center gap-1">
                    Select <ArrowRight className="size-3" />
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Right Col: Daily Vocabulary & Error Trend */}
        <div className="space-y-6">
          {/* Daily Word Highlight */}
          <Card variant="default" className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Word of the Day</span>
              <Badge variant="emerald" size="sm">Daily Goal 3/5</Badge>
            </div>
            <div>
              <div className="flex items-baseline gap-2 mb-1">
                <h4 className="text-xl font-black text-slate-900">{wordOfTheDay.word}</h4>
                <span className="font-mono text-xs text-slate-500">{wordOfTheDay.phonetic}</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-medium mb-3">
                {wordOfTheDay.definition}
              </p>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 italic">
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
          <Card variant="subtle" className="space-y-3">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
              <AlertTriangle className="size-4 text-amber-500" />
              <span>Personalized Revision Spotlight</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Based on your last 5 sessions, watch out for <span className="font-bold text-slate-800">Past Tense Auxiliaries ("didn't knew" → "didn't know")</span>.
            </p>
            <div className="pt-2">
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
      </div>

      {/* Bottom Section: Recent Sessions & Saved Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
        {/* Recent Sessions */}
        <Card variant="default" className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">Recent Practice Sessions</h3>
            <span className="text-xs text-slate-400 font-mono">Last 3 recorded</span>
          </div>

          <div className="space-y-3">
            {MOCK_RECENT_SESSIONS.map((sess) => (
              <div key={sess.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="space-y-0.5">
                  <span className="text-sm font-bold text-slate-900 block">{sess.modeTitle}</span>
                  <span className="text-xs text-slate-500">{sess.keyTopic}</span>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md block mb-0.5">
                    {sess.fluencyScore}% Fluency
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">{sess.date}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recently Saved Notes */}
        <Card variant="default" className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">Recently Saved Notes</h3>
            <Link to="/notes" className="text-xs font-bold text-blue-600 hover:text-blue-700">
              View all notes
            </Link>
          </div>

          <div className="space-y-3">
            {MOCK_SAVED_NOTES.map((note) => (
              <div key={note.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-900">{note.title}</span>
                  <Badge variant="blue" size="sm">{note.cefrLevel}</Badge>
                </div>
                <p className="text-xs text-slate-600 line-clamp-2">
                  {note.overview}
                </p>
                <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400 font-mono">
                  <span>{note.date}</span>
                  <Link to={`/notes?id=${note.id}`} className="text-blue-600 font-semibold hover:underline">
                    Read lesson notes →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
