import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';

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
import { requireAuth, AuthenticatedRequest } from './middleware/auth.js';
import { ResumeParserService } from './services/resumeParserService.js';
import { SupabaseService } from './services/supabaseService.js';
import { ProviderManager } from './services/providerManager.js';
import { SecretRedactor } from './services/secretRedactor.js';
import { requestIdMiddleware, RequestWithId } from './middleware/requestId.js';
import { createRateLimiter } from './middleware/rateLimiter.js';
import { idempotencyMiddleware } from './services/idempotencyService.js';
import { DataRetentionService } from './services/dataRetentionService.js';
import { InterviewTurnRequestSchema } from './types/interview.js';
import { InterviewService } from './services/interviewService.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const serverStartTime = Date.now();

// Request ID and Tracing Middleware
app.use(requestIdMiddleware);

// Security Headers Middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(self), geolocation=()');
  next();
});

// Enable CORS for client
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json({ limit: '2mb' }));

// Rate Limiters
const globalLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 120,
  message: 'Global rate limit reached. Please pace your requests.'
});
app.use('/api/', globalLimiter);

const uploadLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 10,
  message: 'Upload rate limit reached. Maximum 10 resume uploads per minute.'
});

const mentorTurnLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 45,
  message: 'Mentor interaction rate limit reached. Please wait a moment before sending more speech.'
});

const notesLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 20,
  message: 'Note generation rate limit reached. Please wait before generating more lesson notes.'
});

// Initialize Providers & Services
const openAiKey = process.env.OPENAI_API_KEY;
const providerManager = new ProviderManager();
const mentorService = new DefaultAIMentorService(openAiKey, providerManager);
const dictionaryAdapter = new FreeDictionaryApiAdapter();
const dailyVocabService = new DailyVocabularyService(dictionaryAdapter);
const notesGeneratorService = new NotesGeneratorService();

let llmProvider: LLMProviderAdapter;
if (openAiKey && openAiKey.startsWith('sk-') && openAiKey.length > 20) {
  SecretRedactor.log('INFO', '[Provider] Initializing live OpenAI provider adapter');
  llmProvider = new OpenAIAdapter(openAiKey);
} else {
  SecretRedactor.log('INFO', '[Provider] Initializing built-in Pedagogical Mock LLM adapter (Zero API cost / instantaneous)');
  llmProvider = new MockLLMAdapter();
}

// Setup multer memory storage for PDF parsing
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Comprehensive Health & Diagnostics Check
app.get('/api/health', (req: RequestWithId, res: Response) => {
  const memory = process.memoryUsage();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor((Date.now() - serverStartTime) / 1000),
    requestId: req.id,
    memory: {
      rssMb: Math.round(memory.rss / (1024 * 1024)),
      heapUsedMb: Math.round(memory.heapUsed / (1024 * 1024)),
      heapTotalMb: Math.round(memory.heapTotal / (1024 * 1024))
    },
    speechRecognitionSupported: ['browser-speech', 'whisper-server'],
    ttsSupported: ['browser-speech-synthesis', 'elevenlabs'],
    activePhase: 'Phase 7 (Security, Provider Management & Reliability)',
    diagnostics: providerManager.getDiagnostics(),
    retentionPolicy: DataRetentionService.getRetentionPolicy()
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
    SecretRedactor.log('ERROR', 'Dictionary lookup failed', { error: error.message });
    return res.status(500).json({ error: 'Failed to lookup word', message: SecretRedactor.redactString(error.message) });
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
    SecretRedactor.log('ERROR', 'Daily vocab assignment failed', { error: error.message });
    return res.status(500).json({ error: 'Failed to assign daily vocabulary', message: SecretRedactor.redactString(error.message) });
  }
});

// Generate Notes Endpoint (Protected by Idempotency & Rate Limiting)
app.post('/api/notes/generate', notesLimiter, idempotencyMiddleware(), (req: Request, res: Response) => {
  try {
    const parseResult = GenerateNotesRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Invalid request payload', details: parseResult.error.issues });
    }
    const generatedNotes = notesGeneratorService.generateSessionNotes(parseResult.data);
    return res.json(generatedNotes);
  } catch (error: any) {
    SecretRedactor.log('ERROR', 'Note generation failed', { error: error.message });
    return res.status(500).json({ error: 'Failed to generate session notes', message: SecretRedactor.redactString(error.message) });
  }
});

