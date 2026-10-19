import { z } from 'zod';

export const CorrectionDetailSchema = z.object({
  original: z.string(),
  suggested: z.string(),
  explanation: z.string(),
  ruleType: z.enum([
    'verb_tense',
    'preposition',
    'subject_verb_agreement',
    'article',
    'word_choice',
    'pronunciation_hint',
    'sentence_structure'
  ]).optional(),
});
export type CorrectionDetail = z.infer<typeof CorrectionDetailSchema>;

export const EvaluationMetadataSchema = z.object({
  cefrEstimate: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']).optional(),
  fluencyScore: z.number().min(0).max(100).optional(),
  technicalAccuracyScore: z.number().min(0).max(100).optional(),
  starCompliance: z.boolean().optional(),
});
export type EvaluationMetadata = z.infer<typeof EvaluationMetadataSchema>;

/**
 * Standardized, validated output schema for the AI Mentor.
 * Strictly separates spoken response from teaching feedback.
 */
export const MentorResponseSchema = z.object({
  spoken_response: z.string().describe("What the AI mentor speaks aloud in natural, conversational English"),
  correction: CorrectionDetailSchema.optional().nullable().describe("Gentle grammar/syntax correction if a significant error occurred"),
  natural_alternative: z.string().optional().nullable().describe("Idiomatic native expression or phrasing upgrade"),
  brief_explanation: z.string().optional().nullable().describe("Short 1-sentence pedagogical explanation"),
  useful_phrase: z.string().optional().nullable().describe("A high-impact workplace or conversational phrase related to this exchange"),
  recurring_error_tag: z.string().optional().nullable().describe("Tag for recurring pattern tracking, e.g. 'Past Tense Auxiliary'"),
  practice_exercise: z.string().optional().nullable().describe("Optional micro drill or quick sentence transform"),
  evaluation: EvaluationMetadataSchema.optional().nullable().describe("Fluency and technical evaluation metadata"),
});
export type MentorResponse = z.infer<typeof MentorResponseSchema>;

export const CoachingPreferenceSchema = z.object({
  feedbackMode: z.enum(['balanced', 'strict', 'conversation_only']).default('balanced'),
  mentorTone: z.enum(['supportive', 'challenging', 'conversational']).default('supportive'),
  speechRate: z.enum(['slow', 'natural', 'brisk']).default('natural'),
  targetCefrLevel: z.enum(['A2', 'B1', 'B2', 'C1']).default('B2'),
});
export type CoachingPreference = z.infer<typeof CoachingPreferenceSchema>;

export const ModeContextSchema = z.object({
  modeId: z.enum([
    'resume-interview',
    'scenario-roleplay',
    'office-english',
    'free-conversation',
    'topic-discussion'
  ]),
  // 1. Interview mode fields
  resumeSummary: z.string().optional(),
  targetRole: z.string().optional(),
  jobDescription: z.string().optional(),
  interviewRound: z.enum(['mixed', 'technical', 'behavioral']).optional(),

  // 2. Scenario roleplay fields
  scenarioType: z.enum([
    'shopping',
    'phone_call',
    'restaurant',
    'travel',
    'directions',
    'appointment',
    'customer_service',
    'custom'
  ]).optional(),
  scenarioPrompt: z.string().optional(),

  // 3. Office English fields
  workplaceContext: z.enum([
    'meeting_facilitation',
    'status_update',
    'deadline_negotiation',
    'polite_disagreement',
    'professional_request',
    'general'
  ]).optional(),

  // 4. Custom Topic / GD fields
  topicTitle: z.string().optional(),
  roleInDiscussion: z.enum(['partner', 'moderator', 'group_discussion_challenger']).optional(),
  discussionDifficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']).optional(),
});
export type ModeContext = z.infer<typeof ModeContextSchema>;

export const MentorChatRequestSchema = z.object({
  sessionId: z.string(),
  userMessage: z.string(),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    text: z.string()
  })),
  context: ModeContextSchema,
  preferences: CoachingPreferenceSchema.optional(),
});
export type MentorChatRequest = z.infer<typeof MentorChatRequestSchema>;
