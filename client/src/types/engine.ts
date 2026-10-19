export type ConversationState = 
  | 'idle'
  | 'requesting_permission'
  | 'connecting'
  | 'listening'
  | 'processing'
  | 'speaking'
  | 'paused'
  | 'ending'
  | 'completed'
  | 'failed';

export interface GrammarCorrection {
  original: string;
  suggested: string;
  explanation: string;
}

export interface ConversationMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  isPartial?: boolean;
  grammarFeedback?: GrammarCorrection;
  naturalAlternative?: string;
  vocabularyHighlight?: string;
}

export type MentorGender = 'female' | 'male';

export interface MentorProfile {
  id: string;
  name: string;
  gender: MentorGender;
  role: string;
  tagline: string;
  voiceName: string;
  modelUrl: string;
  accentColor: string;
  tags: string[];
}

export interface ConversationEngineConfig {
  modeId: string;
  speechRate?: number; // 0.85 to 1.15
  voiceGender?: MentorGender;
  preferredVoiceUri?: string;
  speechPitch?: number;
}
