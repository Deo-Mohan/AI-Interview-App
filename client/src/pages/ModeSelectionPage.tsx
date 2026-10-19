import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bot, 
  Theater, 
  Briefcase, 
  Coffee, 
  Users, 
  ArrowRight, 
  Clock, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { Button, Card, Badge } from '../components/ui';
import { MOCK_PRACTICE_MODES } from '../data/mockData';
import { ConversationModeId } from '../types';

export const ModeSelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'interview' | 'professional' | 'daily'>('all');

  const filteredModes = MOCK_PRACTICE_MODES.filter(m => 
    selectedFilter === 'all' ? true : m.category === selectedFilter
  );

  const getModeIcon = (id: ConversationModeId) => {
    switch (id) {
      case 'resume-interview': return <Bot className="size-6 text-blue-600" />;
      case 'scenario-roleplay': return <Theater className="size-6 text-emerald-600" />;
      case 'office-english': return <Briefcase className="size-6 text-amber-600" />;
      case 'free-conversation': return <Coffee className="size-6 text-slate-700" />;
      case 'topic-discussion': return <Users className="size-6 text-rose-600" />;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Choose a Conversation Mode
        </h2>
        <p className="text-sm sm:text-base text-slate-600 font-medium">
          Tailor your spoken English practice session to your immediate personal or career goals.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 rounded-2xl w-fit border border-slate-200">
        <button
          onClick={() => setSelectedFilter('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            selectedFilter === 'all'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          All Modes (5)
        </button>
        <button
          onClick={() => setSelectedFilter('interview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            selectedFilter === 'interview'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Job Interviews
        </button>
        <button
          onClick={() => setSelectedFilter('professional')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            selectedFilter === 'professional'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Workplace & Group
        </button>
        <button
          onClick={() => setSelectedFilter('daily')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            selectedFilter === 'daily'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Daily & Scenarios
        </button>
      </div>

      {/* Mode Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
        {filteredModes.map((mode) => (
          <Card
            key={mode.id}
            variant="default"
            className="flex flex-col justify-between hover:border-blue-400 hover:shadow-md transition-all group"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 group-hover:scale-105 transition-transform">
                  {getModeIcon(mode.id)}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="slate" size="sm">{mode.difficulty}</Badge>
                  {mode.badge && (
                    <Badge variant={mode.badge === 'Popular' ? 'blue' : 'emerald'} size="sm">
                      {mode.badge}
                    </Badge>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-1.5">{mode.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed font-medium">
                  {mode.description}
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs font-semibold text-slate-400">
                <span className="flex items-center gap-1.5 font-mono">
                  <Clock className="size-3.5 text-slate-400" />
                  {mode.suggestedDuration}
                </span>
                <span>• Natural everyday English feedback</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Ready in browser</span>
              <Button
                variant="tactile"
                size="sm"
                onClick={() => navigate(`/conversation-setup?mode=${mode.id}`)}
                icon={<ArrowRight className="size-4" />}
                iconPosition="right"
              >
                Configure & Begin
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
