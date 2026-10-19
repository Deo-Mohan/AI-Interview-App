# DESIGN_SYSTEM.md — Verified EventLooped-Inspired Design System

## 1. Reference & Inspection Audit
- **Reference URL**: `https://www.eventlooped.com/free-month`
- **Method of Inspection**: Automated visual browser subagent evaluation at desktop (`1280x800`) and mobile (`375x812`), DOM style extraction, and element-level attribute analysis.
- **Visual Recording**: `eventlooped_inspect_1792239341454.webp`
- **Screenshots Captured**:
  - Desktop View: `desktop_view_1792239366456.png`
  - Mobile View: `mobile_view_1792239374454.png`

---

## 2. Verified Typography & Fonts
- **Primary UI & Reading Sans-Serif**:
  - `Inter`, `Plus Jakarta Sans`, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
  - Weights Verified: `400` (Regular), `500` (Medium), `600` (SemiBold), `700` (Bold), `800` (ExtraBold).
- **Monospace & Metric Accents**:
  - `Space Mono`, `JetBrains Mono`, `Geist Mono`, ui-monospace, monospace.
  - Used for: Character count badges (`332 chars`), code/phonetic snippets, timer/frequency readouts, and tabular data.
- **Display Headings**:
  - `Plus Jakarta Sans` / `Geist` with uppercase tracking and crisp line heights (`1.2` - `1.35`).
- **Typography Scale**:
  - `Display / Hero`: `2rem - 2.5rem` (32px - 40px), font-extrabold / font-black, tracking-tight.
  - `H1 / Section Title`: `1.5rem - 1.875rem` (24px - 30px), font-bold, tracking-tight.
  - `H2 / Card Title`: `1.125rem - 1.25rem` (18px - 20px), font-bold.
  - `H3 / Subtitle`: `1rem` (16px), font-semibold.
  - `Body Text`: `0.875rem` (14px) / `1rem` (16px), line-height 1.5 - 1.6, text-slate-700.
  - `Small / Metadata`: `0.75rem - 0.8125rem` (12px - 13px), font-medium text-slate-500.
  - `Micro Tag / Pill Label`: `0.6875rem` (11px), uppercase font-bold, tracking-wider (`tracking-widest`).

---

## 3. Verified Color Palette & Tokens

### Neutrals (Slate Foundation)
- **App Canvas Background**: `#FBFBFC` (clean off-white canvas with subtle 32px x 32px grid: `linear-gradient(to right, rgba(226, 232, 240, 0.65) 1px, transparent 1px), linear-gradient(to bottom, rgba(226, 232, 240, 0.65) 1px, transparent 1px)`)
- **Card / Surface Background**: `#FFFFFF` (Pure crisp white)
- **Subtle Surface / Well**: `#F8FAFC` (`slate-50`)
- **Muted Surface / Hover**: `#F1F5F9` (`slate-100`)
- **Borders & Dividers**:
  - Card & Container Border: `#E2E8F0` (`slate-200`)
  - Subtle Divider: `#F1F5F9` (`slate-100`)
  - Input / Interactive Border: `#CBD5E1` (`slate-300`)
  - Accent / Focus Ring: `#2563EB` with `ring-offset-2`
- **Text Hierarchy**:
  - Primary: `#0F172A` (`slate-900`)
  - Body: `#334155` (`slate-700`)
  - Secondary / Muted: `#64748B` (`slate-500`)
  - Disabled / Placeholder: `#94A3B8` (`slate-400`)

### Brand & Interactive Colors
- **Cobalt Primary Blue**:
  - `blue-50`: `#EFF6FF`
  - `blue-100`: `#DBEAFE`
  - `blue-500`: `#3B82F6`
  - `blue-600`: `#2563EB` (Primary buttons, active indicators, call-to-actions)
  - `blue-700`: `#1D4ED8`
  - `blue-900`: `#1E3A8A` (Tactile button bottom border)
- **Success / Emerald Accents**:
  - Background: `#ECFDF5` (`emerald-50`)
  - Border: `#A7F3D0` (`emerald-200` / `emerald-300`)
  - Text / Icon: `#059669` / `#065F46` (`emerald-600` / `emerald-800`)
- **Warning / Amber (Corrections & Tips)**:
  - Background: `#FFFBEB` (`amber-50`)
  - Border: `#FDE68A` (`amber-200`)
  - Text: `#B45309` (`amber-700`)
- **Destructive / Rose (Critical Errors & Resets)**:
  - Background: `#FFF1F2` (`rose-50`)
  - Border: `#FECDD3` (`rose-200`)
  - Text: `#E11D48` (`rose-600`)

