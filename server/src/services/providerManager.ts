import { SecretRedactor } from './secretRedactor.js';

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export type ProviderStatus = 
  | 'HEALTHY'
  | 'RATE_LIMITED'
  | 'QUOTA_EXHAUSTED'
  | 'INVALID_CREDENTIALS'
  | 'CIRCUIT_OPEN'
  | 'OFFLINE';

export interface ProviderMetrics {
  requestsTotal: number;
  requestsSuccessful: number;
  requestsFailed: number;
  consecutiveFailures: number;
  totalLatencyMs: number;
  avgLatencyMs: number;
  promptTokensTotal: number;
  completionTokensTotal: number;
  estimatedCostUsd: number;
  lastError?: string;
  lastErrorTimestamp?: string;
}

export interface ProviderConfig {
  id: string;
  name: string;
  type: 'openai' | 'anthropic' | 'mock-pedagogical' | 'elevenlabs';
  apiKey?: string;
  priority: number; // 1 = highest
  failureThreshold?: number; // Failures before tripping (default 3)
  recoveryTimeoutMs?: number; // Cooldown before HALF_OPEN (default 30000ms)
  costPer1kPromptTokens?: number;
  costPer1kCompletionTokens?: number;
}

export class CircuitBreaker {
  state: CircuitState = 'CLOSED';
  failureCount = 0;
  successCount = 0;
  lastFailureTime = 0;
  failureThreshold: number;
  recoveryTimeoutMs: number;

  constructor(failureThreshold = 3, recoveryTimeoutMs = 30000) {
    this.failureThreshold = failureThreshold;
    this.recoveryTimeoutMs = recoveryTimeoutMs;
  }

  canExecute(): boolean {
    const now = Date.now();
    if (this.state === 'OPEN') {
      if (now - this.lastFailureTime > this.recoveryTimeoutMs) {
        this.state = 'HALF_OPEN';
        this.successCount = 0;
        return true;
      }
      return false;
    }
    return true;
  }

  recordSuccess(): void {
    if (this.state === 'HALF_OPEN') {
      this.successCount += 1;
      if (this.successCount >= 2) {
        this.state = 'CLOSED';
        this.failureCount = 0;
      }
    } else {
      this.failureCount = 0;
    }
  }

  recordFailure(): void {
    this.lastFailureTime = Date.now();
    this.failureCount += 1;
    if (this.failureCount >= this.failureThreshold || this.state === 'HALF_OPEN') {
      this.state = 'OPEN';
    }
  }

  reset(): void {
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = 0;
  }
}

export interface ManagedProvider {
  config: ProviderConfig;
  circuitBreaker: CircuitBreaker;
  status: ProviderStatus;
  rateLimitResetTime?: number;
  metrics: ProviderMetrics;
}

export class ProviderManager {
  private providers: Map<string, ManagedProvider> = new Map();

  constructor() {
    // 1. Initialize Built-in Pedagogical Mock Mentor (Zero-cost, 100% resilient fallback)
    this.registerProvider({
      id: 'pedagogical-mock',
      name: 'Resilient Pedagogical Offline Mentor',
      type: 'mock-pedagogical',
      priority: 999, // Fallback priority
      failureThreshold: 5,
      recoveryTimeoutMs: 10000,
      costPer1kPromptTokens: 0,
      costPer1kCompletionTokens: 0
    });

    // 2. Register OpenAI if configured in server environment
    const openAiKey = process.env.OPENAI_API_KEY;
    if (openAiKey && openAiKey.startsWith('sk-') && openAiKey.length > 20) {
      this.registerProvider({
        id: 'openai-primary',
        name: 'OpenAI GPT-4o-mini Primary',
        type: 'openai',
        apiKey: openAiKey,
        priority: 1,
        failureThreshold: 3,
        recoveryTimeoutMs: 30000,
        costPer1kPromptTokens: 0.00015,
        costPer1kCompletionTokens: 0.0006
      });
    }
  }

