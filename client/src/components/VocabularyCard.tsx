import React from 'react';
import { Volume2, Bookmark, BookmarkCheck, ArrowRight, Sparkles } from 'lucide-react';
import { VocabularyWord } from '../types';
import { Badge, Button, Card } from './ui';

interface VocabularyCardProps {
  word: VocabularyWord;
  onToggleFavorite?: (id: string) => void;
  onStartReview?: (word: VocabularyWord) => void;
}

export const VocabularyCard: React.FC<VocabularyCardProps> = ({
  word,
  onToggleFavorite,
  onStartReview,
}) => {
  const playPronunciation = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word.word);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <Card variant="default" className="flex flex-col justify-between hover:border-blue-300 transition-all">
      <div>
        {/* Top Header: Word, Phonetics, Part of speech, and Bookmark */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex flex-wrap items-baseline gap-2.5">
            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">{word.word}</h3>
            <span className="font-mono text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
              {word.phonetic}
            </span>
            <Badge variant="blue" size="sm">
              {word.partOfSpeech}
            </Badge>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={playPronunciation}
              className="size-8 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-600 hover:text-blue-600 transition-colors"
              title="Listen to pronunciation"
              aria-label="Listen to pronunciation"
            >
              <Volume2 className="size-4" />
            </button>
            <button
              onClick={() => onToggleFavorite && onToggleFavorite(word.id)}
              className="size-8 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-400 hover:text-amber-500 transition-colors"
              title={word.isFavorite ? "Remove favorite" : "Save as favorite"}
            >
              {word.isFavorite ? (
                <BookmarkCheck className="size-4 text-amber-500 fill-amber-500" />
              ) : (
                <Bookmark className="size-4" />
              )}
            </button>
          </div>
        </div>

        {/* Definition */}
        <p className="text-sm text-slate-700 leading-relaxed font-medium mb-4">
          {word.definition}
        </p>

        {/* 3 Example Sentences */}
        <div className="space-y-1.5 mb-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Context Examples:
          </span>
          {word.exampleSentences.slice(0, 3).map((sentence, idx) => (
            <div key={idx} className="flex items-start gap-2 text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
              <span className="font-mono text-[10px] text-blue-600 font-bold shrink-0 mt-0.5">0{idx + 1}.</span>
              <p className="italic">"{sentence}"</p>
            </div>
          ))}
        </div>

        {/* Synonyms & Antonyms */}
        <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-slate-100">
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Synonyms:</span>
            <div className="flex flex-wrap gap-1">
              {word.synonyms.slice(0, 3).map((s, i) => (
                <span key={i} className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-700 text-[11px] font-medium">
                  {s}
                </span>
              ))}
            </div>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Antonyms:</span>
            <div className="flex flex-wrap gap-1">
              {word.antonyms.length > 0 ? (
                word.antonyms.slice(0, 3).map((a, i) => (
                  <span key={i} className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-700 text-[11px] font-medium">
                    {a}
                  </span>
                ))
              ) : (
                <span className="text-slate-400 text-[11px] italic">None listed</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        <Badge 
          variant={word.masteryLevel === 'mastered' ? 'emerald' : word.masteryLevel === 'reviewing' ? 'amber' : 'slate'}
          size="sm"
          dot
        >
          {word.masteryLevel}
        </Badge>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onStartReview && onStartReview(word)}
          icon={<ArrowRight className="size-3.5" />}
          iconPosition="right"
        >
          Review Word
        </Button>
      </div>
    </Card>
  );
};
