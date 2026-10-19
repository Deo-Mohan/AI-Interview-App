import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GenerateReplyRequestSchema } from './types/conversation.js';
import { MentorChatRequestSchema } from './types/mentor.js';
import { 
  GenerateNotesRequestSchema, 
  DailyVocabConfigSchema 
} from './types/notesAndVocab.js';
import { MockLLMAdapter, OpenAIAdapter, LLMProviderAdapter } from './services/providers.js';
import { DefaultAIMentorService } from './services/mentorService.js';
import { FreeDictionaryApiAdapter } from './services/dictionaryAdapter.js';
import { DailyVocabularyService } from './services/dailyVocabService.js';
import { NotesGeneratorService } from './services/notesGeneratorService.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Enable CORS for client
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

// Initialize Providers & Services
const openAiKey = process.env.OPENAI_API_KEY;
let llmProvider: LLMProviderAdapter;
const mentorService = new DefaultAIMentorService(openAiKey);
const dictionaryAdapter = new FreeDictionaryApiAdapter();
const dailyVocabService = new DailyVocabularyService(dictionaryAdapter);
const notesGeneratorService = new NotesGeneratorService();

if (openAiKey && openAiKey.startsWith('sk-') && openAiKey.length > 20) {
  console.log('[Provider] Initializing live OpenAI provider adapter');
  llmProvider = new OpenAIAdapter(openAiKey);
} else {
  console.log('[Provider] Initializing built-in Pedagogical Mock LLM adapter (Zero API cost / instantaneous)');
  llmProvider = new MockLLMAdapter();
}

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    provider: openAiKey ? 'openai' : 'mock-pedagogical',
    speechRecognitionSupported: ['browser-speech', 'whisper-server'],
    ttsSupported: ['browser-speech-synthesis', 'elevenlabs'],
    activePhase: 'Phase 4 (Session Notes & Daily Vocabulary)'
  });
});

// Dictionary Lookup Endpoint
app.get('/api/dictionary/lookup/:word', async (req: Request, res: Response) => {
  try {
    const word = Array.isArray(req.params.word) ? req.params.word[0] : req.params.word;
    if (!word) {
      return res.status(400).json({ error: 'Word parameter required' });
    }
    const entry = await dictionaryAdapter.lookupWord(String(word));
    return res.json(entry);
  } catch (error: any) {
    console.error('[Error] Dictionary lookup failed:', error);
    return res.status(500).json({ error: 'Failed to lookup word', message: error.message });
  }
});

// Daily Vocabulary Assignment Endpoint
app.post('/api/vocabulary/daily', async (req: Request, res: Response) => {
  try {
    const configResult = DailyVocabConfigSchema.safeParse(req.body.config || {});
    if (!configResult.success) {
      return res.status(400).json({ error: 'Invalid config payload', details: configResult.error.issues });
    }
    const previouslyAssigned = Array.isArray(req.body.previouslyAssigned) ? req.body.previouslyAssigned : [];
    const dailyWords = await dailyVocabService.getDailyAssignedWords(configResult.data, previouslyAssigned);
    return res.json({ words: dailyWords, date: new Date().toISOString() });
  } catch (error: any) {
    console.error('[Error] Daily vocab assignment failed:', error);
    return res.status(500).json({ error: 'Failed to assign daily vocabulary', message: error.message });
  }
});

// Generate Notes Endpoint
app.post('/api/notes/generate', (req: Request, res: Response) => {
  try {
    const parseResult = GenerateNotesRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Invalid request payload', details: parseResult.error.issues });
    }
    const generatedNotes = notesGeneratorService.generateSessionNotes(parseResult.data);
    return res.json(generatedNotes);
  } catch (error: any) {
    console.error('[Error] Note generation failed:', error);
    return res.status(500).json({ error: 'Failed to generate session notes', message: error.message });
  }
});

import multer from 'multer';
import { requireAuth, AuthenticatedRequest } from './middleware/auth.js';
import { ResumeParserService } from './services/resumeParserService.js';
import { SupabaseService } from './services/supabaseService.js';

// Setup multer memory storage for PDF parsing
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Resume Upload & Safe Text Extraction Endpoint
app.post('/api/resume/upload', requireAuth, upload.single('resume'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No resume file uploaded' });
    }

    const parseResult = await ResumeParserService.parseResumePdf(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    return res.json({
      success: true,
      resume: parseResult
    });
  } catch (err: any) {
    console.error('[Error] Resume parsing error:', err);
    return res.status(400).json({
      error: 'Resume upload and parsing failed',
      message: err.message
    });
  }
});

// User Preferences & Profile Endpoint
app.get('/api/user/profile', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  res.json({
    userId: req.user?.id,
    email: req.user?.email,
    cefrTargetLevel: 'B2',
    speechRate: 'natural',
    mentorTone: 'supportive',
    dailyWordLimit: 5,
    userTimezone: 'UTC',
    speakingStreakDays: 14,
    totalSpeakingMinutes: 285
  });
});

// Full Pedagogical AI Mentor Endpoint (Phase 3)
app.post('/api/conversation/mentor-turn', async (req: Request, res: Response) => {
  try {
    const parseResult = MentorChatRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Invalid mentor request payload',
        details: parseResult.error.issues
      });
    }

    const mentorResponse = await mentorService.generateMentorTurn(parseResult.data);
    return res.json(mentorResponse);
  } catch (error: any) {
    console.error('[Error] Mentor turn generation failed:', error);
    return res.status(500).json({
      error: 'Failed to generate mentor turn',
      message: error.message || 'Internal server error'
    });
  }
});

// Legacy Conversational AI Generation Endpoint (Phase 2 compatibility)
app.post('/api/conversation/reply', async (req: Request, res: Response) => {
  try {
    const parseResult = GenerateReplyRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Invalid request payload',
        details: parseResult.error.issues
      });
    }

    const payload = parseResult.data;
    const aiResponse = await llmProvider.generateReply(payload);

    return res.json(aiResponse);
  } catch (error: any) {
    console.error('[Error] Failed to generate AI reply:', error);
    return res.status(500).json({
      error: 'Failed to generate AI response',
      message: error.message || 'Internal server error'
    });
  }
});

// Start Server
app.listen(port, () => {
  console.log(`[Server] AI English Coach Engine running at http://localhost:${port}`);
});
