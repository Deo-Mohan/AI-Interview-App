import assert from 'assert';
import { EncryptionService } from './services/encryptionService.js';
import { UserCredentialManager } from './services/userCredentialManager.js';
import { AIAdapterRegistry } from './services/aiAdapters.js';

async function runBYOKTests() {
  console.log('=== RUNNING BYOK (USER-OWNED AI PROVIDERS & KEYS) TESTS ===');

  let passed = 0;
  let failed = 0;

  function test(name: string, fn: () => void | Promise<void>) {
    try {
      const result = fn();
      if (result && typeof result.then === 'function') {
        return result.then(() => {
          console.log(`[PASS] ${name}`);
          passed++;
        }).catch((err: any) => {
          console.error(`[FAIL] ${name}:`, err);
          failed++;
        });
      } else {
        console.log(`[PASS] ${name}`);
        passed++;
      }
    } catch (err: any) {
      console.error(`[FAIL] ${name}:`, err);
      failed++;
    }
  }

  // 1. AES-256-GCM Encryption / Decryption
  test('EncryptionService encrypts and decrypts secret keys accurately', () => {
    const rawKey = 'AIzaSyDemoGoogleGeminiSecretApiKey12345';
    const encrypted = EncryptionService.encrypt(rawKey);

    assert(encrypted.ciphertext !== rawKey, 'Ciphertext must not match raw key');
    assert(encrypted.iv && encrypted.iv.length === 32, 'IV must be 16 bytes (32 hex characters)');
    assert(encrypted.tag && encrypted.tag.length === 32, 'Auth tag must be 16 bytes');

    const decrypted = EncryptionService.decrypt(encrypted);
    assert.strictEqual(decrypted, rawKey, 'Decrypted key must match original plaintext');
  });

  // 2. Key Masking
  test('EncryptionService masks keys properly without leaking sensitive characters', () => {
    const masked = EncryptionService.maskKey('sk-proj-abc123xyz789');
    assert.strictEqual(masked, '...z789');

    const shortMasked = EncryptionService.maskKey('123');
    assert.strictEqual(shortMasked, '****');
  });

  // 3. SSRF Custom Endpoint Protection
  test('EncryptionService blocks loopback (127.0.0.1) in custom endpoint', () => {
    const check = EncryptionService.validateCustomEndpoint('http://127.0.0.1:8000/v1');
    assert.strictEqual(check.isValid, false);
    assert(check.reason?.includes('Loopback'));
  });

  test('EncryptionService blocks localhost in custom endpoint', () => {
    const check = EncryptionService.validateCustomEndpoint('http://localhost:11434/v1');
    assert.strictEqual(check.isValid, false);
    assert(check.reason?.includes('restricted'));
  });

  test('EncryptionService blocks AWS/GCP metadata service IP (169.254.169.254)', () => {
    const check = EncryptionService.validateCustomEndpoint('http://169.254.169.254/latest/meta-data');
    assert.strictEqual(check.isValid, false);
    assert(check.reason?.includes('restricted') || check.reason?.includes('Cloud metadata'));
  });

  test('EncryptionService blocks private RFC1918 addresses (10.0.0.1, 192.168.1.1)', () => {
    const check1 = EncryptionService.validateCustomEndpoint('http://10.0.0.1:5000/v1');
    assert.strictEqual(check1.isValid, false);

    const check2 = EncryptionService.validateCustomEndpoint('https://192.168.1.50/v1');
    assert.strictEqual(check2.isValid, false);
  });

  test('EncryptionService approves valid public HTTPS endpoint', () => {
    const check = EncryptionService.validateCustomEndpoint('https://api.groq.com/openai/v1');
    assert.strictEqual(check.isValid, true);
  });

  // 4. Session-Only vs Persistent Credential Storage
  await test('UserCredentialManager saves session-only credentials in-memory only', async () => {
    const userId = 'user_alice_session';
    const metadata = await UserCredentialManager.saveCredential(userId, {
      provider: 'gemini',
      apiKey: 'AIzaSyAliceSessionKey9988',
      model: 'gemini-1.5-flash',
      persistenceType: 'session_only'
    });

    assert.strictEqual(metadata.persistenceType, 'session_only');
    assert.strictEqual(metadata.keyLastFour, '...9988');
    assert.strictEqual(metadata.provider, 'gemini');

    const resolved = await UserCredentialManager.getResolvedCredential(userId);
    assert(resolved !== null);
    assert.strictEqual(resolved.apiKey, 'AIzaSyAliceSessionKey9988');
  });

  await test('UserCredentialManager saves persistent credentials with encryption and explicit consent', async () => {
    const userId = 'user_bob_persistent';
    const metadata = await UserCredentialManager.saveCredential(userId, {
      provider: 'openai',
      apiKey: 'sk-proj-BobPersistentApiKey5544',
      model: 'gpt-4o-mini',
      persistenceType: 'persistent',
      consentToStore: true
    });

    assert.strictEqual(metadata.persistenceType, 'persistent');
    assert.strictEqual(metadata.keyLastFour, '...5544');

    const resolved = await UserCredentialManager.getResolvedCredential(userId);
    assert(resolved !== null);
    assert.strictEqual(resolved.apiKey, 'sk-proj-BobPersistentApiKey5544');
  });

  test('UserCredentialManager requires explicit consent for persistent storage', async () => {
    let threw = false;
    try {
      await UserCredentialManager.saveCredential('user_consent_test', {
        provider: 'openai',
        apiKey: 'sk-proj-test',
        model: 'gpt-4o',
        persistenceType: 'persistent',
        consentToStore: false
      });
    } catch (e: any) {
      threw = true;
      assert(e.message.includes('Explicit consent is required'));
    }
    assert(threw, 'Should throw error when consentToStore is false');
  });

  // 5. Ownership Isolation
  await test('Ownership Isolation: User A cannot access User B credentials', async () => {
    const userA = 'user_isolation_A';
    const userB = 'user_isolation_B';

    await UserCredentialManager.saveCredential(userA, {
      provider: 'anthropic',
      apiKey: 'sk-ant-UserASecretKey1111',
      model: 'claude-3-5-sonnet-20241022',
      persistenceType: 'session_only'
    });

    const metaB = await UserCredentialManager.getCredentialMetadata(userB);
    assert.strictEqual(metaB, null, 'User B must not receive User A credentials');
  });

  // 6. Credential Deletion
  await test('UserCredentialManager permanently deletes user credentials', async () => {
    const userToDelete = 'user_to_delete';
    await UserCredentialManager.saveCredential(userToDelete, {
      provider: 'gemini',
      apiKey: 'AIzaSyDeleteMeKey1234',
      model: 'gemini-1.5-pro',
      persistenceType: 'session_only'
    });

    const deleted = await UserCredentialManager.deleteCredential(userToDelete);
    assert.strictEqual(deleted, true);

    const resolved = await UserCredentialManager.getResolvedCredential(userToDelete);
    assert.strictEqual(resolved, null, 'Deleted credential must resolve to null');
  });

  // 7. Adapter Registry
  test('AIAdapterRegistry resolves adapters for gemini, openai, anthropic, and custom', () => {
    const gemini = AIAdapterRegistry.getAdapter('gemini');
    assert(gemini !== undefined);

    const openai = AIAdapterRegistry.getAdapter('openai');
    assert(openai !== undefined);

    const anthropic = AIAdapterRegistry.getAdapter('anthropic');
    assert(anthropic !== undefined);

    const custom = AIAdapterRegistry.getAdapter('custom');
    assert(custom !== undefined);
  });

  console.log(`\nBYOK TEST SUMMARY: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

runBYOKTests();
