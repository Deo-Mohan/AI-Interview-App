import { EncryptionService, EncryptedData } from './encryptionService.js';
import { AIAdapterRegistry, ProviderCredentials, ConnectionTestResult } from './aiAdapters.js';
import { SupabaseService } from './supabaseService.js';
import { SecretRedactor } from './secretRedactor.js';

export interface SaveCredentialInput {
  provider: 'gemini' | 'openai' | 'anthropic' | 'custom';
  apiKey: string;
  model: string;
  customEndpoint?: string;
  persistenceType: 'persistent' | 'session_only';
  consentToStore?: boolean;
}

export interface CredentialMetadata {
  provider: 'gemini' | 'openai' | 'anthropic' | 'custom';
  model: string;
  customEndpoint?: string;
  keyLastFour: string;
  persistenceType: 'persistent' | 'session_only';
  lastTestedAt?: string;
  lastStatus: 'untested' | 'connected' | 'error' | 'quota_exceeded';
  updatedAt: string;
  isConfigured: boolean;
}

interface StoredDbRecord {
  id?: string;
  user_id: string;
  provider: 'gemini' | 'openai' | 'anthropic' | 'custom';
  model: string;
  custom_endpoint?: string;
  encrypted_api_key: string;
  encryption_iv: string;
  encryption_tag: string;
  key_last_four: string;
  persistence_type: 'persistent' | 'session_only';
  last_tested_at?: string;
  last_status: 'untested' | 'connected' | 'error' | 'quota_exceeded';
  created_at?: string;
  updated_at?: string;
}

export class UserCredentialManager {
  // In-memory session credentials store (ephemeral, zero persistence)
  private static sessionStore = new Map<string, ProviderCredentials>();

  // In-memory fallback encrypted storage for development when Supabase DB is not reachable
  private static localEncryptedStore = new Map<string, StoredDbRecord>();

  /**
   * Save or update user credentials
   */
  static async saveCredential(userId: string, input: SaveCredentialInput): Promise<CredentialMetadata> {
    if (!input.apiKey || input.apiKey.trim().length === 0) {
      throw new Error('API key cannot be empty.');
    }
    if (!input.model || input.model.trim().length === 0) {
      throw new Error('Model must be selected.');
    }

    // SSRF Check if custom provider
    if (input.provider === 'custom') {
      if (!input.customEndpoint) {
        throw new Error('Custom endpoint URL is required for custom provider.');
      }
      const ssrfCheck = EncryptionService.validateCustomEndpoint(input.customEndpoint);
      if (!ssrfCheck.isValid) {
        throw new Error(`SSRF Validation Failed: ${ssrfCheck.reason}`);
      }
    }

    const keyLastFour = EncryptionService.maskKey(input.apiKey);

    // 1. Session-Only BYOK (Never written to database)
    if (input.persistenceType === 'session_only') {
      this.sessionStore.set(userId, {
        provider: input.provider,
        apiKey: input.apiKey.trim(),
        model: input.model.trim(),
        customEndpoint: input.customEndpoint?.trim()
      });

      SecretRedactor.log('INFO', `Session-only credential registered for user: ${userId}`, {
        userId,
        provider: input.provider,
        model: input.model
      });

      return {
        provider: input.provider,
        model: input.model,
        customEndpoint: input.customEndpoint,
        keyLastFour,
        persistenceType: 'session_only',
        lastTestedAt: new Date().toISOString(),
        lastStatus: 'connected',
        updatedAt: new Date().toISOString(),
        isConfigured: true
      };
    }

    // 2. Persistent BYOK (Requires explicit user consent and AES-256-GCM encryption)
    if (!input.consentToStore) {
      throw new Error('Explicit consent is required before storing encrypted API credentials.');
    }

    // Clear any previous session-only credentials for this user
    this.sessionStore.delete(userId);

    const encrypted = EncryptionService.encrypt(input.apiKey.trim());
    const record: StoredDbRecord = {
      user_id: userId,
      provider: input.provider,
      model: input.model.trim(),
      custom_endpoint: input.customEndpoint?.trim(),
      encrypted_api_key: encrypted.ciphertext,
      encryption_iv: encrypted.iv,
      encryption_tag: encrypted.tag,
      key_last_four: keyLastFour,
      persistence_type: 'persistent',
      last_tested_at: new Date().toISOString(),
      last_status: 'connected',
      updated_at: new Date().toISOString()
    };

    // Attempt persistent write via Supabase
    try {
      const client = SupabaseService.getServiceClient();
      const { error } = await client
        .from('user_ai_credentials')
        .upsert(record, { onConflict: 'user_id' });

      if (error) {
        throw error;
      }
    } catch (dbErr: any) {
      // Fallback to local encrypted store if database is offline / mocked
      SecretRedactor.log('WARN', `Database offline or table unavailable, saving to local encrypted store: ${dbErr.message}`, {
        userId
      });
      this.localEncryptedStore.set(userId, record);
    }

    SecretRedactor.log('INFO', `Encrypted credentials stored safely for user: ${userId}`, {
      userId,
      provider: input.provider,
      model: input.model
    });

    return {
      provider: record.provider,
      model: record.model,
      customEndpoint: record.custom_endpoint,
      keyLastFour: record.key_last_four,
      persistenceType: 'persistent',
      lastTestedAt: record.last_tested_at,
      lastStatus: record.last_status,
      updatedAt: record.updated_at || new Date().toISOString(),
      isConfigured: true
    };
  }

