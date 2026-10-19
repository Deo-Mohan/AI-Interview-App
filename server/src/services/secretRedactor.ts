/**
 * Secret and PII Redactor
 * Ensures API keys, tokens, credentials, and sensitive data
 * never appear in logs, error objects, or client responses.
 */

const SENSITIVE_PATTERNS = [
  // OpenAI API Keys (sk-...)
  { pattern: /sk-[a-zA-Z0-9_\-]{20,}/g, replacement: '[REDACTED_API_KEY]' },
  // Bearer Tokens
  { pattern: /Bearer\s+([a-zA-Z0-9_\-\.]{15,})/gi, replacement: 'Bearer [REDACTED_TOKEN]' },
  // Supabase JWT / Service role / Anon tokens
  { pattern: /eyJ[a-zA-Z0-9_\-]{10,}\.[a-zA-Z0-9_\-]{10,}\.[a-zA-Z0-9_\-]{10,}/g, replacement: '[REDACTED_JWT]' },
  // ElevenLabs API Keys
  { pattern: /xi-api-key\s*[:=]\s*[a-zA-Z0-9_\-]{20,}/gi, replacement: 'xi-api-key: [REDACTED_XI_KEY]' },
  // Anthropic API Keys (sk-ant-...)
  { pattern: /sk-ant-[a-zA-Z0-9_\-]{20,}/g, replacement: '[REDACTED_ANTHROPIC_KEY]' },
  // Generic password and secret fields in query strings or JSON strings
  { pattern: /("password"|"secret"|"apiKey"|"api_key"|"token")\s*:\s*"[^"]+"/gi, replacement: '$1: "[REDACTED]"' }
];

export class SecretRedactor {
  /**
   * Redacts sensitive patterns from a string
   */
  static redactString(text: string): string {
    if (!text || typeof text !== 'string') return text;
    let redacted = text;
    for (const { pattern, replacement } of SENSITIVE_PATTERNS) {
      redacted = redacted.replace(pattern, replacement);
    }
    return redacted;
  }

  /**
   * Recursively traverses and redacts an object or error
   */
  static redactObject<T = any>(obj: T): T {
    if (obj === null || obj === undefined) return obj;

    if (typeof obj === 'string') {
      return this.redactString(obj) as unknown as T;
    }

    if (obj instanceof Error) {
      const sanitizedError = new Error(this.redactString(obj.message));
      sanitizedError.name = obj.name;
      if (obj.stack) {
        sanitizedError.stack = this.redactString(obj.stack);
      }
      return sanitizedError as unknown as T;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.redactObject(item)) as unknown as T;
    }

    if (typeof obj === 'object') {
      const result: Record<string, any> = {};
      for (const [key, val] of Object.entries(obj)) {
        const lowerKey = key.toLowerCase();
        if (
          lowerKey.includes('password') ||
          lowerKey.includes('secret') ||
          lowerKey.includes('apikey') ||
          lowerKey.includes('api_key') ||
          lowerKey.includes('authorization') ||
          lowerKey.includes('service_role') ||
          lowerKey.includes('token')
        ) {
          result[key] = '[REDACTED]';
        } else {
          result[key] = this.redactObject(val);
        }
      }
      return result as T;
    }

    return obj;
  }

  /**
   * Structured JSON logger with automatic redaction
   */
  static log(level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG', message: string, meta: Record<string, any> = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message: this.redactString(message),
      ...this.redactObject(meta)
    };

    const serialized = JSON.stringify(logEntry);
    if (level === 'ERROR') {
      console.error(serialized);
    } else if (level === 'WARN') {
      console.warn(serialized);
    } else {
      console.log(serialized);
    }
  }
}