  registerProvider(config: ProviderConfig): void {
    const managed: ManagedProvider = {
      config,
      circuitBreaker: new CircuitBreaker(config.failureThreshold, config.recoveryTimeoutMs),
      status: 'HEALTHY',
      metrics: {
        requestsTotal: 0,
        requestsSuccessful: 0,
        requestsFailed: 0,
        consecutiveFailures: 0,
        totalLatencyMs: 0,
        avgLatencyMs: 0,
        promptTokensTotal: 0,
        completionTokensTotal: 0,
        estimatedCostUsd: 0
      }
    };
    this.providers.set(config.id, managed);
  }

  getProviders(): ManagedProvider[] {
    return Array.from(this.providers.values()).sort((a, b) => a.config.priority - b.config.priority);
  }

  getHealthyProvider(capabilityType: 'openai' | 'mock-pedagogical'): ManagedProvider | null {
    const now = Date.now();
    const sorted = this.getProviders();

    for (const managed of sorted) {
      // Check if capability is compatible
      if (capabilityType === 'openai' && managed.config.type !== 'openai' && managed.config.type !== 'mock-pedagogical') {
        continue;
      }

      // Check if paused due to temporary rate limiting
      if (managed.status === 'RATE_LIMITED') {
        if (managed.rateLimitResetTime && now > managed.rateLimitResetTime) {
          managed.status = 'HEALTHY';
          managed.rateLimitResetTime = undefined;
        } else {
          continue; // Still rate limited
        }
      }

      // Skip dead providers
      if (managed.status === 'QUOTA_EXHAUSTED' || managed.status === 'INVALID_CREDENTIALS') {
        continue;
      }

      // Check circuit breaker
      if (!managed.circuitBreaker.canExecute()) {
        managed.status = 'CIRCUIT_OPEN';
        continue;
      }

      return managed;
    }

    return null;
  }

  /**
   * Execute an operation with circuit breaker, metrics tracking, backoff, and automatic failover
   */
  async executeWithFailover<T>(
    capabilityType: 'openai' | 'mock-pedagogical',
    operation: (provider: ManagedProvider) => Promise<{ result: T; promptTokens?: number; completionTokens?: number }>
  ): Promise<{ result: T; providerUsed: string; latencyMs: number }> {
    const candidates = this.getProviders().filter(p => {
      if (capabilityType === 'openai') {
        return p.config.type === 'openai' || p.config.type === 'mock-pedagogical';
      }
      return p.config.type === capabilityType;
    });

    let lastError: Error | null = null;

    for (const provider of candidates) {
      const now = Date.now();
      // Skip if rate limited
      if (provider.status === 'RATE_LIMITED' && provider.rateLimitResetTime && now < provider.rateLimitResetTime) {
        continue;
      }
      // Skip if quota exhausted or invalid credentials
      if (provider.status === 'QUOTA_EXHAUSTED' || provider.status === 'INVALID_CREDENTIALS') {
        continue;
      }
      // Skip if circuit breaker is open
      if (!provider.circuitBreaker.canExecute()) {
        continue;
      }

      const startTime = Date.now();
      provider.metrics.requestsTotal += 1;

      try {
        const { result, promptTokens = 0, completionTokens = 0 } = await operation(provider);
        const latency = Date.now() - startTime;

        // Record metrics
        provider.circuitBreaker.recordSuccess();
        provider.status = 'HEALTHY';
        provider.metrics.requestsSuccessful += 1;
        provider.metrics.consecutiveFailures = 0;
        provider.metrics.totalLatencyMs += latency;
        provider.metrics.avgLatencyMs = Math.round(provider.metrics.totalLatencyMs / provider.metrics.requestsSuccessful);
        provider.metrics.promptTokensTotal += promptTokens;
        provider.metrics.completionTokensTotal += completionTokens;

        if (provider.config.costPer1kPromptTokens && provider.config.costPer1kCompletionTokens) {
          const cost = (promptTokens / 1000) * provider.config.costPer1kPromptTokens +
                       (completionTokens / 1000) * provider.config.costPer1kCompletionTokens;
          provider.metrics.estimatedCostUsd += cost;
        }

        return {
          result,
          providerUsed: provider.config.id,
          latencyMs: latency
        };
      } catch (err: any) {
        const latency = Date.now() - startTime;
        provider.metrics.requestsFailed += 1;
        provider.metrics.consecutiveFailures += 1;
        provider.metrics.lastError = SecretRedactor.redactString(err.message || 'Unknown error');
        provider.metrics.lastErrorTimestamp = new Date().toISOString();

        this.classifyAndHandleError(provider, err);
        lastError = err;

        SecretRedactor.log('WARN', `Provider ${provider.config.id} execution failed, attempting failover`, {
          providerId: provider.config.id,
          status: provider.status,
          latencyMs: latency,
          error: SecretRedactor.redactString(err.message)
        });
      }
    }

    throw new Error(
      `All available AI providers are currently unavailable or exhausted. Last error: ${SecretRedactor.redactString(lastError?.message || 'No available provider')}`
    );
  }