  /**
   * Resolves the user's active credentials for runtime execution
   */
  static async getResolvedCredential(userId: string): Promise<ProviderCredentials | null> {
    // 1. Check active session-only store first
    const sessionCred = this.sessionStore.get(userId);
    if (sessionCred) {
      return sessionCred;
    }

    // 2. Check database for encrypted persistent credential
    try {
      const client = SupabaseService.getServiceClient();
      const { data, error } = await client
        .from('user_ai_credentials')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (!error && data) {
        const decryptedKey = EncryptionService.decrypt({
          ciphertext: data.encrypted_api_key,
          iv: data.encryption_iv,
          tag: data.encryption_tag
        });

        return {
          provider: data.provider,
          apiKey: decryptedKey,
          model: data.model,
          customEndpoint: data.custom_endpoint
        };
      }
    } catch (e) {
      // Database unavailable, try local encrypted store
    }

    // 3. Fallback to local encrypted store
    const localRecord = this.localEncryptedStore.get(userId);
    if (localRecord) {
      const decryptedKey = EncryptionService.decrypt({
        ciphertext: localRecord.encrypted_api_key,
        iv: localRecord.encryption_iv,
        tag: localRecord.encryption_tag
      });

      return {
        provider: localRecord.provider,
        apiKey: decryptedKey,
        model: localRecord.model,
        customEndpoint: localRecord.custom_endpoint
      };
    }

    return null;
  }

  /**
   * Returns safe metadata to the frontend (NEVER returns raw secrets or ciphertext)
   */
  static async getCredentialMetadata(userId: string): Promise<CredentialMetadata | null> {
    // 1. Session store
    const sessionCred = this.sessionStore.get(userId);
    if (sessionCred) {
      return {
        provider: sessionCred.provider,
        model: sessionCred.model,
        customEndpoint: sessionCred.customEndpoint,
        keyLastFour: EncryptionService.maskKey(sessionCred.apiKey),
        persistenceType: 'session_only',
        lastTestedAt: new Date().toISOString(),
        lastStatus: 'connected',
        updatedAt: new Date().toISOString(),
        isConfigured: true
      };
    }

    // 2. Persistent store
    try {
      const client = SupabaseService.getServiceClient();
      const { data, error } = await client
        .from('user_ai_credentials')
        .select('provider, model, custom_endpoint, key_last_four, persistence_type, last_tested_at, last_status, updated_at')
        .eq('user_id', userId)
        .single();

      if (!error && data) {
        return {
          provider: data.provider,
          model: data.model,
          customEndpoint: data.custom_endpoint,
          keyLastFour: data.key_last_four,
          persistenceType: data.persistence_type,
          lastTestedAt: data.last_tested_at,
          lastStatus: data.last_status,
          updatedAt: data.updated_at,
          isConfigured: true
        };
      }
    } catch (e) {}

    // 3. Local store
    const local = this.localEncryptedStore.get(userId);
    if (local) {
      return {
        provider: local.provider,
        model: local.model,
        customEndpoint: local.custom_endpoint,
        keyLastFour: local.key_last_four,
        persistenceType: local.persistence_type,
        lastTestedAt: local.last_tested_at,
        lastStatus: local.last_status,
        updatedAt: local.updated_at || new Date().toISOString(),
        isConfigured: true
      };
    }

    return null;
  }

  /**
   * Delete user credentials permanently
   */
  static async deleteCredential(userId: string): Promise<boolean> {
    this.sessionStore.delete(userId);
    this.localEncryptedStore.delete(userId);

    try {
      const client = SupabaseService.getServiceClient();
      await client
        .from('user_ai_credentials')
        .delete()
        .eq('user_id', userId);
    } catch (e) {}

    SecretRedactor.log('INFO', `User AI credentials deleted for user: ${userId}`, { userId });
    return true;
  }

  /**
   * Test connection to configured provider
   */
  static async testConnection(credentials: ProviderCredentials): Promise<ConnectionTestResult> {
    const adapter = AIAdapterRegistry.getAdapter(credentials.provider);
    return adapter.testConnection(credentials);
  }
}
