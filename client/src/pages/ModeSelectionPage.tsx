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
  CheckCircle2,
  Compass
} from 'lucide-react';
import { Button, Card, Badge } from '../components/ui';
import { PageTransition, StaggerContainer, StaggerItem } from '../components/motion/MotionTransitions';
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
      case 'free-conversation': return <Coffee className="size-6 text-indigo-600" />;
      case 'topic-discussion': return <Users className="size-6 text-rose-600" />;
    }
  };

  return (
    <PageTransition className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <Badge variant="blue" size="sm" dot>Practice Environments</Badge>
          <span className="text-xs text-slate-400 font-mono font-bold">5 Focused Curriculum Tracks</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Choose a Conversation Mode
        </h2>
        <p className="text-sm sm:text-base text-slate-600 font-medium">
          Tailor your spoken English practice session to your immediate personal or career goals.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 rounded-2xl w-fit border border-slate-200">
        {[
          { id: 'all', label: 'All Modes (5)' },
          { id: 'interview', label: 'Job Interviews' },
          { id: 'professional', label: 'Workplace & Group' },
          { id: 'daily', label: 'Daily & Scenarios' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedFilter(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedFilter === tab.id
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Mode Cards Grid */}
      <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
        {filteredModes.map((mode) => (
          <StaggerItem key={mode.id}>
            <Card
              variant="default"
              className="flex flex-col justify-between hover:border-blue-400 hover:shadow-md card-hover-lift transition-all group h-full shadow-subtle border-slate-200/90"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 group-hover:scale-105 group-hover:bg-blue-50 group-hover:border-blue-200 transition-all">
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
                  <h3 className="text-lg font-extrabold text-slate-900 mb-1.5 tracking-tight group-hover:text-blue-600 transition-colors">
                    {mode.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                    {mode.description}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
                  <span className="flex items-center gap-1.5 font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60 font-bold">
                    <Clock className="size-3.5 text-blue-600" />
                    {mode.suggestedDuration}
                  </span>
                  <span>• Active pronunciation & tense coaching</span>
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
          </StaggerItem>
        ))}
      </StaggerContainer>
    </PageTransition>
  );
};
