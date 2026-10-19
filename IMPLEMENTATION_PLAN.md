# IMPLEMENTATION_PLAN.md — 9-Phase Master Plan

## 1. Overview & Phased Roadmap

This document outlines the detailed technical roadmap, milestones, acceptance criteria, dependencies, testing protocols, and risk mitigation strategies for the **AI English Speaking & Communication Coach**.

---

## 2. Phase Breakdown

### Phase 0: Reference Analysis, Design System & Master Specifications (Current)
- **Goal**: Analyze the reference site (`https://www.eventlooped.com/free-month`), extract verified design tokens, establish folder hierarchy, and create project blueprints.
- **Deliverables**: `PROJECT_CONTEXT.md`, `DESIGN_SYSTEM.md`, `IMPLEMENTATION_PLAN.md`, `.env.example`, `README.md`.
- **Acceptance Criteria**: Verified design tokens documented without guesswork; full 9-phase roadmap established; zero unapproved code execution.

### Phase 1: Project Scaffolding & Design Foundation
- **Goal**: Initialize React + Vite + TypeScript frontend, Express + TypeScript backend, configure Tailwind CSS with verified tokens, and create core UI primitives.
- **Dependencies**: Node.js, npm, Vite, Tailwind CSS, Lucide React.
- **Deliverables**:
  - `client/` folder with Vite + React + TS setup.
  - `server/` folder with Express + TS + Zod setup.
  - `tailwind.config.js` with EventLooped color tokens, 32px grid utility, and typography.
  - Reusable components: Button (tactile & ghost), Badge, Card, Container, Input, SegmentedTabs.
- **Acceptance Criteria**: Both frontend and backend compile and run cleanly with `npm run dev`. Design system components render accurately.

### Phase 2: Navigation Shell & Analytics Dashboard
- **Goal**: Build the responsive collapsible sidebar, sticky topbar, mobile drawer, and main analytics dashboard.
- **Dependencies**: React Router DOM, Phase 1 UI components.
- **Deliverables**:
  - `Sidebar` (16rem expanded, 3.5rem collapsed, icon mode, tooltips, responsive drawer on `<768px`).
  - `Header` with audio device selector, notification pill, and user profile snippet.
  - `Dashboard`: Speaking streak counter, weekly speaking time chart, recurring error summary, practice mode launch tiles, daily vocabulary target widget.
- **Acceptance Criteria**: Responsive navigation works seamlessly across desktop (1280px), tablet (768px), and mobile (375px).

### Phase 3: 3D Human-Like Avatar & Audio Engine
- **Goal**: Develop a Three.js / React Three Fiber 3D mentor avatar with idle breathing, attentive listening mode, and speaking visemes/animations, paired with a real-time Web Audio API frequency visualizer.
- **Dependencies**: `three`, `@react-three/fiber`, `@react-three/drei`.
- **Deliverables**:
  - `AvatarCanvas` component rendering a procedural stylized 3D mentor head/bust.
  - Animation states: `idle` (gentle breathing & blinking), `listening` (head tilt, attentive eyes), `speaking` (lip-sync movement matching audio output).
  - `AudioWaveform` visualizer reflecting mic input in real time.
  - Low-power device fallback (SVG animated waveform / stylized 2D avatar).
- **Acceptance Criteria**: Avatar renders at >= 60fps on standard desktop hardware; smooth transitions between states; zero WebGL memory leaks on unmount.

### Phase 4: Voice Conversation Room & AI Coaching Rail
- **Goal**: Create the live interactive voice conversation room with dual transcript stream and real-time AI coaching suggestions.
- **Dependencies**: Web Speech API, MediaRecorder, server AI adapter.
- **Deliverables**:
  - `ConversationRoom` layout: Left/Center 3D Avatar & Live Waveform, Right Dual Transcript & AI Coaching Rail.
  - Real-time transcript bubbles for user and AI.
  - AI Coaching Rail displaying: Grammar Corrections, "More Natural Alternative", and Vocabulary Boosters.
  - Browser Web Speech STT/TTS adapter with server Whisper/ElevenLabs fallback architecture.
- **Acceptance Criteria**: Spoken input is transcribed accurately, mentor replies with speech and text, and constructive feedback is highlighted without interrupting conversation flow.

