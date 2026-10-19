import { MentorChatRequest, MentorResponse, MentorResponseSchema } from '../types/mentor.js';
import { PromptBuilder } from './promptBuilder.js';
import { SecretRedactor } from './secretRedactor.js';
import { EncryptionService } from './encryptionService.js';

export interface ProviderCredentials {
  provider: 'gemini' | 'openai' | 'anthropic' | 'custom';
  apiKey: string;
  model: string;
  customEndpoint?: string;
}

export interface ConnectionTestResult {
  ok: boolean;
  latencyMs: number;
  message: string;
  provider: string;
  model: string;
}

export interface AIProviderAdapter {
  testConnection(credentials: ProviderCredentials): Promise<ConnectionTestResult>;
  generateMentorTurn(request: MentorChatRequest, credentials: ProviderCredentials): Promise<MentorResponse>;
}

/**
 * Format system prompt and JSON contract for structured mentor turn
 */
function buildMentorPrompts(request: MentorChatRequest) {
  const baseSystemPrompt = PromptBuilder.getBaseSystemPrompt(request.preferences);
  const modeInstructions = PromptBuilder.getModeInstructions(request.context);

  const contract = `Strictly respond with a valid JSON object matching this schema:
{
  "spoken_response": "string (what to say aloud to the user)",
  "correction": { "original": "string", "suggested": "string", "explanation": "string", "ruleType": "verb_tense" | "preposition" | "subject_verb_agreement" | "article" | "word_choice" } or null,
  "natural_alternative": "string" or null,
  "brief_explanation": "string" or null,
  "useful_phrase": "string" or null,
  "recurring_error_tag": "string" or null,
  "practice_exercise": "string" or null,
  "evaluation": { "cefrEstimate": "B1" | "B2" | "C1", "fluencyScore": 85, "technicalAccuracyScore": 80, "starCompliance": true } or null
}`;

  return {
    systemPrompt: `${baseSystemPrompt}\n\n${modeInstructions}\n\n${contract}`
  };
}

/**
 * Clean and parse JSON from LLM response text (handles possible markdown fences)
 */
function parseCleanJson(text: string): any {
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/```\s*$/, '').trim();
  }
  return JSON.parse(cleaned);
}

/**
 * 1. Google Gemini Provider Adapter
 */
export class GeminiAdapter implements AIProviderAdapter {
  async testConnection(credentials: ProviderCredentials): Promise<ConnectionTestResult> {
    const startTime = Date.now();
    const model = credentials.model || 'gemini-1.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(credentials.apiKey)}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: 'Respond with the single word: READY' }] }]
      })
    });

    const latencyMs = Date.now() - startTime;
    if (!response.ok) {
      const errText = await response.text();
      let errorMsg = `Gemini returned HTTP ${response.status}`;
      try {
        const parsed = JSON.parse(errText);
        errorMsg = parsed.error?.message || errorMsg;
      } catch (e) {}
      throw new Error(`Google Gemini connection failed: ${SecretRedactor.redactString(errorMsg)}`);
    }

    return {
      ok: true,
      latencyMs,
      message: 'Successfully connected to Google Gemini API.',
      provider: 'gemini',
      model
    };
  }

  async generateMentorTurn(request: MentorChatRequest, credentials: ProviderCredentials): Promise<MentorResponse> {
    const { systemPrompt } = buildMentorPrompts(request);
    const model = credentials.model || 'gemini-1.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(credentials.apiKey)}`;

    const contents = [
      ...request.history.map(h => ({
        role: h.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: h.text }]
      })),
      { role: 'user', parts: [{ text: request.userMessage }] }
    ];

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents,
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.7
        }
      })
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Google Gemini error (${response.status}): ${SecretRedactor.redactString(err)}`);
    }

    const data: any = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      throw new Error('Google Gemini returned empty response.');
    }

    const parsed = parseCleanJson(rawText);
    return MentorResponseSchema.parse(parsed);
  }
}

/**
 * 2. OpenAI Provider Adapter
 */
export class OpenAIAdapter implements AIProviderAdapter {
  async testConnection(credentials: ProviderCredentials): Promise<ConnectionTestResult> {
    const startTime = Date.now();
    const model = credentials.model || 'gpt-4o-mini';

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${credentials.apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: 'Say READY' }],
        max_tokens: 5
      })
    });

    const latencyMs = Date.now() - startTime;
    if (!response.ok) {
      const errText = await response.text();
      let errorMsg = `OpenAI returned HTTP ${response.status}`;
      try {
        const parsed = JSON.parse(errText);
        errorMsg = parsed.error?.message || errorMsg;
      } catch (e) {}
      throw new Error(`OpenAI connection failed: ${SecretRedactor.redactString(errorMsg)}`);
    }

    return {
      ok: true,
      latencyMs,
      message: 'Successfully connected to OpenAI API.',
      provider: 'openai',
      model
    };
  }

  async generateMentorTurn(request: MentorChatRequest, credentials: ProviderCredentials): Promise<MentorResponse> {
    const { systemPrompt } = buildMentorPrompts(request);
    const model = credentials.model || 'gpt-4o-mini';

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${credentials.apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          ...request.history.map(h => ({ role: h.role, content: h.text })),
          { role: 'user', content: request.userMessage }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`OpenAI error (${response.status}): ${SecretRedactor.redactString(err)}`);
    }

    const data: any = await response.json();
    const rawText = data.choices?.[0]?.message?.content;
    const parsed = parseCleanJson(rawText);
    return MentorResponseSchema.parse(parsed);
  }
}

/**
 * 3. Anthropic Claude Provider Adapter
 */
export class AnthropicAdapter implements AIProviderAdapter {
  async testConnection(credentials: ProviderCredentials): Promise<ConnectionTestResult> {
    const startTime = Date.now();
    const model = credentials.model || 'claude-3-5-haiku-20241022';

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': credentials.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model,
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Say READY' }]
      })
    });

    const latencyMs = Date.now() - startTime;
    if (!response.ok) {
      const errText = await response.text();
      let errorMsg = `Anthropic returned HTTP ${response.status}`;
      try {
        const parsed = JSON.parse(errText);
        errorMsg = parsed.error?.message || errorMsg;
      } catch (e) {}
      throw new Error(`Anthropic connection failed: ${SecretRedactor.redactString(errorMsg)}`);
    }

    return {
      ok: true,
      latencyMs,
      message: 'Successfully connected to Anthropic API.',
      provider: 'anthropic',
      model
    };
  }

  async generateMentorTurn(request: MentorChatRequest, credentials: ProviderCredentials): Promise<MentorResponse> {
    const { systemPrompt } = buildMentorPrompts(request);
    const model = credentials.model || 'claude-3-5-sonnet-20241022';

    // Anthropic requires alternating user/assistant messages
    const messages = [
      ...request.history.map(h => ({
        role: h.role === 'assistant' ? 'assistant' : 'user',
        content: h.text
      })),
      { role: 'user', content: request.userMessage }
    ];

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': credentials.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model,
        max_tokens: 1024,
        system: systemPrompt,
        messages
      })
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Anthropic error (${response.status}): ${SecretRedactor.redactString(err)}`);
    }

    const data: any = await response.json();
    const rawText = data.content?.[0]?.text;
    const parsed = parseCleanJson(rawText);
    return MentorResponseSchema.parse(parsed);
  }
}