// Resume Upload & Safe Text Extraction Endpoint
app.post('/api/resume/upload', uploadLimiter, requireAuth, upload.single('resume'), async (req: AuthenticatedRequest, res: Response) => {
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
    SecretRedactor.log('ERROR', 'Resume parsing error', { error: err.message });
    return res.status(400).json({
      error: 'Resume upload and parsing failed',
      message: SecretRedactor.redactString(err.message)
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

// User Data Deletion / Right to Erasure Endpoint (Phase 7 Privacy Control)
app.delete('/api/user/data', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized user' });
    }

    const deletionSummary = await DataRetentionService.deleteUserData(userId);
    return res.json({
      success: true,
      message: 'All user data, transcripts, resumes, and notes deleted successfully.',
      deletionSummary
    });
  } catch (err: any) {
    SecretRedactor.log('ERROR', 'User data deletion failed', { error: err.message });
    return res.status(500).json({
      error: 'Data deletion failed',
      message: SecretRedactor.redactString(err.message)
    });
  }
});

// Credentials Management Endpoints (BYOK Architecture)
import { UserCredentialManager } from './services/userCredentialManager.js';

// Test connection to AI provider
app.post('/api/credentials/test', async (req: Request, res: Response) => {
  try {
    const { provider, apiKey, model, customEndpoint } = req.body;
    if (!provider || !apiKey || !model) {
      return res.status(400).json({ error: 'Provider, apiKey, and model are required.' });
    }
    const result = await UserCredentialManager.testConnection({ provider, apiKey, model, customEndpoint });
    return res.json(result);
  } catch (err: any) {
    SecretRedactor.log('WARN', 'Credential connection test failed', { error: err.message });
    return res.status(400).json({
      ok: false,
      error: 'Connection test failed',
      message: SecretRedactor.redactString(err.message)
    });
  }
});

// Save or replace user credentials (with session or AES-256-GCM persistent storage)
app.post('/api/credentials/save', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { provider, apiKey, model, customEndpoint, persistenceType, consentToStore } = req.body;
    const metadata = await UserCredentialManager.saveCredential(userId, {
      provider,
      apiKey,
      model,
      customEndpoint,
      persistenceType: persistenceType || 'session_only',
      consentToStore: !!consentToStore
    });
    return res.json({ success: true, metadata });
  } catch (err: any) {
    SecretRedactor.log('ERROR', 'Save credentials failed', { error: err.message });
    return res.status(400).json({
      error: 'Failed to save credentials',
      message: SecretRedactor.redactString(err.message)
    });
  }
});

// Get user credential status (Metadata ONLY - Never returns secret keys or ciphertexts)
app.get('/api/credentials/status', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const metadata = await UserCredentialManager.getCredentialMetadata(userId);
    return res.json({
      isConfigured: !!metadata,
      metadata: metadata || null
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to get credentials status', message: SecretRedactor.redactString(err.message) });
  }
});

// Delete user credentials permanently
app.delete('/api/credentials', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    await UserCredentialManager.deleteCredential(userId);
    return res.json({ success: true, message: 'API credentials permanently removed.' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to delete credentials', message: SecretRedactor.redactString(err.message) });
  }
});

// Full Pedagogical AI Mentor Endpoint (Protected by Circuit Breaker & Rate Limiter)
app.post('/api/conversation/mentor-turn', mentorTurnLimiter, async (req: Request, res: Response) => {
  try {
    const parseResult = MentorChatRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Invalid mentor request payload',
        details: parseResult.error.issues
      });
    }

    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.id || 'demo-learner-001';
    const userCredentials = await UserCredentialManager.getResolvedCredential(userId);

    // If no provider is configured, do not silently use an application-owned key!
    if (!userCredentials && !openAiKey) {
      return res.status(412).json({
        error: 'NO_AI_PROVIDER_CONFIGURED',
        message: 'No AI provider credentials configured. Please configure your Google Gemini, OpenAI, or Anthropic API key in Settings.',
        setupRequired: true
      });
    }

    const mentorResponse = await mentorService.generateMentorTurn(parseResult.data, userCredentials || undefined);
    return res.json(mentorResponse);
  } catch (error: any) {
    SecretRedactor.log('ERROR', 'Mentor turn generation failed', { error: error.message });
    return res.status(500).json({
      error: 'Failed to generate mentor turn',
      message: SecretRedactor.redactString(error.message || 'Internal server error')
    });
  }
});

// Professional AI Interviewer Endpoint (State Machine Turn & Dual Evaluation)
app.post('/api/interview/turn', mentorTurnLimiter, async (req: Request, res: Response) => {
  try {
    const parseResult = InterviewTurnRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Invalid interview turn request payload',
        details: parseResult.error.issues
      });
    }

    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.id || 'demo-learner-001';
    const userCredentials = await UserCredentialManager.getResolvedCredential(userId);

    // Enforce BYOK requirement - do not hardcode or silently fallback
    if (!userCredentials) {
      return res.status(412).json({
        error: 'NO_AI_PROVIDER_CONFIGURED',
        message: 'No AI provider credentials configured. Please configure your Google Gemini, OpenAI, or Anthropic API key in Settings to practice technical interviews.',
        setupRequired: true
      });
    }

    const interviewResponse = await InterviewService.processInterviewTurn(parseResult.data, userCredentials);
    return res.json(interviewResponse);
  } catch (error: any) {
    SecretRedactor.log('ERROR', 'Interview turn generation failed', { error: error.message });
    return res.status(500).json({
      error: 'Failed to process interview turn',
      message: SecretRedactor.redactString(error.message || 'Internal server error')
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
    SecretRedactor.log('ERROR', 'Failed to generate AI reply', { error: error.message });
    return res.status(500).json({
      error: 'Failed to generate AI response',
      message: SecretRedactor.redactString(error.message || 'Internal server error')
    });
  }
});

// Centralized Redacting Error Middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  SecretRedactor.log('ERROR', 'Unhandled Server Error', {
    path: req.path,
    error: err.message,
    stack: err.stack
  });

  const statusCode = err.status || err.statusCode || 500;
  return res.status(statusCode).json({
    error: err.name || 'InternalServerError',
    message: SecretRedactor.redactString(err.message || 'An unexpected error occurred.'),
    requestId: (req as RequestWithId).id
  });
});

// Start Server
app.listen(port, () => {
  SecretRedactor.log('INFO', `[Server] AI English Coach Engine running at http://localhost:${port}`);
});

export { app, providerManager, mentorService };
