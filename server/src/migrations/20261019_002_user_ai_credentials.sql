-- Migration: 20261019_002_user_ai_credentials.sql
-- Description: Store user-owned AI provider credentials (BYOK) with AES-256-GCM encryption and RLS

CREATE TABLE IF NOT EXISTS public.user_ai_credentials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    provider TEXT NOT NULL CHECK (provider IN ('gemini', 'openai', 'anthropic', 'custom')),
    model TEXT NOT NULL,
    custom_endpoint TEXT,
    encrypted_api_key TEXT NOT NULL,
    encryption_iv TEXT NOT NULL,
    encryption_tag TEXT NOT NULL,
    key_last_four TEXT NOT NULL,
    persistence_type TEXT NOT NULL DEFAULT 'persistent' CHECK (persistence_type IN ('persistent', 'session_only')),
    last_tested_at TIMESTAMP WITH TIME ZONE,
    last_status TEXT NOT NULL DEFAULT 'untested' CHECK (last_status IN ('untested', 'connected', 'error', 'quota_exceeded')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.user_ai_credentials ENABLE ROW LEVEL SECURITY;

-- Owner-only access policies
CREATE POLICY "Users can view their own AI credentials metadata"
    ON public.user_ai_credentials FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own AI credentials"
    ON public.user_ai_credentials FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI credentials"
    ON public.user_ai_credentials FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own AI credentials"
    ON public.user_ai_credentials FOR DELETE
    USING (auth.uid() = user_id);

-- Performance index
CREATE INDEX IF NOT EXISTS idx_user_ai_credentials_user ON public.user_ai_credentials(user_id);
