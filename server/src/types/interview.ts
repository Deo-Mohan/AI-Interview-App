import { z } from 'zod';

export const InterviewStageSchema = z.enum([
  'INTRODUCTION',
  'QUESTION',
  'LISTENING',
  'EVALUATION',
  'FOLLOW_UP_OR_NEXT_QUESTION',
  'FINAL_REPORT'
]);
export type InterviewStage = z.infer<typeof InterviewStageSchema>;

export const QuestionCategorySchema = z.enum([
  'technical',
  'project_deep_dive',
  'architecture',
  'behavioral_star',
  'hr_leadership'
]);
export type QuestionCategory = z.infer<typeof QuestionCategorySchema>;

export const CandidateEvaluationSchema = z.object({
  technicalCorrectnessScore: z.number().min(0).max(100),
  technicalCritique: z.string(),
  englishFluencyScore: z.number().min(0).max(100),
  englishCritique: z.string(),
  starFrameworkScore: z.number().min(0).max(100).optional(),
  isVagueOrIncomplete: z.boolean(),
  grammarCorrections: z.array(z.object({
    original: z.string(),
    suggested: z.string(),
    explanation: z.string()
  })).default([]),
  naturalNativeAlternative: z.string().optional()
});
export type CandidateEvaluation = z.infer<typeof CandidateEvaluationSchema>;

export const InterviewTurnRequestSchema = z.object({
  sessionId: z.string(),
  currentStage: InterviewStageSchema.default('QUESTION'),
  questionIndex: z.number().default(0),
  totalQuestions: z.number().default(5),
  candidateRole: z.string().default('Senior Full Stack Engineer'),
  seniorityLevel: z.enum(['junior', 'mid', 'senior', 'staff']).default('senior'),
  interviewType: z.enum(['mixed', 'technical', 'behavioral']).default('mixed'),
  jobDescription: z.string().optional(),
  resumeSummary: z.string().optional(),
  history: z.array(z.object({
    role: z.enum(['assistant', 'user', 'system']),
    text: z.string()
  })).default([]),
  userMessage: z.string().optional().default(''),
  previousQuestion: z.string().optional()
});
export type InterviewTurnRequest = z.infer<typeof InterviewTurnRequestSchema>;

export const InterviewTurnResponseSchema = z.object({
  nextStage: InterviewStageSchema,
  questionIndex: z.number(),
  totalQuestions: z.number(),
  category: QuestionCategorySchema,
  spokenQuestion: z.string(),
  interviewerReasoning: z.string().optional(),
  evaluation: CandidateEvaluationSchema.optional(),
  isInterviewComplete: z.boolean().default(false),
  finalReport: z.object({
    overallTechnicalScore: z.number(),
    overallFluencyScore: z.number(),
    hiringRecommendation: z.enum(['Strong Hire', 'Hire', 'Leaning Hire', 'Needs Practice']),
    calibratedSeniority: z.string(),
    keyStrengths: z.array(z.string()),
    growthAreas: z.array(z.string()),
    detailedQuestionAssessments: z.array(z.object({
      category: z.string(),
      question: z.string(),
      candidateAnswerSummary: z.string(),
      technicalEvaluation: z.string(),
      fluencyEvaluation: z.string(),
      recommendedNativeFraming: z.string()
    }))
  }).optional()
});
export type InterviewTurnResponse = z.infer<typeof InterviewTurnResponseSchema>;
