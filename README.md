# AI English Speaking & Communication Coach

A production-oriented, responsive web application that empowers users to improve their spoken English fluency, confidence, and career readiness through real-time voice conversations with an intelligent, patient, supportive 3D AI mentor.

Inspired by the clean, academic-tech design language of [EventLooped](https://www.eventlooped.com/free-month).

---

## 🚀 Key Features

1. **3D AI Human Mentor**: Procedural 3D avatar built with Three.js / React Three Fiber featuring natural idle breathing, attentive listening orientation, and real-time lip sync.
2. **Dual Transcript & Real-Time Coaching Rail**: Live voice transcript stream with subtle non-intrusive grammar corrections, native alternatives, and vocabulary suggestions.
3. **Five Specialized Practice Modes**:
   - **Resume-Aware Tech & HR Mock Interview**: Resume uploader + job description parser + dynamic STAR interview questions.
   - **Real-World Scenario Roleplay**: Negotiation, dining, airport check-in, customer support.
   - **Office & Workplace English**: Professional meeting diplomacy, presentation phrasings, polite disagreement.
   - **Free Conversation**: Open fluency dialogues across varied casual topics.
   - **Topic & Group Discussion Simulator**: User-defined topics with multi-perspective debate simulation.
4. **Post-Session Notes & PDF Export**: Instant session recap, CEFR fluency rating, mistake inventory with fixes, and one-click PDF/Markdown export.
5. **Daily Vocabulary Lab & Comprehensive Dictionary**: Configurable daily word goals, IPA phonetics, audio pronunciation, synonyms, antonyms, 3 context sentences, and SRS flashcards.
6. **Robust Security & Provider Architecture**:
   - Zero secrets exposed to client bundles.
   - Provider adapters for LLM, STT, and TTS with graceful browser Web Speech API fallbacks.
   - Supabase PostgreSQL with strict Row-Level Security (RLS).

---

## 🏛️ System Architecture

```mermaid
graph TD
    Client["Client (React + Vite + Tailwind + Three.js)"]
    Server["Backend Server (Node.js + Express + TypeScript)"]
    Supabase["Supabase (Auth + PostgreSQL + Private Storage)"]
    AI_Providers["AI Services (OpenAI / Anthropic / Gemini / ElevenLabs)"]
    Dictionary["Dictionary API (Phonetics & Examples)"]

    Client <-->|REST API / WebSocket| Server
    Client <-->|Supabase Client (Anon Key + RLS)| Supabase
    Server <-->|Service Role Admin| Supabase
    Server <-->|Provider Adapters with Backoff| AI_Providers
    Server <-->|Definitions & Phonetics| Dictionary
```

---

## 📁 Proposed Folder Structure

```
d:/DEVELOPMENT/AI Interview app/
├── DESIGN_SYSTEM.md        # Verified design tokens, typography, and UI specs
├── PROJECT_CONTEXT.md      # Permanent product specification & phase tracker
├── IMPLEMENTATION_PLAN.md   # 9-Phase master roadmap, acceptance criteria, & risks
├── .env.example            # Environment variables template
├── README.md               # Architecture and setup guide
│
├── client/                 # Frontend React application (Phase 1)
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/     # UI primitives, Sidebar, Header, AvatarCanvas
│   │   ├── contexts/       # Auth, Audio, and Session state
│   │   ├── hooks/          # useSpeechRecognition, useAudioWaveform
│   │   ├── pages/          # Dashboard, ConversationRoom, Modes, Notes, Vocab
│   │   ├── services/       # Client API client & Supabase client
│   │   ├── types/          # Shared TypeScript interfaces
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
│
└── server/                 # Backend Node.js Express application (Phase 1)
    ├── src/
    │   ├── config/         # Environment configuration
    │   ├── controllers/    # Route controllers
    │   ├── middleware/     # Rate limiting, auth verification, validation
    │   ├── routes/         # API routes (/api/ai, /api/dictionary, /api/notes)
    │   ├── services/       # Provider adapters (LLM, STT, TTS, ResumeParser)
    │   └── index.ts
    ├── package.json
    └── tsconfig.json
```

---

## 🛠️ Setup Instructions (Phase 1 Preview)

### Prerequisites
- Node.js (v18+ or v20+ recommended)
- npm (v9+)

### Installation Steps
```bash
# Clone or navigate to the workspace
cd "d:/DEVELOPMENT/AI Interview app"

# Copy environment template
cp .env.example .env

# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install

# Run frontend dev server
cd ../client
npm run dev

# Run backend dev server (in parallel terminal)
cd ../server
npm run dev
```

---

## 📋 Phase 0 Checklist

- [x] Repository state audited (initially empty, ready for clean scaffolding)
- [x] Reference website inspected visually and programmatically at desktop (`1280x800`) and mobile (`375x812`) widths
- [x] Verified typography, fonts, colors, borders, grid canvas, and navigation documented in `DESIGN_SYSTEM.md`
- [x] Permanent product specification and roadmap established in `PROJECT_CONTEXT.md`
- [x] 9-phase milestones, acceptance criteria, testing requirements, and risk mitigation documented in `IMPLEMENTATION_PLAN.md`
- [x] Security guidelines, provider secrets separation, and client variables defined in `.env.example`
- [x] Comprehensive architecture diagram, folder structure, and setup instructions documented in `README.md`
- [x] Execution halted at Phase 0 awaiting user approval for Phase 1
