import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Volume2, 
  RotateCw, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  Award,
  ChevronRight
} from 'lucide-react';
import { Button, Card, Badge } from '../components/ui';
import { MOCK_VOCABULARY } from '../data/mockData';

export const VocabularyRevisionPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);

  const currentWord = MOCK_VOCABULARY[currentIndex];

  const playPronunciation = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(currentWord.word);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleNext = () => {
    setIsFlipped(false);
    setReviewedCount(prev => prev + 1);
    if (currentIndex < MOCK_VOCABULARY.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/vocabulary')}
            className="size-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 transition-colors"
          >
            <ArrowLeft className="size-4" />
          </button>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Spaced Repetition Flashcard Review
            </h2>
            <span className="text-xs text-slate-400 font-medium">Card {currentIndex + 1} of {MOCK_VOCABULARY.length}</span>
          </div>
        </div>

        <Badge variant="blue" size="sm">
          {reviewedCount} Reviewed
        </Badge>
      </div>

      {/* Main Flashcard Card */}
      <Card variant="hero" className="min-h-[360px] flex flex-col justify-between p-8 text-center border-slate-300 shadow-md">
        <div className="flex items-center justify-between">
          <Badge variant="slate" size="sm">{currentWord.partOfSpeech}</Badge>
          <button
            onClick={playPronunciation}
            className="size-9 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-600 hover:text-blue-600"
            title="Listen to audio"
          >
            <Volume2 className="size-4" />
          </button>
        </div>

        <div className="py-8 space-y-3">
          <h3 className="text-4xl font-black text-slate-900 tracking-tight">
            {currentWord.word}
          </h3>
          <span className="font-mono text-sm font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full inline-block">
            {currentWord.phonetic}
          </span>

          {/* Reveal Definition on Click */}
          {isFlipped ? (
            <div className="space-y-4 pt-4 animate-fade-in text-left bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Definition:</span>
                <p className="text-sm font-medium text-slate-800 leading-relaxed">
                  {currentWord.definition}
                </p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Example:</span>
                <p className="text-xs text-slate-600 italic">
                  "{currentWord.exampleSentences[0]}"
                </p>
              </div>
            </div>
          ) : (
            <div className="pt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFlipped(true)}
              >
                Click to Reveal Meaning & Context
              </Button>
            </div>
          )}
        </div>

        {/* Action Ratings */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-3">
          {isFlipped ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNext}
                className="text-rose-600 border-rose-200 hover:bg-rose-50"
              >
                Hard (Review Soon)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNext}
                className="text-amber-700 border-amber-200 hover:bg-amber-50"
              >
                Good (3 Days)
              </Button>
              <Button
                variant="tactile"
                size="sm"
                onClick={handleNext}
              >
                Easy (Mastered)
              </Button>
            </>
          ) : (
            <span className="text-xs text-slate-400 font-medium">Try to recall the definition and sample sentence before flipping</span>
          )}
        </div>
      </Card>

      <div className="text-center">
        <button
          onClick={() => navigate('/vocabulary')}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 hover:underline"
        >
          Exit revision and return to Vocabulary Lab
        </button>
      </div>
    </div>
  );
};
