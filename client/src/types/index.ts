export type ConversationModeId = 
  | 'resume-interview'
  | 'scenario-roleplay'
  | 'office-english'
  | 'free-conversation'
  | 'topic-discussion';

export interface PracticeMode {
  id: ConversationModeId;
  title: string;
  shortTitle: string;
  badge?: string;
  description: string;
  iconName: string;
  category: 'interview' | 'professional' | 'daily';
  suggestedDuration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface SessionHistoryItem {
  id: string;
  modeId: ConversationModeId;
  modeTitle: string;
  date: string;
  durationMinutes: number;
  fluencyScore: number;
  grammarCorrectionsCount: number;
  keyTopic: string;
}

export interface VocabularyWord {
  id: string;
  word: string;
  phonetic: string;
  partOfSpeech: string;
  definition: string;
  audioUrl?: string;
  synonyms: string[];
  antonyms: string[];
  exampleSentences: string[];
  isFavorite: boolean;
  masteryLevel: 'learning' | 'reviewing' | 'mastered';
  timesReviewed: number;
  lastReviewedDate?: string;
}

export interface SavedNote {
  id: string;
  title: string;
  date: string;
  modeTitle: string;
  cefrLevel: string;
  speakingSpeedWpm: number;
  overview: string;
  grammarFeedback: {
    original: string;
    correction: string;
    explanation: string;
  }[];
  newVocabulary: string[];
  naturalAlternatives: {
    learnerSaid: string;
    betterAlternative: string;
  }[];
  userNotes?: string;
}

export interface UserProgressStats {
  speakingStreakDays: number;
  totalSpeakingMinutes: number;
  sessionsCompleted: number;
  averageFluencyScore: number;
  vocabularyMastered: number;
  currentCefrEstimate: string;
  recurringGrammarPatterns: {
    category: string;
    frequency: number;
    tip: string;
  }[];
}