/**
 * 4. OpenAI-Compatible Custom Provider Adapter (Groq, Together, DeepSeek, Local)
 */
export class CustomOpenAICompatibleAdapter implements AIProviderAdapter {
  async testConnection(credentials: ProviderCredentials): Promise<ConnectionTestResult> {
    const startTime = Date.now();
    const endpoint = credentials.customEndpoint;
    if (!endpoint) {
      throw new Error('Custom endpoint URL is required for custom provider.');
    }

    const validation = EncryptionService.validateCustomEndpoint(endpoint);
    if (!validation.isValid) {
      throw new Error(`Custom endpoint rejected by SSRF guard: ${validation.reason}`);
    }

    const trimmedUrl = endpoint.replace(/\/+$/, '');
    const targetUrl = trimmedUrl.endsWith('/chat/completions') ? trimmedUrl : `${trimmedUrl}/chat/completions`;

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${credentials.apiKey}`
      },
      body: JSON.stringify({
        model: credentials.model,
        messages: [{ role: 'user', content: 'Say READY' }],
        max_tokens: 5
      })
    });

    const latencyMs = Date.now() - startTime;
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Custom provider returned HTTP ${response.status}: ${SecretRedactor.redactString(errText)}`);
    }

    return {
      ok: true,
      latencyMs,
      message: 'Successfully connected to Custom OpenAI-compatible endpoint.',
      provider: 'custom',
      model: credentials.model
    };
  }

  async generateMentorTurn(request: MentorChatRequest, credentials: ProviderCredentials): Promise<MentorResponse> {
    const { systemPrompt } = buildMentorPrompts(request);
    const endpoint = credentials.customEndpoint;
    if (!endpoint) {
      throw new Error('Custom endpoint URL is required.');
    }

    const validation = EncryptionService.validateCustomEndpoint(endpoint);
    if (!validation.isValid) {
      throw new Error(`Custom endpoint rejected by SSRF guard: ${validation.reason}`);
    }

    const trimmedUrl = endpoint.replace(/\/+$/, '');
    const targetUrl = trimmedUrl.endsWith('/chat/completions') ? trimmedUrl : `${trimmedUrl}/chat/completions`;

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${credentials.apiKey}`
      },
      body: JSON.stringify({
        model: credentials.model,
        messages: [
          { role: 'system', content: systemPrompt },
          ...request.history.map(h => ({ role: h.role, content: h.text })),
          { role: 'user', content: request.userMessage }
        ],
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Custom provider error (${response.status}): ${SecretRedactor.redactString(err)}`);
    }

    const data: any = await response.json();
    const rawText = data.choices?.[0]?.message?.content;
    const parsed = parseCleanJson(rawText);
    return MentorResponseSchema.parse(parsed);
  }
}

/**
 * Adapter Registry Factory
 */
export class AIAdapterRegistry {
  private static adapters: Record<string, AIProviderAdapter> = {
    gemini: new GeminiAdapter(),
    openai: new OpenAIAdapter(),
    anthropic: new AnthropicAdapter(),
    custom: new CustomOpenAICompatibleAdapter()
  };

  static getAdapter(provider: string): AIProviderAdapter {
    const adapter = this.adapters[provider];
    if (!adapter) {
      throw new Error(`Unsupported AI provider: '${provider}'. Supported: gemini, openai, anthropic, custom.`);
    }
    return adapter;
  }
}
