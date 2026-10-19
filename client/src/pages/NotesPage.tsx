import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  FileText, 
  Download, 
  FileDown,
  Trash2, 
  Search, 
  Sparkles, 
  Clock, 
  Award,
  ChevronRight,
  BookOpen,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Button, Card, Badge } from '../components/ui';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { PageTransition } from '../components/motion/MotionTransitions';
import { exportNotesToPdf } from '../services/pdfExporter';
import { MOCK_SAVED_NOTES } from '../data/mockData';
import { SavedNote } from '../types';

export const NotesPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const selectedId = searchParams.get('id') || MOCK_SAVED_NOTES[0].id;
  const [notes, setNotes] = useState<SavedNote[]>(MOCK_SAVED_NOTES);
  const [activeNoteId, setActiveNoteId] = useState<string>(selectedId);
  const [searchTerm, setSearchTerm] = useState('');
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const activeNote = notes.find(n => n.id === activeNoteId) || notes[0];

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.modeTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.newVocabulary.some(v => v.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleExportSingleNote = (note: SavedNote) => {
    const md = `# ${note.title}
**Date**: ${note.date}
**Mode**: ${note.modeTitle}
**Estimated CEFR**: ${note.cefrLevel}
**Cadence**: ${note.speakingSpeedWpm} WPM

## Summary
${note.overview}

## Key Grammar Feedback
${note.grammarFeedback.map(g => `- Original: "${g.original}"\n  Correction: "${g.correction}"\n  Note: ${g.explanation}`).join('\n\n')}

## Natural Alternatives
${note.naturalAlternatives.map(a => `- Original: "${a.learnerSaid}"\n  Alternative: "${a.betterAlternative}"`).join('\n\n')}

## Vocabulary
${note.newVocabulary.join(', ')}

## Notes
${note.userNotes || 'None'}
`;
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${note.title.toLowerCase().replace(/\s+/g, '-')}-notes.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPdfWrapper = async (note: SavedNote) => {
    setIsExportingPdf(true);
    try {
      await exportNotesToPdf(note);
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <PageTransition className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Lesson Notes & Diagnostic Archives
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Review past conversation recaps, verified grammar diagnostics, idiomatic upgrades, and vocabulary discovered
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            className="w-full text-xs font-medium pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-2xs"
            placeholder="Search notes, topics or vocabulary..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Notes List (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          {filteredNotes.map((note) => (
            <Card
              key={note.id}
              variant="default"
              onClick={() => setActiveNoteId(note.id)}
              className={`cursor-pointer transition-all card-hover-lift ${
                activeNoteId === note.id
                  ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/25 shadow-sm'
                  : 'hover:border-slate-300'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="blue" size="sm">{note.cefrLevel}</Badge>
                  <span className="font-mono text-[10px] text-slate-400 font-semibold">{note.date}</span>
                </div>
                <h4 className="text-sm font-extrabold text-slate-900 line-clamp-1 tracking-tight">{note.title}</h4>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-medium">{note.overview}</p>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                  <span className="font-semibold text-slate-600">{note.modeTitle}</span>
                  <ChevronRight className={`size-3.5 transition-transform ${activeNoteId === note.id ? 'translate-x-1 text-blue-600' : 'text-slate-400'}`} />
                </div>
              </div>
            </Card>
          ))}

          {filteredNotes.length === 0 && (
            <Card variant="subtle" className="text-center py-8 border-dashed border-slate-200">
              <FileText className="size-8 mx-auto text-slate-400 mb-2 opacity-60" />
              <p className="text-xs text-slate-500 font-medium">No notes match your search term.</p>
            </Card>
          )}
        </div>

        {/* Right Column: Note Detail Viewer (8 cols) */}
        {activeNote && (
          <div className="lg:col-span-8 space-y-5">
            <ErrorBoundary name="Note Detail Viewer" resetKeys={[activeNoteId]}>
              <Card variant="default" className="space-y-6 shadow-subtle border-slate-200">
                {/* Note Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <Badge variant="blue" size="sm" dot>{activeNote.cefrLevel}</Badge>
                      <span className="text-xs text-slate-400 font-mono font-semibold">• {activeNote.date}</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      {activeNote.title}
                    </h3>
                    <span className="text-xs text-slate-500 font-medium block mt-0.5">
                      Practice Environment: <strong className="text-slate-700">{activeNote.modeTitle}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExportPdfWrapper(activeNote)}
                      isLoading={isExportingPdf}
                      icon={<FileDown className="size-3.5 text-rose-600" />}
                    >
                      Export PDF
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExportSingleNote(activeNote)}
                      icon={<Download className="size-3.5" />}
                    >
                      Export .md
                    </Button>
                  </div>
                </div>

                {/* Overview & Cadence */}
                <div className="space-y-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                    Session Executive Summary
                  </span>
                  <p className="text-sm text-slate-700 leading-relaxed font-medium">
                    {activeNote.overview}
                  </p>
                  <div className="flex items-center gap-3 pt-2 text-xs font-mono text-slate-600">
                    <span className="bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 font-bold">
                      Speaking Speed: <strong className="text-slate-900">{activeNote.speakingSpeedWpm} WPM</strong>
                    </span>
                  </div>
                </div>

                {/* Grammar Corrections Section */}
                <div className="space-y-3 pt-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                    Grammar Diagnostics & Explanations
                  </span>
                  <div className="space-y-3">
                    {activeNote.grammarFeedback.map((item, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-2">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="line-through text-slate-400 font-semibold">{item.original}</span>
                          <span className="text-slate-400">→</span>
                          <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {item.correction}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 font-medium leading-relaxed">
                          {item.explanation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Natural Alternatives Section */}
                <div className="space-y-3 pt-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                    Native Phrasing Alternatives
                  </span>
                  <div className="space-y-3">
                    {activeNote.naturalAlternatives.map((alt, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-1.5">
                        <span className="text-[10px] text-slate-400 font-extrabold uppercase">Learner Said:</span>
                        <p className="text-xs text-slate-600 italic font-medium">"{alt.learnerSaid}"</p>
                        <span className="text-[10px] text-blue-600 font-extrabold uppercase block pt-1">Idiomatic Upgrade:</span>
                        <p className="text-xs font-bold text-slate-900 bg-blue-50/80 p-2.5 rounded-xl border border-blue-100">
                          "{alt.betterAlternative}"
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Vocabulary Highlights */}
                <div className="space-y-2 pt-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                    Highlighted Vocabulary
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {activeNote.newVocabulary.map((vocab) => (
                      <span key={vocab} className="px-3 py-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800">
                        {vocab}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Personal Reflection Notes */}
                {activeNote.userNotes && (
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                      Learner Self-Reflection
                    </span>
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 italic font-medium leading-relaxed">
                      "{activeNote.userNotes}"
                    </div>
                  </div>
                )}
              </Card>
            </ErrorBoundary>
          </div>
        )}
      </div>
    </PageTransition>
  );
};
