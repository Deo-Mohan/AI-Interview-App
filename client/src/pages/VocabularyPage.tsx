import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Search, 
  Sliders, 
  Sparkles, 
  RotateCw, 
  Volume2, 
  Bookmark, 
  Filter,
  CheckCircle2,
  Plus
} from 'lucide-react';
import { Button, Card, Badge } from '../components/ui';
import { VocabularyCard } from '../components/VocabularyCard';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { PageTransition, StaggerContainer, StaggerItem } from '../components/motion/MotionTransitions';
import { MOCK_VOCABULARY } from '../data/mockData';
import { VocabularyWord } from '../types';

export const VocabularyPage: React.FC = () => {
  const navigate = useNavigate();
  const [vocabList, setVocabList] = useState<VocabularyWord[]>(MOCK_VOCABULARY);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'favorites' | 'learning' | 'mastered'>('all');
  const [dailyLimit, setDailyLimit] = useState(5);

  const handleToggleFavorite = (id: string) => {
    setVocabList(prev => prev.map(w => w.id === id ? { ...w, isFavorite: !w.isFavorite } : w));
  };

  const filteredWords = vocabList.filter(w => {
    const matchesSearch = w.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          w.definition.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          w.synonyms.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    if (!matchesSearch) return false;
    if (filterType === 'favorites') return w.isFavorite;
    if (filterType === 'learning') return w.masteryLevel === 'learning' || w.masteryLevel === 'reviewing';
    if (filterType === 'mastered') return w.masteryLevel === 'mastered';
    return true;
  });

  return (
    <PageTransition className="space-y-6">
      {/* Top Banner & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Daily Vocabulary Lab & Dictionary
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Learn high-impact words with contextual definitions, IPA phonetics, audio, and spaced repetition drills
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/vocabulary-revision')}
            icon={<RotateCw className="size-3.5" />}
          >
            Flashcard Drill
          </Button>
          <Button
            variant="tactile"
            size="sm"
            onClick={() => navigate('/conversation-setup?mode=free-conversation')}
          >
            Practice In Conversation
          </Button>
        </div>
      </div>

      {/* Target Progress & Daily Limit Bar */}
      <Card variant="subtle" className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-slate-200 bg-white shadow-2xs">
        <div className="flex items-center gap-3.5">
          <div className="size-11 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center font-bold shrink-0">
            <BookOpen className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-extrabold text-slate-900">Today’s Target: 3 of {dailyLimit} words practiced</span>
              <Badge variant="emerald" size="sm" dot>60% Complete</Badge>
            </div>
            <div className="w-48 h-2 bg-slate-100 rounded-full overflow-hidden mt-1.5 border border-slate-200/60">
              <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: '60%' }} />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          <span className="text-xs font-bold text-slate-600">Daily Goal:</span>
          <select
            value={dailyLimit}
            onChange={(e) => setDailyLimit(Number(e.target.value))}
            className="text-xs font-bold bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
          >
            <option value={3}>3 words / day (Relaxed)</option>
            <option value={5}>5 words / day (Recommended)</option>
            <option value={10}>10 words / day (Intensive)</option>
          </select>
        </div>
      </Card>

      {/* Search & Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-xl w-full sm:w-fit border border-slate-200">
          {[
            { id: 'all', label: `All Words (${vocabList.length})` },
            { id: 'favorites', label: `Saved (${vocabList.filter(w => w.isFavorite).length})` },
            { id: 'learning', label: 'In Review' },
            { id: 'mastered', label: 'Mastered' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterType === tab.id
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            className="w-full text-xs font-medium pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-2xs"
            placeholder="Search dictionary words or synonyms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Cards Grid */}
      <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredWords.map((word) => (
          <StaggerItem key={word.id}>
            <ErrorBoundary name={`Vocabulary: ${word.word}`} compact>
              <VocabularyCard
                word={word}
                onToggleFavorite={handleToggleFavorite}
                onStartReview={() => navigate('/vocabulary-revision')}
              />
            </ErrorBoundary>
          </StaggerItem>
        ))}
      </StaggerContainer>

      {filteredWords.length === 0 && (
        <Card variant="subtle" className="text-center py-12 border-dashed border-slate-300">
          <BookOpen className="size-10 mx-auto text-slate-400 mb-2 opacity-60" />
          <h4 className="text-sm font-bold text-slate-800">No vocabulary words match your filter</h4>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Try adjusting your search query or switch back to the "All Words" tab.
          </p>
        </Card>
      )}
    </PageTransition>
  );
};