### Phase 5: Five Specialized Practice Modes
- **Goal**: Implement the 5 specialized practice modes with tailored AI prompting and domain contexts.
- **Modes**:
  1. **Resume-Aware Tech & HR Mock Interview**: Resume uploader (PDF/Text) + Job Description context parser + real-time STAR feedback.
  2. **Real-World Scenario Roleplay**: Interactive situations (Negotiating, Ordering, Airport, Customer Service).
  3. **Office English**: Professional meetings, diplomatic disagreements, executive presentation phrasing.
  4. **Free Conversation**: Open fluency dialogues across varied casual topics.
  5. **Topic & Group Discussion Simulator**: User-defined topics with multi-perspective debate simulation.
- **Acceptance Criteria**: Each mode loads specific system prompts, scenario goals, and specialized feedback cards.

### Phase 6: Post-Session Notes & Export System
- **Goal**: Build the end-of-session review and report generator with export capabilities.
- **Dependencies**: jsPDF / html2canvas, markdown export helpers.
- **Deliverables**:
  - "Generate Notes" post-session pipeline.
  - Structured summary: Conversation overview, CEFR score estimate, identified mistakes & corrections, new words used.
  - In-browser markdown editor for notes customization.
  - One-click PDF download and Markdown file export.
- **Acceptance Criteria**: Notes generate within 3 seconds, export produces high-fidelity formatted PDF and clean Markdown.

### Phase 7: Daily Vocabulary Lab & Interactive Dictionary
- **Goal**: Implement the vocabulary learning module and dictionary search.
- **Dependencies**: Free Dictionary API adapter, local SRS state engine.
- **Deliverables**:
  - Daily new-word limit setting (1 to 20 words/day).
  - Dictionary search bar: IPA phonetics, audio pronunciation button, definitions, synonyms, antonyms, and 3 distinct example sentences.
  - SRS Flashcard review widget (Spaced Repetition with "Again", "Hard", "Good", "Easy").
- **Acceptance Criteria**: Dictionary handles missing audio/synonyms gracefully; SRS intervals persist reliably.

### Phase 8: Backend Security Hardening, Supabase Auth & Deployment
- **Goal**: Connect Supabase PostgreSQL with RLS, private resume storage, secure server proxies for all AI providers, rate limiting, and production build checks.
- **Dependencies**: `@supabase/supabase-js`, `dotenv`, `express-rate-limit`, `helmet`, `cors`.
- **Deliverables**:
  - Supabase schema migrations: `profiles`, `resumes`, `sessions`, `transcripts`, `notes`, `vocab`.
  - Row-Level Security policies ensuring private user data isolation.
  - Express server routes: `/api/ai/chat`, `/api/ai/transcribe`, `/api/ai/synthesize`, `/api/dictionary`.
  - Rate limiting, exponential backoff, and circuit breaker fallbacks.
  - Production build pipeline (`npm run build`).
- **Acceptance Criteria**: Zero secrets in frontend bundle; passing security audit; test coverage for key adapters; end-to-end verified user flow.

---

## 3. Risk Assessment & Mitigation Strategies

| Risk | Impact | Mitigation Strategy |
|---|---|---|
| Browser Web Speech API unsupported on some browsers | Medium | Provide server-side Whisper & ElevenLabs adapters with explicit browser permission prompts |
| High LLM latency during voice conversation | High | Stream responses token-by-token and trigger incremental TTS chunking for low perceived latency |
| 3D Avatar performance degradation on low-end mobile | Medium | Implement automatic WebGL capability detection with automatic fallback to a sleek 2D animated avatar |
| Rate-limit exhaustion on external AI APIs | High | Implement local queuing, HTTP 429 `Retry-After` honoring, and secondary fallback providers |
| Resume data privacy leaks | Critical | Store files exclusively in private Supabase Storage buckets governed by RLS; never send resume PII to public logs |

---

## 4. Testing Requirements
1. **Unit Testing**: Vitest for utility functions, Zod schema validation, and SRS interval math.
2. **Component Testing**: Verification of UI component states (loading, empty, error, active, disabled).
3. **Integration Testing**: Testing API provider adapter fallbacks when primary services return 429 or 500 errors.
4. **Responsive UI Auditing**: Validating layouts on 375px (mobile), 768px (tablet), and 1280px+ (desktop).
