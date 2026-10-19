export type InterviewStage = 
  | 'INTRODUCTION'
  | 'QUESTION'
  | 'LISTENING'
  | 'EVALUATION'
  | 'FOLLOW_UP_OR_NEXT_QUESTION'
  | 'FINAL_REPORT';

export type QuestionCategory = 
  | 'technical'
  | 'project_deep_dive'
  | 'architecture'
  | 'behavioral_star'
  | 'hr_leadership';

export interface GrammarCorrection {
  original: string;
  suggested: string;
  explanation: string;
}

export interface CandidateEvaluation {
  technicalCorrectnessScore: number;
  technicalCritique: string;
  englishFluencyScore: number;
  englishCritique: string;
  starFrameworkScore?: number;
  isVagueOrIncomplete: boolean;
  grammarCorrections: GrammarCorrection[];
  naturalNativeAlternative?: string;
}

export interface DetailedQuestionAssessment {
  category: string;
  question: string;
  candidateAnswerSummary: string;
  technicalEvaluation: string;
  fluencyEvaluation: string;
  recommendedNativeFraming: string;
}

export interface FinalInterviewReport {
  overallTechnicalScore: number;
  overallFluencyScore: number;
  hiringRecommendation: 'Strong Hire' | 'Hire' | 'Leaning Hire' | 'Needs Practice';
  calibratedSeniority: string;
  keyStrengths: string[];
  growthAreas: string[];
  detailedQuestionAssessments: DetailedQuestionAssessment[];
}

export interface InterviewTurnResponse {
  nextStage: InterviewStage;
  questionIndex: number;
  totalQuestions: number;
  category: QuestionCategory;
  spokenQuestion: string;
  interviewerReasoning?: string;
  evaluation?: CandidateEvaluation;
  isInterviewComplete: boolean;
  finalReport?: FinalInterviewReport;
}
