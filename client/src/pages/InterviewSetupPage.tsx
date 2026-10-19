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
  HelpCircle,
  Briefcase,
  Layers,
  GraduationCap
} from 'lucide-react';
import { Button, Card, Badge } from '../components/ui';
import { PageTransition } from '../components/motion/MotionTransitions';

export const InterviewSetupPage: React.FC = () => {
  const navigate = useNavigate();
  const [candidateRole, setCandidateRole] = useState('Senior Full Stack Engineer');
  const [seniorityLevel, setSeniorityLevel] = useState<'mid' | 'senior' | 'staff'>('senior');
  const [interviewType, setInterviewType] = useState<'mixed' | 'technical' | 'behavioral'>('mixed');
  const [companyContext, setCompanyContext] = useState('Tier-1 Silicon Valley tech company or high-growth startup');
  const [jobDescription, setJobDescription] = useState('Looking for an experienced engineer to architect scalable frontend systems, lead engineering design reviews, and mentor junior colleagues.');
  const [isDragOver, setIsDragOver] = useState(false);

  const handleStartMockInterview = () => {
    navigate('/conversation?mode=resume-interview');
  };

  return (
    <PageTransition className="max-w-4xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <Badge variant="blue" size="sm" dot>Resume-Aware AI Engine</Badge>
          <span className="text-xs text-slate-400 font-mono font-bold">Simulated Technical & HR Panel</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Career Mock Interview Simulator
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          Rehearse high-stakes interviews with Krish AI. Contextually tailored to your real work experience, target company, and job description.
        </p>
      </div>

      {/* Resume Card */}
      <Card variant="default" className="space-y-4 shadow-subtle border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <FileText className="size-5 text-blue-600" />
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight">Candidate Resume on File</h3>
          </div>
          <Badge variant="emerald" size="sm" dot>Parsed & Structured</Badge>
        </div>

        <div 
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setIsDragOver(false); }}
          className={`p-4 rounded-xl border-2 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            isDragOver 
              ? 'border-blue-500 bg-blue-50/50' 
              : 'border-slate-200 bg-slate-50/70 hover:border-slate-300'
          }`}
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900">Krish_Patel_FullStack_2026.pdf</span>
              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">Verified</span>
            </div>
            <span className="text-xs text-slate-500 block font-medium">
              5+ years experience • Distributed Systems, React, TypeScript, Node.js, WebRTC
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" icon={<Upload className="size-3.5" />}>
              Replace PDF
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Shield className="size-4 text-emerald-600 shrink-0" />
          <span>Encrypted with private Row-Level Security. Never shared or used for public foundation model training.</span>
        </div>
      </Card>

      {/* Target Role & Questions Preferences */}
      <Card variant="default" className="space-y-5 shadow-subtle border-slate-200">
        <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3 tracking-tight flex items-center gap-2">
          <Sliders className="size-4 text-blue-600" />
          Role Target & Interview Calibration
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block mb-1.5">
              Target Position:
            </label>
            <input
              type="text"
              className="w-full text-xs font-semibold text-slate-800 p-2.5 rounded-xl border border-slate-200 bg-slate-50/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-2xs"
              value={candidateRole}
              onChange={(e) => setCandidateRole(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block mb-1.5">
              Target Company Type:
            </label>
            <input
              type="text"
              className="w-full text-xs font-semibold text-slate-800 p-2.5 rounded-xl border border-slate-200 bg-slate-50/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-2xs"
              value={companyContext}
              onChange={(e) => setCompanyContext(e.target.value)}
            />
          </div>
        </div>

        {/* Seniority Calibration */}
        <div>
          <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block mb-1.5">
            Seniority Caliber:
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { id: 'mid', label: 'Mid-Level Engineer', desc: 'Focus on coding execution & fundamentals' },
              { id: 'senior', label: 'Senior Engineer', desc: 'System design tradeoffs & leadership' },
              { id: 'staff', label: 'Staff / Tech Lead', desc: 'Architecture strategy & organizational impact' },
            ].map(lvl => (
              <div
                key={lvl.id}
                onClick={() => setSeniorityLevel(lvl.id as any)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  seniorityLevel === lvl.id
                    ? 'bg-blue-50/70 border-blue-600 ring-1 ring-blue-600 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <span className="text-xs font-bold text-slate-900 block">{lvl.label}</span>
                <span className="text-[10px] text-slate-500 font-medium block mt-0.5">{lvl.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Round Focus Selector */}
        <div>
          <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block mb-1.5">
            Interview Round Focus:
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { id: 'mixed', label: 'Mixed Tech & Behavioral', tag: 'Balanced 50/50' },
              { id: 'technical', label: 'System Design & Code', tag: 'High-depth technical' },
              { id: 'behavioral', label: 'STAR Leadership & HR', tag: 'Behavioral & values' },
            ].map(r => (
              <button
                key={r.id}
                onClick={() => setInterviewType(r.id as any)}
                className={`p-3 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                  interviewType === r.id
                    ? 'bg-blue-600 text-white border-blue-700 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span>{r.label}</span>
                <span className={`block text-[10px] font-normal mt-0.5 ${interviewType === r.id ? 'text-blue-100' : 'text-slate-400'}`}>
                  {r.tag}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Job Description Textarea */}
        <div>
          <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block mb-1.5">
            Target Job Description (Optional context for tailored questions):
          </label>
          <textarea
            rows={3}
            className="w-full text-xs font-medium text-slate-800 p-3 rounded-xl border border-slate-200 bg-slate-50/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-2xs leading-relaxed"
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
          Back to Modes
        </Button>
        <Button
          variant="tactile"
          size="lg"
          onClick={handleStartMockInterview}
          icon={<Bot className="size-5" />}
        >
          Launch Live Mock Interview
        </Button>
      </div>
    </PageTransition>
  );
};
