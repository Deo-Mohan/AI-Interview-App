import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bot, 
  Upload, 
  FileText, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  Sliders,
  Shield,
  HelpCircle
} from 'lucide-react';
import { Button, Card, Badge } from '../components/ui';

export const InterviewSetupPage: React.FC = () => {
  const navigate = useNavigate();
  const [candidateRole, setCandidateRole] = useState('Senior Full Stack Engineer');
  const [interviewType, setInterviewType] = useState<'mixed' | 'technical' | 'behavioral'>('mixed');
  const [companyContext, setCompanyContext] = useState('Tier-1 Silicon Valley tech company or high-growth startup');
  const [jobDescription, setJobDescription] = useState('Looking for an experienced engineer to architect scalable frontend systems, lead engineering design reviews, and mentor junior colleagues.');
  const [resumeUploaded, setResumeUploaded] = useState(true);

  const handleStartMockInterview = () => {
    navigate('/conversation?mode=resume-interview');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="blue" size="sm">Resume-Aware Engine</Badge>
          <span className="text-xs text-slate-400 font-mono">Simulated Mock Format</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Technical & HR Mock Interview Setup
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          Prepare for tough interview questions using your actual resume and target role expectations
        </p>
      </div>

      {/* Resume Card */}
      <Card variant="default" className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <FileText className="size-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">Your Resume on File</h3>
          </div>
          <Badge variant="emerald" size="sm" dot>Parsed & Ready</Badge>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <span className="text-sm font-bold text-slate-900">Krish_Patel_FullStack_2026.pdf</span>
            <span className="text-xs text-slate-500 block">5+ years experience • React, TypeScript, Node.js, Distributed Systems</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" icon={<Upload className="size-3.5" />}>
              Replace Resume
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Shield className="size-4 text-emerald-600 shrink-0" />
          <span>Stored privately in Supabase Storage with Row-Level Security. Never shared or used for model training.</span>
        </div>
      </Card>

      {/* Target Role & Questions Preferences */}
      <Card variant="default" className="space-y-4">
        <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
          Target Role & Interview Round
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Candidate Target Role:
            </label>
            <input
              type="text"
              className="w-full text-xs font-medium text-slate-800 p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              value={candidateRole}
              onChange={(e) => setCandidateRole(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Target Company Type / Context:
            </label>
            <input
              type="text"
              className="w-full text-xs font-medium text-slate-800 p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              value={companyContext}
              onChange={(e) => setCompanyContext(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
            Round Focus:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'mixed', label: 'Mixed Tech & Behavioral' },
              { id: 'technical', label: 'System Design & Code' },
              { id: 'behavioral', label: 'STAR Leadership & HR' },
            ].map(r => (
              <button
                key={r.id}
                onClick={() => setInterviewType(r.id as any)}
                className={`p-3 rounded-xl border text-xs font-bold text-center transition-all ${
                  interviewType === r.id
                    ? 'bg-blue-600 text-white border-blue-700 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
            Job Description Highlights (Optional):
          </label>
          <textarea
            rows={3}
            className="w-full text-xs font-medium text-slate-800 p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
        </div>
      </Card>

      {/* Launch CTA */}
      <div className="flex items-center justify-between pt-2">
        <Button
          variant="outline"
          size="lg"
          onClick={() => navigate('/modes')}
        >
          Back
        </Button>
        <Button
          variant="tactile"
          size="lg"
          onClick={handleStartMockInterview}
          icon={<Bot className="size-5" />}
        >
          Begin Mock Interview
        </Button>
      </div>
    </div>
  );
};
