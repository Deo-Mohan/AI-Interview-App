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
  BookOpen
} from 'lucide-react';
import { Button, Card, Badge } from '../components/ui';
import { exportNotesToPdf } from '../services/pdfExporter';
import { MOCK_SAVED_NOTES } from '../data/mockData';
import { SavedNote } from '../types';

export const NotesPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const selectedId = searchParams.get('id') || MOCK_SAVED_NOTES[0].id;
  const [notes, setNotes] = useState<SavedNote[]>(MOCK_SAVED_NOTES);
  const [activeNoteId, setActiveNoteId] = useState<string>(selectedId);
  const [searchTerm, setSearchTerm] = useState('');

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            My Notes & Saved Lessons
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Review past conversation recaps, grammar diagnostics, and idiom improvements
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            className="w-full text-xs font-medium pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            placeholder="Search notes or vocab..."
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
              className={`cursor-pointer transition-all ${
                activeNoteId === note.id
                  ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/20'
                  : 'hover:border-slate-300'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="blue" size="sm">{note.cefrLevel}</Badge>
                  <span className="font-mono text-[10px] text-slate-400">{note.date}</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{note.title}</h4>
                <p className="text-xs text-slate-500 line-clamp-2">{note.overview}</p>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                  <span>{note.modeTitle}</span>
                  <ChevronRight className="size-3.5 text-slate-400" />
                </div>
              </div>
            </Card>
          ))}

          {filteredNotes.length === 0 && (
            <Card variant="subtle" className="text-center py-8">
              <FileText className="size-8 mx-auto text-slate-400 mb-2" />
              <p className="text-xs text-slate-500 font-medium">No notes match your search.</p>
            </Card>
          )}
        </div>

        {/* Right Column: Note Detail Viewer (8 cols) */}
        {activeNote && (
          <div className="lg:col-span-8 space-y-5">
            <Card variant="default" className="space-y-6">
              {/* Note Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Badge variant="blue" size="sm">{activeNote.cefrLevel}</Badge>
                    <span className="text-xs text-slate-400 font-mono">• {activeNote.date}</span>
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                    {activeNote.title}
                  </h3>
                  <span className="text-xs text-slate-500 font-medium block mt-0.5">
                    Mode: {activeNote.modeTitle}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportNotesToPdf(activeNote)}
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
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Session Recap
                </span>
                <p className="text-sm text-slate-700 leading-relaxed font-medium">
                  {activeNote.overview}
                </p>
                <div className="flex items-center gap-3 pt-2 text-xs font-mono text-slate-500">
                  <span className="bg-slate-100 px-2.5 py-1 rounded-lg">
                    Speaking Speed: <strong>{activeNote.speakingSpeedWpm} WPM</strong>
                  </span>
                </div>
              </div>

              {/* Grammar Corrections Section */}
              <div className="space-y-3 pt-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Grammar Diagnostics & Explanations
                </span>
                <div className="space-y-2.5">
                  {activeNote.grammarFeedback.map((item, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="line-through text-slate-400 font-semibold">{item.original}</span>
                        <span className="text-slate-400">→</span>
                        <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
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
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Native Phrasing Alternatives
                </span>
                <div className="space-y-2.5">
                  {activeNote.naturalAlternatives.map((alt, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Learner Phrasing:</span>
                      <p className="text-xs text-slate-600 italic">"{alt.learnerSaid}"</p>
                      <span className="text-[10px] text-blue-600 font-bold uppercase block pt-1">Idiomatic Upgrade:</span>
                      <p className="text-xs font-bold text-slate-800 bg-blue-50/60 p-2 rounded-lg border border-blue-100">
                        "{alt.betterAlternative}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Vocabulary Highlights */}
              <div className="space-y-2 pt-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Highlighted Vocabulary
                </span>
                <div className="flex flex-wrap gap-2">
                  {activeNote.newVocabulary.map((vocab) => (
                    <span key={vocab} className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700">
                      {vocab}
                    </span>
                  ))}
                </div>
              </div>

              {/* Personal Reflection Notes */}
              {activeNote.userNotes && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Learner Self-Reflection
                  </span>
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-700 italic">
                    "{activeNote.userNotes}"
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
