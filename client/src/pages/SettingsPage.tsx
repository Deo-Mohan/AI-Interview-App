import React, { useState, useEffect } from 'react';
import { 
  Key, 
  ShieldCheck, 
  Mic, 
  Volume2, 
  Server, 
  CheckCircle2, 
  AlertCircle,
  RefreshCw,
  Eye,
  EyeOff,
  Trash2,
  ExternalLink,
  Check,
  Zap,
  Globe
} from 'lucide-react';
import { Button, Card, Badge } from '../components/ui';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { PageTransition } from '../components/motion/MotionTransitions';

interface CredentialStatus {
  isConfigured: boolean;
  metadata?: {
    provider: 'gemini' | 'openai' | 'anthropic' | 'custom';
    model: string;
    customEndpoint?: string;
    keyLastFour: string;
    persistenceType: 'persistent' | 'session_only';
    lastTestedAt?: string;
    lastStatus: string;
  };
}

export const SettingsPage: React.FC = () => {
  const [llmProvider, setLlmProvider] = useState<'gemini' | 'openai' | 'anthropic' | 'custom'>('gemini');
  const [selectedModel, setSelectedModel] = useState<string>('gemini-1.5-flash');
  const [apiKey, setApiKey] = useState<string>('');
  const [showApiKey, setShowApiKey] = useState<boolean>(false);
  const [customEndpoint, setCustomEndpoint] = useState<string>('');
  const [persistenceType, setPersistenceType] = useState<'persistent' | 'session_only'>('persistent');
  const [consentToStore, setConsentToStore] = useState<boolean>(true);

  // Status & Loading states
  const [activeCredential, setActiveCredential] = useState<CredentialStatus | null>(null);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string; latencyMs?: number } | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch current credential metadata on mount
  const fetchStatus = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/credentials/status');
      if (res.ok) {
        const data = await res.json();
        setActiveCredential(data);
        if (data.metadata) {
          setLlmProvider(data.metadata.provider);
          setSelectedModel(data.metadata.model);
          if (data.metadata.customEndpoint) setCustomEndpoint(data.metadata.customEndpoint);
          setPersistenceType(data.metadata.persistenceType);
        }
      }
    } catch (e) {
      console.warn('Could not fetch credentials status:', e);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  // Update default models when provider changes
  const handleProviderChange = (provider: 'gemini' | 'openai' | 'anthropic' | 'custom') => {
    setLlmProvider(provider);
    setTestResult(null);
    setErrorMessage(null);
    if (provider === 'gemini') setSelectedModel('gemini-1.5-flash');
    else if (provider === 'openai') setSelectedModel('gpt-4o-mini');
    else if (provider === 'anthropic') setSelectedModel('claude-3-5-sonnet-20241022');
    else if (provider === 'custom') setSelectedModel('llama-3.3-70b-versatile');
  };

  // Test Connection
  const handleTestConnection = async () => {
    if (!apiKey.trim()) {
      setErrorMessage('Please enter an API key to test the connection.');
      return;
    }
    setIsTesting(true);
    setTestResult(null);
    setErrorMessage(null);

    try {
      const res = await fetch('http://localhost:5000/api/credentials/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: llmProvider,
          apiKey: apiKey.trim(),
          model: selectedModel,
          customEndpoint: llmProvider === 'custom' ? customEndpoint.trim() : undefined
        })
      });

      const data = await res.json();
      if (res.ok && data.ok) {
        setTestResult({ ok: true, message: data.message, latencyMs: data.latencyMs });
      } else {
        setTestResult({ ok: false, message: data.message || data.error || 'Connection failed' });
      }
    } catch (err: any) {
      setTestResult({ ok: false, message: 'Network error connecting to backend: ' + err.message });
    } finally {
      setIsTesting(false);
    }
  };

  // Save Credentials
  const handleSaveCredential = async () => {
    if (!apiKey.trim()) {
      setErrorMessage('API key is required.');
      return;
    }
    if (persistenceType === 'persistent' && !consentToStore) {
      setErrorMessage('Please check the consent box to store your encrypted key, or select Session Only.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      const res = await fetch('http://localhost:5000/api/credentials/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: llmProvider,
          apiKey: apiKey.trim(),
          model: selectedModel,
          customEndpoint: llmProvider === 'custom' ? customEndpoint.trim() : undefined,
          persistenceType,
          consentToStore
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSaveSuccess(true);
        setApiKey(''); // Clear raw key from form state immediately after saving!
        fetchStatus();
        setTimeout(() => setSaveSuccess(false), 3500);
      } else {
        setErrorMessage(data.message || data.error || 'Failed to save credentials.');
      }
    } catch (err: any) {
      setErrorMessage('Failed to connect to backend: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Credentials
  const handleDeleteCredential = async () => {
    if (!confirm('Are you sure you want to permanently delete your stored AI provider credentials?')) {
      return;
    }
    try {
      const res = await fetch('http://localhost:5000/api/credentials', { method: 'DELETE' });
      if (res.ok) {
        setActiveCredential({ isConfigured: false });
        setTestResult(null);
        setApiKey('');
      }
    } catch (e) {
      console.error('Failed to delete credentials:', e);
    }
  };

  return (
    <PageTransition className="max-w-4xl mx-auto space-y-6 pb-12">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          AI Provider & Key Management (BYOK)
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          Configure your personal AI credentials. This application does not ship with developer keys—your credentials are encrypted server-side and never exposed to the browser.
        </p>
      </div>

      {/* Active Configuration Status Banner */}
      <ErrorBoundary name="Provider Status Banner" compact>
        <Card variant="default" className="border-slate-200 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`size-10 rounded-xl flex items-center justify-center ${
                activeCredential?.isConfigured ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
              }`}>
                <Key className="size-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900">Active Provider Status</span>
                  {activeCredential?.isConfigured ? (
                    <Badge variant="emerald" size="sm" dot>Connected</Badge>
                  ) : (
                    <Badge variant="amber" size="sm" dot>Not Configured</Badge>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {activeCredential?.isConfigured && activeCredential.metadata ? (
                    <span>
                      Provider: <strong className="text-slate-800 uppercase">{activeCredential.metadata.provider}</strong> | 
                      Model: <strong className="text-slate-800">{activeCredential.metadata.model}</strong> | 
                      Key: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">{activeCredential.metadata.keyLastFour}</code> ({activeCredential.metadata.persistenceType})
                    </span>
                  ) : (
                    'Please configure an AI model below to practice voice sessions with Rachel.'
                  )}
                </p>
              </div>
            </div>
            {activeCredential?.isConfigured && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDeleteCredential}
                className="text-rose-600 hover:bg-rose-50 border-rose-200 self-start sm:self-auto"
              >
                <Trash2 className="size-3.5 mr-1" /> Remove Key
              </Button>
            )}
          </div>
        </Card>
      </ErrorBoundary>

      {/* Provider Selector Cards & Setup (Protected by ErrorBoundary) */}
      <ErrorBoundary name="AI Provider & Key Configuration">
        <Card variant="default" className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Server className="size-5 text-slate-700" />
            <h3 className="text-base font-bold text-slate-900">Select AI Intelligence Provider</h3>
          </div>
          <Badge variant="blue" size="sm">Choose Provider</Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { 
              id: 'gemini', 
              name: 'Google Gemini', 
              badge: 'Free Tier Available', 
              desc: 'High speed, multimodal fluency, low conversational latency.',
              link: 'https://aistudio.google.com/app/apikey'
            },
            { 
              id: 'openai', 
              name: 'OpenAI', 
              badge: 'GPT-4o & Mini', 
              desc: 'Industry standard for precise reasoning and dialogue.',
              link: 'https://platform.openai.com/api-keys'
            },
            { 
              id: 'anthropic', 
              name: 'Anthropic Claude', 
              badge: 'Claude 3.5 Sonnet', 
              desc: 'Superior pedagogical tone, grammar nuance, and empathy.',
              link: 'https://console.anthropic.com/'
            },
            { 
              id: 'custom', 
              name: 'OpenAI-Compatible', 
              badge: 'Groq / DeepSeek', 
              desc: 'Custom base URL with verified SSRF safeguards.',
              link: 'https://groq.com/'
            },
          ].map(p => (
            <div
              key={p.id}
              onClick={() => handleProviderChange(p.id as any)}
              className={`p-4 rounded-xl border cursor-pointer card-hover-lift transition-all flex flex-col justify-between ${
                llmProvider === p.id
                  ? 'bg-blue-50/50 border-blue-600 ring-2 ring-blue-600/20 shadow-subtle'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold text-slate-900">{p.name}</span>
                </div>
                <Badge variant={llmProvider === p.id ? 'blue' : 'slate'} size="sm" className="mb-2">
                  {p.badge}
                </Badge>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">{p.desc}</p>
              </div>
              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                <span className={`text-[11px] font-bold ${llmProvider === p.id ? 'text-blue-600' : 'text-slate-400'}`}>
                  {llmProvider === p.id ? '✓ Selected' : 'Select'}
                </span>
                <a
                  href={p.link}
                  target="_blank"
                  rel="noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="text-[11px] text-slate-400 hover:text-blue-600 flex items-center gap-0.5"
                >
                  Get Key <ExternalLink className="size-2.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Model & Credentials Input Card */}
      <Card variant="default" className="space-y-4">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="size-5 text-slate-700" />
            <h3 className="text-base font-bold text-slate-900">
              Configure {llmProvider === 'gemini' ? 'Google Gemini' : llmProvider === 'openai' ? 'OpenAI' : llmProvider === 'anthropic' ? 'Anthropic' : 'Custom Provider'} Credentials
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">AES-256-GCM Encrypted</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Model Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Supported Model
            </label>
            {llmProvider === 'gemini' && (
              <select
                value={selectedModel}
                onChange={e => setSelectedModel(e.target.value)}
                className="w-full text-sm rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
              >
                <option value="gemini-1.5-flash">gemini-1.5-flash (Recommended - Fast & Free Tier)</option>
                <option value="gemini-1.5-pro">gemini-1.5-pro (High Nuance)</option>
                <option value="gemini-2.0-flash">gemini-2.0-flash (Next Gen)</option>
              </select>
            )}
            {llmProvider === 'openai' && (
              <select
                value={selectedModel}
                onChange={e => setSelectedModel(e.target.value)}
                className="w-full text-sm rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
              >
                <option value="gpt-4o-mini">gpt-4o-mini (Recommended - Low Latency & Cost)</option>
                <option value="gpt-4o">gpt-4o (State of the Art)</option>
                <option value="gpt-3.5-turbo">gpt-3.5-turbo (Legacy)</option>
              </select>
            )}
            {llmProvider === 'anthropic' && (
              <select
                value={selectedModel}
                onChange={e => setSelectedModel(e.target.value)}
                className="w-full text-sm rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
              >
                <option value="claude-3-5-sonnet-20241022">claude-3-5-sonnet (Highest Quality ESL Coach)</option>
                <option value="claude-3-5-haiku-20241022">claude-3-5-haiku (Fast & Efficient)</option>
              </select>
            )}
            {llmProvider === 'custom' && (
              <input
                type="text"
                value={selectedModel}
                onChange={e => setSelectedModel(e.target.value)}
                placeholder="e.g. llama-3.3-70b-versatile, deepseek-chat"
                className="w-full text-sm rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            )}
          </div>

          {/* Custom Endpoint Input (if custom) */}
          {llmProvider === 'custom' && (
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Custom Endpoint Base URL (SSRF Protected)
              </label>
              <input
                type="url"
                value={customEndpoint}
                onChange={e => setCustomEndpoint(e.target.value)}
                placeholder="https://api.groq.com/openai/v1"
                className="w-full text-sm rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
              <span className="text-[11px] text-slate-500 block">
                SSRF Guard enforces public HTTPS endpoints. Private addresses (127.0.0.1, 10.x.x.x, 169.254.x.x) are blocked.
              </span>
            </div>
          )}

          {/* API Key Input with Visibility Toggle */}
          <div className="space-y-1.5 sm:col-span-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                API Secret Key
              </label>
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium"
              >
                {showApiKey ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                {showApiKey ? 'Hide Key' : 'Reveal Key'}
              </button>
            </div>
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder={
                  llmProvider === 'gemini' 
                    ? 'AIzaSy...' 
                    : llmProvider === 'openai' 
                      ? 'sk-proj-...' 
                      : llmProvider === 'anthropic' 
                        ? 'sk-ant-...' 
                        : 'Custom API Key'
                }
                className="w-full text-sm rounded-lg border border-slate-300 bg-white px-3 py-2.5 font-mono text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 pr-10"
              />
            </div>
          </div>
        </div>

        {/* Persistence Choice & Consent */}
        <div className="pt-2 border-t border-slate-100 space-y-3">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            Storage & Security Mode
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div
              onClick={() => setPersistenceType('persistent')}
              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                persistenceType === 'persistent'
                  ? 'bg-blue-50/40 border-blue-600 ring-1 ring-blue-600'
                  : 'bg-white border-slate-200'
              }`}
            >
              <span className="text-xs font-bold text-slate-900 block">Persistent BYOK (Server Encrypted)</span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Encrypted with AES-256-GCM. Stored in your private account so you don't need to re-enter it each visit.
              </p>
            </div>

            <div
              onClick={() => setPersistenceType('session_only')}
              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                persistenceType === 'session_only'
                  ? 'bg-blue-50/40 border-blue-600 ring-1 ring-blue-600'
                  : 'bg-white border-slate-200'
              }`}
            >
              <span className="text-xs font-bold text-slate-900 block">Session Only (Ephemeral)</span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Held temporarily in server memory only during your active tab session. Discarded when session ends.
              </p>
            </div>
          </div>

          {persistenceType === 'persistent' && (
            <label className="flex items-start gap-2.5 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={consentToStore}
                onChange={e => setConsentToStore(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-xs text-slate-600 leading-snug">
                I explicitly consent to encrypting and storing my API key server-side using AES-256-GCM for my user account.
              </span>
            </label>
          )}
        </div>

        {/* Feedback Messages */}
        {testResult && (
          <div className={`p-3 rounded-lg flex items-start gap-2 text-xs font-medium ${
            testResult.ok ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}>
            {testResult.ok ? <CheckCircle2 className="size-4 shrink-0 text-emerald-600 mt-0.5" /> : <AlertCircle className="size-4 shrink-0 text-rose-600 mt-0.5" />}
            <div>
              <span>{testResult.message}</span>
              {testResult.latencyMs && (
                <span className="block text-[11px] text-emerald-700 font-mono mt-0.5">
                  Round-trip latency: {testResult.latencyMs}ms
                </span>
              )}
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="p-3 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 flex items-start gap-2 text-xs font-medium">
            <AlertCircle className="size-4 shrink-0 text-rose-600 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {saveSuccess && (
          <div className="p-3 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-start gap-2 text-xs font-medium">
            <CheckCircle2 className="size-4 shrink-0 text-emerald-600 mt-0.5" />
            <span>Credentials saved and verified! You can now use all conversation modes with your AI key.</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button
            variant="ghost"
            size="md"
            disabled={isTesting || !apiKey.trim()}
            onClick={handleTestConnection}
          >
            {isTesting ? <RefreshCw className="size-4 animate-spin mr-1.5" /> : <Zap className="size-4 mr-1.5 text-amber-500" />}
            Test Connection
          </Button>

          <Button
            variant="tactile"
            size="md"
            disabled={isSaving || !apiKey.trim()}
            onClick={handleSaveCredential}
          >
            {isSaving ? <RefreshCw className="size-4 animate-spin mr-1.5" /> : <Check className="size-4 mr-1.5" />}
            Save & Connect Provider
          </Button>
        </div>
      </Card>
      </ErrorBoundary>
    </PageTransition>
  );
};
