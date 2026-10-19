import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GenerateReplyRequestSchema } from './types/conversation.js';
import { MockLLMAdapter, OpenAIAdapter, LLMProviderAdapter } from './services/providers.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Enable CORS for client
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

// Initialize Provider
const openAiKey = process.env.OPENAI_API_KEY;
let llmProvider: LLMProviderAdapter;

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
    ttsSupported: ['browser-speech-synthesis', 'elevenlabs']
  });
});

// Conversational AI Generation Endpoint
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