---

## 4. Layout, Navigation & Breakpoints

### Responsive App Shell
- **Sidebar Widths**:
  - Desktop Expanded: `16rem` (`256px`, `--sidebar-width: 16rem`)
  - Desktop Collapsed (Icon Only): `3.5rem` (`56px`, `--sidebar-width-icon: 3.5rem`)
  - Mobile (<768px): Collapsed into responsive slide-out drawer via mobile header trigger.
- **Top Bar**:
  - Sticky at top (`h-14` or `h-16`), bordered bottom `border-slate-200`, background `bg-white/95 backdrop-blur-sm`.
- **Responsive Breakpoints**:
  - Mobile: `< 768px` (single-column card stacks, `p-4`)
  - Tablet: `768px - 1024px` (2-column grids, collapsible sidebar drawer, `p-6`)
  - Desktop: `1024px - 1280px` (Expanded sidebar, 2 or 3 column card grids)
  - Wide Desktop: `> 1280px` (Max container `max-w-7xl` or `max-w-6xl` centered, `p-8` to `p-10`)

---

## 5. Components & UI Patterns

### Cards
- **Standard Card**: `rounded-2xl border border-slate-200 bg-white p-5 shadow-sm`
- **Featured / Hero Card**: `rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-sm`
- **Sub-well / Code / Monospace Box**: `rounded-xl border border-slate-100 bg-slate-50 p-4 font-mono text-sm leading-relaxed text-slate-700`

### Buttons & Interactive Controls
- **Tactile Primary Action**:
  - `bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl px-6 py-3.5`
  - `border-b-4 border-blue-900 active:translate-y-0.5 active:border-b-2 transition-all`
- **Secondary / Outline Action**:
  - `rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 active:translate-y-px`
- **Ghost / Icon Button**:
  - `size-8 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors`

### Pills, Badges & Micro-tags
- **Status Badge**: `rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider`
- **Numbered Milestone Indicator**: `size-10 rounded-lg bg-slate-950 text-white font-bold flex items-center justify-center shadow-sm`
- **Ping Dot Indicator**: `size-2 animate-ping rounded-full bg-emerald-400`

### Dialogue & Conversation Bubbles
- **Mentor Speech Bubble**: Left-aligned, `bg-white border border-slate-200 rounded-2xl p-4 shadow-sm`, with audio playback icon and clickable pronunciation help.
- **User Speech Bubble**: Right-aligned, `bg-blue-50/60 border border-blue-200 rounded-2xl p-4`, with real-time waveform and grammar correction popovers.

---

## 6. Motion & Micro-Interaction System (Motion for React)

### Motion Philosophy
Motion is purposeful, responsive, and performance-first. Animations communicate state changes and hierarchy, never delaying user interaction or blocking user input.

### Motion Primitives (`client/src/components/motion/MotionTransitions.tsx`)
1. **`PageTransition`**:
   - Hardware-accelerated entrance with cubic-bezier easing `[0.2, 0.8, 0.2, 1]`
   - Duration: `0.24s`, `y: 10px -> 0px`, `opacity: 0 -> 1`
   - Exit: `0.18s`, `y: 0px -> -6px`, `opacity: 1 -> 0`
   - Applied globally across all pages (`DashboardPage`, `ActiveConversationPage`, `VocabularyPage`, `InterviewSetupPage`, `NotesPage`, `ProgressPage`, `SettingsPage`, `SessionCompletePage`, `ModeSelectionPage`).
2. **`StaggerContainer` & `StaggerItem`**:
   - Stagger interval: `0.05s`, initial delay: `0.02s`
   - Item entrance: `0.28s`, easing `[0.16, 1, 0.3, 1]`, `y: 14px -> 0px`
   - Used on Dashboard metric cards, practice modes, vocabulary cards, and learning milestones.
3. **`PulseBeacon`**:
   - Live status indicator with double-ring radiant animation
   - Variants: `emerald` (Active/Connected), `blue` (Speaking/Mentor), `amber` (Processing/Thinking), `rose` (Error/Danger), `slate` (Idle/Standby)
   - Sizes: `sm` (size-2 / ring size-4), `md` (size-2.5 / ring size-5), `lg` (size-3.5 / ring size-7).
