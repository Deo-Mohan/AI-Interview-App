-- Migration: 20261019_001_initial_schema.sql
-- Description: Core tables with strict Row Level Security (RLS) for AI English Speaking & Communication Coach

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. USER PROFILES & PREFERENCES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    cefr_target_level TEXT DEFAULT 'B2',
    speech_rate_preference TEXT DEFAULT 'natural',
    mentor_tone_preference TEXT DEFAULT 'supportive',
    daily_word_limit INTEGER DEFAULT 5,
    user_timezone TEXT DEFAULT 'UTC',
    speaking_streak_days INTEGER DEFAULT 0,
    total_speaking_minutes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- 3. PRIVATE RESUMES & INTERVIEW CONFIGS
CREATE TABLE IF NOT EXISTS public.resumes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    extracted_text TEXT NOT NULL,
    key_skills TEXT[],
    target_role TEXT,
    job_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own resumes"
    ON public.resumes FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own resumes"
    ON public.resumes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own resumes"
    ON public.resumes FOR DELETE
    USING (auth.uid() = user_id);

-- 4. CONVERSATION SESSIONS
CREATE TABLE IF NOT EXISTS public.conversation_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    mode_id TEXT NOT NULL,
    mode_title TEXT NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER DEFAULT 0,
    cefr_estimate TEXT,
    fluency_score INTEGER,
    speaking_cadence_wpm INTEGER,
    exchange_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'completed'
);

ALTER TABLE public.conversation_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sessions"
    ON public.conversation_sessions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions"
    ON public.conversation_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 5. TRANSCRIPT MESSAGES
CREATE TABLE IF NOT EXISTS public.transcript_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES public.conversation_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    sender TEXT NOT NULL CHECK (sender IN ('user', 'ai')),
    text TEXT NOT NULL,
    timestamp_label TEXT NOT NULL,
    grammar_correction JSONB,
    natural_alternative TEXT,
    vocabulary_highlight TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.transcript_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own messages"
    ON public.transcript_messages FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own messages"
    ON public.transcript_messages FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 6. SAVED NOTES & LESSON SUMMARIES
CREATE TABLE IF NOT EXISTS public.saved_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES public.conversation_sessions(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    date_label TEXT NOT NULL,
    mode_title TEXT NOT NULL,
    cefr_level TEXT,
    cadence_wpm INTEGER,
    overview TEXT NOT NULL,
    grammar_feedback JSONB DEFAULT '[]'::jsonb,
    natural_alternatives JSONB DEFAULT '[]'::jsonb,
    highlighted_vocabulary TEXT[] DEFAULT '{}',
    exercises JSONB DEFAULT '[]'::jsonb,
    user_reflection TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.saved_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own saved notes"
    ON public.saved_notes FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert/update/delete their own notes"
    ON public.saved_notes FOR ALL
    USING (auth.uid() = user_id);

-- 7. RECURRING GRAMMAR ERROR PATTERNS
CREATE TABLE IF NOT EXISTS public.recurring_error_patterns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    rule_type TEXT NOT NULL,
    frequency_count INTEGER DEFAULT 1,
    tip TEXT NOT NULL,
    last_triggered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sample_mistakes JSONB DEFAULT '[]'::jsonb
);

ALTER TABLE public.recurring_error_patterns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own error patterns"
    ON public.recurring_error_patterns FOR SELECT
    USING (auth.uid() = user_id);

-- 8. SAVED VOCABULARY & SPACED REPETITION (SRS)
CREATE TABLE IF NOT EXISTS public.user_vocabulary (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    word TEXT NOT NULL,
    phonetic TEXT,
    part_of_speech TEXT NOT NULL,
    definition TEXT NOT NULL,
    audio_url TEXT,
    synonyms TEXT[],
    antonyms TEXT[],
    example_sentences TEXT[],
    is_favorite BOOLEAN DEFAULT FALSE,
    mastery_level TEXT DEFAULT 'learning' CHECK (mastery_level IN ('learning', 'reviewing', 'mastered')),
    times_reviewed INTEGER DEFAULT 0,
    next_review_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, word)
);

ALTER TABLE public.user_vocabulary ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own vocabulary"
    ON public.user_vocabulary FOR ALL
    USING (auth.uid() = user_id);

-- 9. DAILY ASSIGNED WORDS HISTORY
CREATE TABLE IF NOT EXISTS public.daily_assigned_words (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    assignment_date DATE NOT NULL,
    words TEXT[] NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, assignment_date)
);

ALTER TABLE public.daily_assigned_words ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own daily assignments"
    ON public.daily_assigned_words FOR SELECT
    USING (auth.uid() = user_id);
