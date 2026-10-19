import { 
  InterviewTurnRequest, 
  InterviewTurnResponse, 
  InterviewTurnResponseSchema,
  InterviewStage,
  QuestionCategory
} from '../types/interview.js';
import { ProviderCredentials } from './aiAdapters.js';
import { SecretRedactor } from './secretRedactor.js';
import { EncryptionService } from './encryptionService.js';

export class InterviewService {
  /**
   * Builds the rigorous, professional interviewer system prompt
   */
  private static buildInterviewerSystemPrompt(request: InterviewTurnRequest): string {
    const { 
      candidateRole, 
      seniorityLevel, 
      totalQuestions, 
      jobDescription, 
      resumeSummary, 
      currentStage, 
      questionIndex 
    } = request;

    return `You are Krish AI, a distinguished Principal Engineer and Technical Hiring Manager conducting a high-stakes, professional technical and behavioral interview for the role of "${candidateRole}" (${seniorityLevel} level).

CANDIDATE CONTEXT:
- Target Role: ${candidateRole}
- Target Seniority: ${seniorityLevel}
- Total Planned Questions: ${totalQuestions}
- Current Question Index: ${questionIndex + 1} of ${totalQuestions}
- Candidate Resume Summary: ${resumeSummary || 'Not provided. Probe broad industry experience for this role.'}
- Target Job Description: ${jobDescription || 'Standard high-caliber engineering expectations for this seniority.'}

CORE INTERVIEWING PRINCIPLES:
1. ASK EXACTLY ONE QUESTION AT A TIME:
   - Spoken questions MUST be concise, spoken naturally, and 1 to 2 sentences maximum.
   - Do NOT deliver lectures, multiple sub-questions, or preambles.
2. ADAPTIVE STATE MACHINE:
   - INTRODUCTION: Welcome candidate, state the role, set professional expectations, and ask the first project/experience question.
   - QUESTION: Ask a technical depth, architecture, project deep-dive, or STAR behavioral question calibrated to ${seniorityLevel} level.
   - EVALUATION: When candidate replies, independently evaluate TECHNICAL CORRECTNESS (0-100) and ENGLISH FLUENCY (0-100).
   - FOLLOW_UP_OR_NEXT_QUESTION:
     * If the candidate gave a vague, generic, incomplete, or textbook answer without real implementation details or numbers, probe deeper with a targeted follow-up question (isVagueOrIncomplete = true).
     * If the answer was specific, substantiated, and solid, acknowledge briefly and advance to the next question category.
   - FINAL_REPORT: If all questions are finished (questionIndex >= totalQuestions), generate a comprehensive, executive-ready hiring assessment.
3. SEPARATION OF EVALUATION CONCERNS:
   - Technical correctness is evaluated on architectural depth, trade-off analysis, edge-case awareness, and accuracy.
   - English fluency is evaluated on vocabulary precision, sentence structure, coherence, and professional executive delivery. A candidate can be technically brilliant with non-native grammar, or speak fluent English with weak technical depth. Always evaluate them separately!
4. NEVER SPOIL THE ANSWER:
   - Never reveal the expected solution, best practice, or architectural answer before the candidate responds.
5. CALIBRATED SENIORITY:
   - Expect Staff/Senior candidates to discuss operational trade-offs, scalability, failure modes, metrics, and team collaboration.

OUTPUT FORMAT:
You MUST respond with valid JSON strictly matching this schema:
{
  "nextStage": "QUESTION" | "LISTENING" | "EVALUATION" | "FOLLOW_UP_OR_NEXT_QUESTION" | "FINAL_REPORT",
  "questionIndex": number,
  "totalQuestions": number,
  "category": "technical" | "project_deep_dive" | "architecture" | "behavioral_star" | "hr_leadership",
  "spokenQuestion": "string (Crisp, concise, 1-2 spoken sentences to say aloud to the candidate)",
  "interviewerReasoning": "string (Why this question or follow-up was chosen based on candidate history)",
  "isInterviewComplete": boolean,
  "evaluation": {
    "technicalCorrectnessScore": number (0-100),
    "technicalCritique": "string",
    "englishFluencyScore": number (0-100),
    "englishCritique": "string",
    "starFrameworkScore": number (0-100 or null if not behavioral),
    "isVagueOrIncomplete": boolean,
    "grammarCorrections": [
      { "original": "string", "suggested": "string", "explanation": "string" }
    ],
    "naturalNativeAlternative": "string (How an experienced executive engineer would formulate this answer)"
  } (omit if stage is INTRODUCTION or candidate hasn't answered yet),
  "finalReport": {
    "overallTechnicalScore": number (0-100),
    "overallFluencyScore": number (0-100),
    "hiringRecommendation": "Strong Hire" | "Hire" | "Leaning Hire" | "Needs Practice",
    "calibratedSeniority": "string",
    "keyStrengths": ["string", "string", "string"],
    "growthAreas": ["string", "string"],
    "detailedQuestionAssessments": [
      {
        "category": "string",
        "question": "string",
        "candidateAnswerSummary": "string",
        "technicalEvaluation": "string",
        "fluencyEvaluation": "string",
        "recommendedNativeFraming": "string"
      }
    ]
  } (include ONLY if isInterviewComplete is true or stage is FINAL_REPORT)
}`;
  }