4. **`ReactiveAudioWaveform`**:
   - Multi-bar reactive frequency visualizer reacting dynamically to 4 engine states:
     - `idle`: Low baseline rhythm (scaleY 0.25 - 0.4)
     - `listening`: High-responsiveness rapid green bounce (scaleY 0.3 - 1.0)
     - `thinking`: Synchronized wave rolling amber ripple (scaleY 0.2 - 0.7)
     - `speaking`: Expansive resonant cobalt pulses (scaleY 0.4 - 1.1)

### Micro-Interactions & Tactile CSS Classes (`index.css`)
- **`.btn-tactile`**:
  - `bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl px-5 py-2.5`
  - Solid 4px bottom border in deep navy (`#1E3A8A`), active state: `translate-y-[2px] border-b-2`
  - Subtle micro-hover scale `1.015`
- **`.btn-tactile-emerald`**:
  - `bg-emerald-600 hover:bg-emerald-500 border-b-4 border-emerald-900 active:translate-y-[2px]`
- **`.btn-tactile-slate`**:
  - `bg-slate-900 hover:bg-slate-800 border-b-4 border-slate-950 active:translate-y-[2px]`
- **`.card-hover-lift`**:
  - Hover transform: `translate-y-[-2px]`, shadow: `0 8px 24px -4px rgba(15, 23, 42, 0.08)`
  - Transition duration: `180ms ease-out`
- **`.bg-engineering-grid`**:
  - Mathematical 32px x 32px grid on `#FBFBFC` canvas:
    `linear-gradient(to right, rgba(226, 232, 240, 0.65) 1px, transparent 1px), linear-gradient(to bottom, rgba(226, 232, 240, 0.65) 1px, transparent 1px)`

---

## 7. Google Stitch Design System Specifications

### Stitch Project Integration
- **Project Resource**: `projects/15218879240367423156`
- **Project Title**: `AI English Speaking Coach - EventLooped Design`
- **Core Screen Design Prompts & Specifications**:

#### Screen 1: Executive Dashboard (Desktop & Mobile)
```markdown
Executive English learning and speech coaching dashboard in the style of EventLooped (eventlooped.com/free-month). 
Clean, ultra-high-craft SaaS engineering interface with an off-white canvas (#FBFBFC) overlaid with a subtle 32px mathematical grid.
Features:
- Top Header: Minimalist navigation with live mentor status beacon, current streak counter (12 days flaming pill), and user avatar.
- Hero Banner: High-contrast card with crisp 1px #E2E8F0 border, featuring a tactile cobalt blue "Start Daily Practice" button with 4px dark navy offset depth (#1E3A8A), daily speaking goal ring (14/20 mins), and CEFR proficiency chip (B2 Upper Intermediate).
- Practice Modes Grid: Bento layout cards for Mock Interview, Scenario Roleplay, Workplace Pitching, Free Flow, and Topic Discussion. Each card has distinctive accent badges and subtle hover lift.
- Daily Vocabulary Carousel: Word of the Day ("Articulate" /ɑːrˈtɪk.jə.lət/) with audio playback trigger and CEFR mastery tag.
- Recent Sessions & Grammar Watchlist: Clean data table with monospace timestamps and correction previews.
Typography: Plus Jakarta Sans for headings, Inter for body, Space Mono / JetBrains Mono for metrics and timestamps.
```

#### Screen 2: Conversation Studio & Live 3D Avatar (Desktop & Mobile)
```markdown
Immersive AI English speaking conversation studio. 
Two-column responsive layout (7 cols avatar / 5 cols coaching rail):
- 3D Avatar Stage: Dark cinematic studio viewport (#0B0F19) with 3-point studio lighting framing an articulate human AI mentor.
- State Beacon & Audio Waveform: Dynamic top-left status pill ("Krish AI: Listening" with emerald pulse beacon) and bottom multi-bar audio spectrum visualizer reacting to human speech.
- Voice Control Dock: Tactile floating control island with Mic toggle, Interrupt speech button, Mute audio, and End Session button.
- Live Dual Transcript Rail: Real-time speech bubbles clearly differentiating learner speech and AI mentor replies.
- Real-Time Coaching Sidebar: Expandable grammar and vocabulary tips with instant native alternative suggestions.
```

---

## 8. Accessibility & Motion Compliance
- **Contrast**: Complies with WCAG 2.1 AA standards (minimum 4.5:1 for normal text against slate and white backgrounds).
- **Focus Rings**: Distinct visible focus rings (`focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none`).
- **Reduced Motion Support**:
  ```css
  @media (prefers-reduced-motion: reduce) {
    *, ::before, ::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
  ```
  All Motion components automatically obey operating system motion preferences.
