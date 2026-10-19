import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Download, 
  Save, 
  CheckCircle2, 
  Sparkles, 
  Award, 
  BookOpen, 
  AlertTriangle, 
  ArrowRight,
  Share2
} from 'lucide-react';
import { Button, Card, Badge } from '../components/ui';

export const SessionCompletePage: React.FC = () => {
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);
  const [userNotes, setUserNotes] = useState('Need to practice pausing 1-2 seconds before addressing deep system design questions.');

  const handleSaveNotes = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleExportMarkdown = () => {
    const markdownContent = `# Practice Session Notes - Technical & HR Interview
**Date**: October 19, 2026
**CEFR Fluency Rating**: B2+ (Approaching Fluent)
**Speaking Pace**: 134 words per minute

## Overview
In this session, you articulated full-stack micro-frontend architecture tradeoffs, caching strategies with Redis, and team collaboration frameworks.

## Grammar Corrections
- Original: "I didn't knew how to scale the real-time cache."
  Correction: "I didn't know how to scale the real-time cache."
  Explanation: Did/didn't already carries past tense; always pair with base verb form.

## Natural Phrasing Upgrades
- Learner: "We discuss about the architecture yesterday."
  Native Alternative: "We discussed the system architecture in our sync yesterday."

## Vocabulary Highlights
- Articulate, Pragmatic, Resilient, Throughput

## Personal Notes
${userNotes}
`;

    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MentorVoice-Session-Notes-2026-10-19.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Session Completion Hero Banner */}
      <Card variant="hero" className="border-emerald-200 bg-gradient-to-r from-white to-emerald-50/40">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="size-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                ✓
              </span>
              <Badge variant="emerald" size="sm">Session Complete</Badge>
              <span className="text-xs text-slate-400 font-mono">Duration: 14 mins 20 secs</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Great speaking session, Krish!
            </h2>
            <p className="text-sm text-slate-600 font-medium">
              Your AI mentor has analyzed your speech cadence, grammar, and vocabulary patterns.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="tactile"
              size="md"
              onClick={handleSaveNotes}
              icon={<Save className="size-4" />}
            >
              {isSaved ? 'Saved to My Notes!' : 'Save Notes'}
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={handleExportMarkdown}
              icon={<Download className="size-4" />}
            >
              Export Markdown
            </Button>
          </div>
        </div>
      </Card>

      {/* Diagnostics Grid: CEFR Level, Fluency, Speaking Rate */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card variant="default" className="text-center p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            CEFR Estimated Score
          </span>
          <span className="text-3xl font-black text-blue-600 font-mono">B2+</span>
          <span className="text-xs text-slate-500 font-medium block mt-1">Upper Intermediate</span>
        </Card>

        <Card variant="default" className="text-center p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Session Fluency Index
          </span>
          <span className="text-3xl font-black text-emerald-600 font-mono">87%</span>
          <span className="text-xs text-slate-500 font-medium block mt-1">+3% from last session</span>
        </Card>

        <Card variant="default" className="text-center p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Speaking Cadence
          </span>
          <span className="text-3xl font-black text-slate-900 font-mono">134</span>
          <span className="text-xs text-slate-500 font-medium block mt-1">Words per minute (Optimal)</span>
        </Card>
      </div>

      {/* Structured Summary & Corrections */}
      <div className="space-y-4">
        {/* Key Grammar Insights */}
        <Card variant="default" className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="size-4 text-amber-500" />
              Key Grammar Corrections (1 Caught)
            </h3>
            <Badge variant="amber" size="sm">Actionable Review</Badge>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center gap-2 text-xs">
              <span className="line-through text-slate-400 font-semibold">"I didn't knew how to scale the cache."</span>
              <ArrowRight className="size-3 text-slate-400" />
              <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                "I didn't know how to scale the cache."
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              <strong className="text-slate-800">Why:</strong> The auxiliary verb <code className="bg-slate-200/70 px-1 rounded font-mono text-[11px]">didn't</code> already signals past tense. Always keep the subsequent main verb in its base dictionary form.
            </p>
          </div>
        </Card>

        {/* Natural Phrasing Alternatives */}
        <Card variant="default" className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="size-4 text-blue-600" />
              Natural Phrasing Upgrades
            </h3>
            <Badge variant="blue" size="sm">Idiomatic Expression</Badge>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Learner Said:</span>
            <p className="text-xs text-slate-600 font-medium">"We discuss about the architecture yesterday."</p>
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block pt-1">More Natural Native Phrasing:</span>
            <p className="text-xs font-bold text-slate-800 bg-blue-50/60 p-2 rounded-lg border border-blue-100">
              "We discussed the system architecture in our sync yesterday."
            </p>
          </div>
        </Card>

        {/* Vocabulary Used & Discovered */}
        <Card variant="default" className="space-y-3">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="size-4 text-slate-700" />
            Session Vocabulary Highlights
          </h3>
          <div className="flex flex-wrap gap-2">
            {['Articulate', 'Pragmatic', 'Idempotent', 'Throughput', 'Consistency'].map((word) => (
              <span key={word} className="px-3 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800">
                {word}
              </span>
            ))}
          </div>
        </Card>

        {/* User In-line Notes & Reflection */}
        <Card variant="default" className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="size-4 text-slate-700" />
              Your Personal Session Notes (Editable)
            </h3>
            <span className="text-xs text-slate-400">Saved automatically</span>
          </div>
          <textarea
            rows={3}
            className="w-full text-xs font-medium text-slate-800 p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            value={userNotes}
            onChange={(e) => setUserNotes(e.target.value)}
          />
        </Card>
      </div>

      {/* Return to Dashboard CTA */}
      <div className="flex items-center justify-between pt-4">
        <Button
          variant="outline"
          size="md"
          onClick={() => navigate('/notes')}
        >
          View All Saved Notes
        </Button>
        <Button
          variant="tactile"
          size="md"
          onClick={() => navigate('/')}
        >
          Done & Return to Dashboard
        </Button>
      </div>
    </div>
  );
};
