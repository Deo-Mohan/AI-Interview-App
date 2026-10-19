import { z } from 'zod';

export const ConversationStateSchema = z.enum([
  'idle',
  'requesting_permission',
  'connecting',
  'listening',
  'processing',
  'speaking',
  'paused',
  'ending',
  'completed',
  'failed'
]);

export type ConversationState = z.infer<typeof ConversationStateSchema>;

export const MessageRoleSchema = z.enum(['user', 'assistant', 'system']);
export type MessageRole = z.infer<typeof MessageRoleSchema>;

export const GrammarFeedbackSchema = z.object({
  original: z.string(),
  suggested: z.string(),
  explanation: z.string(),
});
export type GrammarFeedback = z.infer<typeof GrammarFeedbackSchema>;

export const TranscriptMessageSchema = z.object({
  id: z.string(),
  role: MessageRoleSchema,
  text: z.string(),
  timestamp: z.string(),
  isFinal: z.boolean(),
  grammarFeedback: GrammarFeedbackSchema.optional(),
  naturalAlternative: z.string().optional(),
  vocabularyHighlight: z.string().optional(),
});
export type TranscriptMessage = z.infer<typeof TranscriptMessageSchema>;

export const SessionConfigSchema = z.object({
  modeId: z.string(),
  mentorTone: z.enum(['supportive', 'challenging', 'conversational']).default('supportive'),
  speechRate: z.enum(['slow', 'natural', 'brisk']).default('natural'),
  durationMinutes: z.number().default(15),
  contextData: z.record(z.string()).optional(),
});
export type SessionConfig = z.infer<typeof SessionConfigSchema>;

export const GenerateReplyRequestSchema = z.object({
  sessionId: z.string(),
  modeId: z.string(),
  history: z.array(z.object({
    role: MessageRoleSchema,
    text: z.string()
  })),
  userMessage: z.string(),
  context: z.record(z.string()).optional()
});
export type GenerateReplyRequest = z.infer<typeof GenerateReplyRequestSchema>;

export const AIReplyResponseSchema = z.object({
  replyText: z.string(),
  grammarFeedback: GrammarFeedbackSchema.optional(),
  naturalAlternative: z.string().optional(),
  vocabularyHighlight: z.string().optional(),
  cefrEstimate: z.string().optional()
});
export type AIReplyResponse = z.infer<typeof AIReplyResponseSchema>;
