# PROJECT_CONTEXT.md — AI English Speaking & Communication Coach

## 1. Product Vision & Principles
- **Core Vision**: Build a production-grade, highly responsive web application that empowers users to dramatically improve their spoken English fluency, confidence, and career prospects through natural voice conversations with an intelligent, patient, and supportive 3D AI mentor.
- **AI Persona & Pedagogical Strategy**:
  - Acts as a friendly, patient, experienced English communication mentor.
  - Prioritizes conversational flow and learner confidence over punitive corrections.
  - Uses natural, everyday English vocabulary without condescension or unnecessary jargon.
  - Identifies and highlights significant grammar errors, awkward phrasing, and pronunciation hurdles gently.
  - Offers natural native alternatives and idiomatic phrasing in real time without interrupting the dialogue rhythm.
- **Visual Design Identity**:
  - Verified visual language inspired by `https://www.eventlooped.com/free-month`.
  - Crisp slate borders (`slate-200`), off-white canvas (`#FBFBFC`) with a subtle 32px x 32px engineering grid, pure white cards (`#FFFFFF`), tactile cobalt blue buttons (`blue-600` with `blue-900` tactile depth), and monospace accent details (`Space Mono`).

---

## 2. Nine-Phase Implementation Roadmap
1. **Phase 0 (Current)**: Reference analysis, design system audit, master specification, environment setup, and implementation plan.
2. **Phase 1**: Project scaffolding, monorepo/folder architecture, Tailwind design tokens, and core UI component primitives.
3. **Phase 2**: Navigation shell (collapsible sidebar, responsive header, mobile drawer) and main analytics dashboard.
4. **Phase 3**: 3D human-like avatar engine (Three.js/R3F procedural mentor) with idle breathing, attentive listening, and lip-sync animation, plus Web Audio API live waveform analyzer.
5. **Phase 4**: Voice conversation room with real-time bidirectional audio, dual transcript stream, and gentle AI grammar/expression coaching rail.
6. **Phase 5**: Five specialized practice modes:
   - Mode A: Resume-aware Technical & HR Mock Interview.
   - Mode B: Real-world Scenario Roleplay.
   - Mode C: Office & Workplace English.
   - Mode D: Free Flow Conversation.
   - Mode E: User-Selected Topic & Group Discussion.
7. **Phase 6**: Post-session workflow with "Generate Notes", CEFR fluency scoring, error revision list, and PDF/Markdown export.
8. **Phase 7**: Daily vocabulary lab, word limit configuration, and comprehensive dictionary (phonetics, audio playback, synonyms, antonyms, 3 context sentences, SRS flashcards).
9. **Phase 8**: Backend security hardening, Supabase Auth & PostgreSQL schema with RLS, resume storage, provider adapter circuit breakers, retry-after backoff, and production deployment readiness.

---

## 3. Technology Choices & Architecture Decisions
- **Frontend**:
  - React 18 / 19 with Vite and TypeScript for rapid HMR, strict type safety, and modern bundle optimizations.
  - Tailwind CSS configured with EventLooped design system tokens.
  - React Router DOM for clean declarative routing and sub-route nesting.
  - Three.js / `@react-three/fiber` and `@react-three/drei` for procedural, performant 3D avatar rendering.
  - Lucide React for crisp, uniform iconography.
- **Backend**:
  - Node.js with Express and TypeScript.
  - Zod for strict schema validation of all API inputs, client payloads, and AI structured outputs.
  - Multi-provider adapter design pattern: Provider interfaces decouple logic from specific vendors (OpenAI, Anthropic, Gemini, ElevenLabs, Whisper, Free Dictionary API).
- **Database & Auth**:
  - Supabase Auth (Email/Password, OAuth) with Supabase PostgreSQL.
  - Strict Row-Level Security (RLS) on all tables (`profiles`, `resumes`, `sessions`, `transcripts`, `saved_notes`, `vocabulary`, `error_history`).
  - Private Supabase Storage bucket for user resumes with secure pre-signed URLs.

---

## 4. Five Practice Modes Specification
1. **Resume-Aware Technical & HR Interview**:
   - Parses candidate resume (PDF/Text) and optional target Job Description.
   - Generates contextual technical questions, behavioural STAR-method inquiries, and real-time follow-ups.
2. **Real-World Scenario Roleplay**:
   - Interactive roleplays: salary negotiation, airport check-in, ordering at a restaurant, handling customer complaints, making small talk at a conference.