  /**
   * Distinguish rate limits, billing quota exhaustion, invalid credentials, and transient failures
   */
  classifyAndHandleError(provider: ManagedProvider, error: any): void {
    const msg = (error.message || '').toLowerCase();
    const status = error.status || error.statusCode;

    // 1. Invalid credentials (401 or 403)
    if (status === 401 || status === 403 || msg.includes('invalid_api_key') || msg.includes('unauthorized')) {
      provider.status = 'INVALID_CREDENTIALS';
      provider.circuitBreaker.recordFailure();
      SecretRedactor.log('ERROR', `Provider ${provider.config.id} credentials rejected (401/403). Deactivating provider.`, {
        providerId: provider.config.id
      });
      return;
    }

    // 2. Quota exhaustion vs temporary rate limit
    if (msg.includes('insufficient_quota') || msg.includes('billing') || msg.includes('exceeded your current quota')) {
      provider.status = 'QUOTA_EXHAUSTED';
      // Never deceptively rotate keys to bypass quotas!
      SecretRedactor.log('ERROR', `Provider ${provider.config.id} billing quota exhausted. Marking as exhausted without deceptive rotation.`, {
        providerId: provider.config.id
      });
      return;
    }

    // 3. Temporary Rate Limit (429)
    if (status === 429 || msg.includes('rate limit') || msg.includes('too many requests')) {
      provider.status = 'RATE_LIMITED';
      // Extract Retry-After if provided
      const retryAfterSeconds = error.retryAfterSeconds || 60;
      provider.rateLimitResetTime = Date.now() + retryAfterSeconds * 1000;
      SecretRedactor.log('WARN', `Provider ${provider.config.id} rate-limited. Pausing for ${retryAfterSeconds}s`, {
        providerId: provider.config.id,
        retryAfterSeconds
      });
      return;
    }

    // 4. Server outages / network errors
    provider.circuitBreaker.recordFailure();
    if (provider.circuitBreaker.state === 'OPEN') {
      provider.status = 'CIRCUIT_OPEN';
    }
  }

  /**
   * Exponential backoff with full jitter calculation
   */
  static calculateBackoffWithJitter(attempt: number, baseDelayMs = 500, maxDelayMs = 10000): number {
    const exponential = Math.min(maxDelayMs, baseDelayMs * Math.pow(2, attempt));
    const jitter = Math.random() * exponential;
    return Math.floor(jitter);
  }

  /**
   * Comprehensive diagnostics for /api/health
   */
  getDiagnostics() {
    const list = this.getProviders();
    return {
      totalProviders: list.length,
      healthyProviders: list.filter(p => p.status === 'HEALTHY').length,
      providers: list.map(p => ({
        id: p.config.id,
        name: p.config.name,
        type: p.config.type,
        status: p.status,
        circuitState: p.circuitBreaker.state,
        metrics: p.metrics
      }))
    };
  }
}
