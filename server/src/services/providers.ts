import { GenerateReplyRequest, AIReplyResponse } from '../types/conversation.js';

export interface LLMProviderAdapter {
  generateReply(req: GenerateReplyRequest): Promise<AIReplyResponse>;
}

export interface TTSProviderAdapter {
  synthesizeSpeech(text: string, voiceId?: string): Promise<{ audioUrl?: string; format: string }>;
}

export interface STTProviderAdapter {
  transcribeAudio(audioBuffer: Buffer, mimeType: string): Promise<{ transcript: string }>;
}

/**
 * Built-in Robust Pedagogical Mock LLM Adapter
 * Provides natural conversational replies, real-time gentle grammar corrections,
 * and idiomatic native alternative phrasings when external LLM keys are absent.
 */
export class MockLLMAdapter implements LLMProviderAdapter {
  async generateReply(req: GenerateReplyRequest): Promise<AIReplyResponse> {
    const userText = req.userMessage.trim();
    const lower = userText.toLowerCase();

    // 1. Detect common ESL grammar patterns gently
    let grammarFeedback = undefined;
    let naturalAlternative = undefined;

    if (lower.includes("didn't knew") || lower.includes("did not knew")) {
      grammarFeedback = {
        original: "didn't knew",
        suggested: "didn't know",
        explanation: "In English, 'did/didn't' already carries the past tense. Always use the base infinitive 'know'."
      };
      naturalAlternative = "I wasn't aware of this approach at the time.";
    } else if (lower.includes("discuss about")) {
      grammarFeedback = {
        original: "discuss about",
        suggested: "discuss",
        explanation: "'Discuss' is a transitive verb that directly takes an object without the preposition 'about'."
      };
      naturalAlternative = "We discussed the system architecture in our sync.";
    } else if (lower.includes("i am agree")) {
      grammarFeedback = {
        original: "I am agree",
        suggested: "I agree",
        explanation: "'Agree' is already an active verb; say 'I agree' rather than 'I am agree'."
      };
      naturalAlternative = "I completely align with your perspective on this.";
    } else if (lower.includes("very good") && req.modeId === 'resume-interview') {
      naturalAlternative = "This yields substantial architectural and latency advantages.";
    }

    // 2. Contextual mentor replies based on mode
    let replyText = "";
    if (req.modeId === 'resume-interview') {
      if (req.history.length <= 1) {
        replyText = "Thank you for sharing that context. In your previous engineering role, could you describe a time when you had to balance technical debt against a strict product delivery deadline?";
      } else if (lower.includes("team") || lower.includes("project")) {
        replyText = "That sounds like a meaningful challenge. How did you align the cross-functional stakeholders when disagreements arose regarding technical tradeoffs?";
      } else {
        replyText = "Understood. When designing that system, what metrics did you monitor to ensure reliability and optimal performance under peak traffic?";
      }
    } else if (req.modeId === 'office-english') {
      replyText = "That's a very realistic workplace situation. If you were presenting this during an executive update, how would you frame the risk while proposing a proactive next step?";
    } else if (req.modeId === 'scenario-roleplay') {
      replyText = "I see your perspective! As your counterpart in this scenario, I appreciate you bringing this to the table. Let's see what compromise we can reach.";
    } else {
      replyText = "That's an interesting point you made. How did you first get interested in that topic, and what has your experience been recently?";
    }

    return {
      replyText,
      grammarFeedback,
      naturalAlternative,
      vocabularyHighlight: "Pragmatic",
      cefrEstimate: "B2+"
    };
  }
}

/**
 * OpenAI Provider Adapter (Used when OPENAI_API_KEY is configured)
 */
export class OpenAIAdapter implements LLMProviderAdapter {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateReply(req: GenerateReplyRequest): Promise<AIReplyResponse> {
    const systemPrompt = `You are Rachel, a supportive, intelligent, and patient AI English Speaking Mentor.
Your mission:
1. Converse naturally in spoken English at a natural conversational level.
2. Reply in 2-3 engaging, conversational sentences.
3. Silently analyze the user's speech. If there is a clear grammatical error, return JSON with "grammarFeedback".
4. Suggest a more native, idiomatic alternative in "naturalAlternative".
Always respond in valid JSON format:
{
  "replyText": "...",
  "grammarFeedback": { "original": "...", "suggested": "...", "explanation": "..." } or null,
  "naturalAlternative": "..." or null,
  "vocabularyHighlight": "..." or null,
  "cefrEstimate": "B1" | "B2" | "C1"
}`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          ...req.history.map(h => ({ role: h.role, content: h.text })),
          { role: "user", content: req.userMessage }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenAI API error (${response.status}): ${errText}`);
    }

    const data = (await response.json()) as any;
    const parsed = JSON.parse(data.choices[0].message.content);
    return {
      replyText: parsed.replyText,
      grammarFeedback: parsed.grammarFeedback || undefined,
      naturalAlternative: parsed.naturalAlternative || undefined,
      vocabularyHighlight: parsed.vocabularyHighlight || undefined,
      cefrEstimate: parsed.cefrEstimate || "B2"
    };
  }
}