3. **Office English**:
   - Workplace communication: professional email composition, executive presentations, polite disagreement, meeting facilitation, and diplomatic feedback.
4. **Free Conversation**:
   - Unscripted, open-ended dialogues across casual topics (travel, tech, movies, psychology) to build spontaneous speaking fluency.
5. **User-Selected Topic & Group Discussion Simulator**:
   - User types or chooses any custom topic/debate motion.
   - AI acts as a discussion moderator or simulates multiple viewpoints to practice group debate etiquette and turn-taking.

---

## 5. Voice Transcript & AI Coaching Requirements
- Real-time speech-to-text (Web Speech API with server-side Whisper adapter fallback).
- Visible dual transcript stream separating user utterances and mentor replies.
- Non-intrusive coaching rail:
  - Grammatical correction badge (highlighting only genuine errors).
  - "More Natural Phrasing" suggestion (idiomatic, native-like alternatives).
  - Vocabulary upgrade suggestion (replacing basic words with expressive equivalents).
  - Phonetic pronunciation assistant.

---

## 6. Generate Notes & Vocabulary Requirements
- **Post-Session Notes**:
  - Triggered via prominent "Generate Notes" button.
  - Generates: Key topics covered, estimated CEFR level (A1 to C2), speaking speed (WPM), recurring grammar mistakes with correct versions, and recommended vocabulary words.
  - Full inline editor for user additions.
  - One-click export to formatted PDF and Markdown (`.md`).
- **Vocabulary Lab & Dictionary**:
  - Daily new-word limit (user configurable, default: 5 words/day).
  - Rich word details: Definition, IPA phonetics, audio pronunciation button, part of speech, synonyms, antonyms, and 3 distinct example sentences.
  - Spaced Repetition (SRS) review mechanism.

---

## 7. Security, Persistence & Engineering Rules
- **Zero Client Secrets**: Provider keys (OpenAI, Anthropic, ElevenLabs, Supabase Service Role) reside strictly in `.env` on the Node.js server.
- **Never Rotate Keys to Bypass Quotas**: Handle rate limits with HTTP 429 backoff (`Retry-After`) and graceful fallbacks.
- **Provider Adapters & Fallbacks**:
  - Speech-to-Text: Whisper API -> Web Speech API fallback.
  - Text-to-Speech: ElevenLabs / OpenAI Audio -> Web SpeechSynthesis fallback.
- **Input & Output Validation**: Every client request and AI JSON response validated using Zod schemas.

---

## 8. Current Status & Phase Log
- **Date**: 2026-10-19
- **Current Phase**: **Phase 5 (Completed & Verified)**
- **Completed Work**:
  - **3D Human-Like Mentor Avatar Engine (`Avatar3DCanvas.tsx`)**:
    - Built a procedural, fully licensed 3D humanoid mentor avatar ("Rachel") using Three.js with clean geometry (head, neck, shoulder bust, hair, glasses, eyelids, and responsive mouth).
    - Modeled kinematics across all conversation lifecycle states:
      - `idle`: Gentle organic rhythmic breathing and subtle head micro-sways.
      - `listening`: Attentive posture with slight head tilt, alert eye contact, and focused pupil alignment.
      - `processing`: Deliberative thinking state with subtle upward gaze and gradual head sway.
      - `speaking`: Speech-driven mouth shape modulation (approximated audio visemes), head emphasis gestures, and shoulder breathing.
      - `blinking`: Natural periodic blink cycles triggered every 3.8 seconds with smooth sinusoidal eyelid closure.
  - **Performance, Disposal & Accessibility**:
    - Strict GPU resource management: `renderer.dispose()`, `scene.clear()`, and event listener deregistration on unmount preventing WebGL memory leaks.
    - Automatic detection and support for `prefers-reduced-motion: reduce`.
    - User-accessible toggle for lightweight 2D avatar mode (instant switchable fallback for low-power mobile hardware or battery preservation).
    - Unobtrusive layout: Placed alongside live transcript and real-time coaching rail without obstructing speech controls.
  - **Verification**:
    - Browser subagent verification completed (`phase5_verify_1792417088487.webp`).
    - Production build compiles cleanly with zero TypeScript errors (`npm run build`).
- **Next Step**: Await user approval to proceed to **Phase 6: Voice Provider Adapters (Whisper & ElevenLabs) & Cloud Speech Integration**.