  /**
   * Executes a turn using the caller's BYOK provider
   */
  static async processInterviewTurn(
    request: InterviewTurnRequest, 
    credentials?: ProviderCredentials
  ): Promise<InterviewTurnResponse> {
    if (!credentials || !credentials.apiKey) {
      throw new Error('NO_AI_PROVIDER_CONFIGURED: Valid BYOK API credentials (Gemini, OpenAI, Anthropic, or Custom) are required.');
    }

    const systemPrompt = this.buildInterviewerSystemPrompt(request);
    const userPrompt = `CURRENT INTERVIEW STATE:
Stage: ${request.currentStage}
Question Index: ${request.questionIndex}
Previous Question Asked: ${request.previousQuestion || 'None (Interview Starting)'}
Candidate Latest Answer: "${request.userMessage || ''}"

Conversation Transcript So Far:
${request.history.map(h => `${h.role.toUpperCase()}: ${h.text}`).join('\n')}

Generate the next state machine turn, evaluation (if candidate responded), and next crisp question or final report in JSON.`;

    const rawJsonText = await this.callProviderLLM(systemPrompt, userPrompt, credentials);
    
    // Clean potential markdown fences
    let cleaned = rawJsonText.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```\s*/, '').replace(/```\s*$/, '').trim();
    }

    try {
      const parsed = JSON.parse(cleaned);
      return InterviewTurnResponseSchema.parse(parsed);
    } catch (parseErr: any) {
      SecretRedactor.log('WARN', 'Failed to parse LLM interview response as JSON, applying resilient fallback', {
        error: parseErr.message,
        snippet: cleaned.substring(0, 200)
      });

      // Construct a safe fallback response to prevent session disruption
      return {
        nextStage: 'QUESTION',
        questionIndex: request.questionIndex,
        totalQuestions: request.totalQuestions,
        category: 'technical',
        spokenQuestion: "Could you walk me through an architectural challenge you encountered in your recent project and how you solved it?",
        interviewerReasoning: "Fallback turn generated due to malformed LLM response formatting.",
        isInterviewComplete: false
      };
    }
  }

  /**
   * Provider-agnostic LLM caller that handles Gemini (including 3.8 Flash, 2.0 Flash, 1.5 Flash), OpenAI, Anthropic, and Custom
   */
  private static async callProviderLLM(
    systemPrompt: string, 
    userPrompt: string, 
    credentials: ProviderCredentials
  ): Promise<string> {
    const { provider, apiKey, model, customEndpoint } = credentials;

    if (provider === 'gemini') {
      const targetModel = model || 'gemini-1.5-flash';
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${encodeURIComponent(apiKey)}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.7
          }
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Google Gemini error (HTTP ${response.status}): ${SecretRedactor.redactString(errText)}`);
      }

      const data: any = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    }

    if (provider === 'openai') {
      const targetModel = model || 'gpt-4o-mini';
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: targetModel,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`OpenAI error (HTTP ${response.status}): ${SecretRedactor.redactString(errText)}`);
      }

      const data: any = await response.json();
      return data.choices?.[0]?.message?.content || '{}';
    }

    if (provider === 'anthropic') {
      const targetModel = model || 'claude-3-5-sonnet-20241022';
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: targetModel,
          max_tokens: 2048,
          system: systemPrompt,
          messages: [{ role: 'user', content: userPrompt }],
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Anthropic error (HTTP ${response.status}): ${SecretRedactor.redactString(errText)}`);
      }

      const data: any = await response.json();
      return data.content?.[0]?.text || '{}';
    }

    if (provider === 'custom') {
      if (!customEndpoint) throw new Error('Custom endpoint URL required');
      const validation = EncryptionService.validateCustomEndpoint(customEndpoint);
      if (!validation.isValid) throw new Error(`SSRF guard blocked endpoint: ${validation.reason}`);

      const trimmedUrl = customEndpoint.replace(/\/+$/, '');
      const targetUrl = trimmedUrl.endsWith('/chat/completions') ? trimmedUrl : `${trimmedUrl}/chat/completions`;

      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model || 'default',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Custom provider error (HTTP ${response.status}): ${SecretRedactor.redactString(errText)}`);
      }

      const data: any = await response.json();
      return data.choices?.[0]?.message?.content || '{}';
    }

    throw new Error(`Unsupported provider: ${provider}`);
  }
}
