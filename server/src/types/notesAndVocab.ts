import { z } from 'zod';

export const DictionaryEntrySchema = z.object({
  word: z.string(),
  phonetic: z.string().optional(),
  audioUrl: z.string().optional(),
  partOfSpeech: z.string(),
  definition: z.string(),
  synonyms: z.array(z.string()).default([]),
  antonyms: z.array(z.string()).default([]),
  exampleSentences: z.array(z.string()).length(3),
  source: z.enum(['free_dictionary_api', 'ai_generated', 'curated_database']),
  usageNotes: z.string().optional(),
});
export type DictionaryEntry = z.infer<typeof DictionaryEntrySchema>;

export const DailyVocabCategorySchema = z.enum([
  'everyday',
  'office',
  'interview',
  'mixed'
]);
export type DailyVocabCategory = z.infer<typeof DailyVocabCategorySchema>;

export const ProficiencyLevelSchema = z.enum(['beginner', 'intermediate', 'advanced']);
export type ProficiencyLevel = z.infer<typeof ProficiencyLevelSchema>;

export const DailyVocabConfigSchema = z.object({
  dailyLimit: z.number().int().positive().default(5),
  level: ProficiencyLevelSchema.default('intermediate'),
  category: DailyVocabCategorySchema.default('mixed'),
  timezone: z.string().default('UTC'),
});
export type DailyVocabConfig = z.infer<typeof DailyVocabConfigSchema>;

export const GenerateNotesRequestSchema = z.object({
  sessionId: z.string(),
  modeId: z.string(),
  modeTitle: z.string().optional(),
  messages: z.array(z.object({
    id: z.string(),
    sender: z.enum(['user', 'ai']),
    text: z.string(),
    timestamp: z.string(),
    grammarFeedback: z.object({
      original: z.string(),
      suggested: z.string(),
      explanation: z.string()
    }).optional(),
    naturalAlternative: z.string().optional(),
    vocabularyHighlight: z.string().optional()
  })),
  contextData: z.record(z.string()).optional(),
  includeFullTranscript: z.boolean().default(true),
});
export type GenerateNotesRequest = z.infer<typeof GenerateNotesRequestSchema>;

export const GeneratedNotesSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  title: z.string(),
  summary: z.string(),
  date: z.string(),
  modeTitle: z.string(),
  cefrScoreEstimate: z.string(),
  speakingSpeedWpm: z.number(),
  mainTopics: z.array(z.string()),
  importantVocabulary: z.array(z.string()),
  grammarCorrections: z.array(z.object({
    originalSentence: z.string(),
    correctedSentence: z.string(),
    ruleExplanation: z.string(),
    ruleType: z.string().optional()
  })),
  naturalAlternatives: z.array(z.object({
    learnerSaid: z.string(),
    betterNativeAlternative: z.string()
  })),
  modeSpecificFeedback: z.string(),
  exercisesAndQuestions: z.array(z.string()),
  fullTranscript: z.array(z.object({
    sender: z.enum(['user', 'ai']),
    text: z.string(),
    timestamp: z.string()
  })).optional()
});
export type GeneratedNotes = z.infer<typeof GeneratedNotesSchema>;
