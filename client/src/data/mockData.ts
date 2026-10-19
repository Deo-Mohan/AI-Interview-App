import { PracticeMode, VocabularyWord, SavedNote, SessionHistoryItem, UserProgressStats } from '../types';

export const MOCK_PRACTICE_MODES: PracticeMode[] = [
  {
    id: 'resume-interview',
    title: 'Resume-Aware Technical & HR Interview',
    shortTitle: 'Mock Interview',
    badge: 'Popular',
    description: 'Upload your resume and paste a target job description. The AI interviewer asks contextual technical and behavioral STAR questions.',
    iconName: 'Bot',
    category: 'interview',
    suggestedDuration: '15-20 mins',
    difficulty: 'Advanced',
  },
  {
    id: 'scenario-roleplay',
    title: 'Real-World Scenario Roleplay',
    shortTitle: 'Roleplay',
    description: 'Immerse in realistic spoken situations: salary negotiation, airport check-in, hotel disputes, or coffee shop ordering.',
    iconName: 'Theater',
    category: 'daily',
    suggestedDuration: '10 mins',
    difficulty: 'Intermediate',
  },
  {
    id: 'office-english',
    title: 'Executive & Office English',
    shortTitle: 'Workplace English',
    badge: 'Career',
    description: 'Master polite disagreement, meeting facilitation, executive project updates, and diplomatic feedback with global colleagues.',
    iconName: 'Briefcase',
    category: 'professional',
    suggestedDuration: '12 mins',
    difficulty: 'Intermediate',
  },
  {
    id: 'free-conversation',
    title: 'Free Flow Conversational Practice',
    shortTitle: 'Free Chat',
    description: 'Casual, low-pressure conversational practice on any topic: hobbies, current events, tech trends, philosophy, or daily reflections.',
    iconName: 'Coffee',
    category: 'daily',
    suggestedDuration: '15 mins',
    difficulty: 'Beginner',
  },
  {
    id: 'topic-discussion',
    title: 'Topic Debate & Group Discussion',
    shortTitle: 'Group Discussion',
    badge: 'New',
    description: 'Select or propose any debate topic. The AI simulates group discussion turn-taking, counter-arguments, and moderation.',
    iconName: 'Users',
    category: 'professional',
    suggestedDuration: '15 mins',
    difficulty: 'Advanced',
  },
];

export const MOCK_VOCABULARY: VocabularyWord[] = [
  {
    id: 'v1',
    word: 'Articulate',
    phonetic: '/ɑːrˈtɪk.jə.lət/',
    partOfSpeech: 'adjective',
    definition: 'Expressing ideas clearly and effectively in speech or writing.',
    synonyms: ['eloquent', 'fluent', 'lucid', 'coherent'],
    antonyms: ['inarticulate', 'hesitant', 'unclear'],
    exampleSentences: [
      'She gave an articulate and persuasive presentation to the engineering board.',
      'An articulate interviewee always stands out during the behavioral round.',
      'He struggled to be articulate under the intense pressure of the debate.'
    ],
    isFavorite: true,
    masteryLevel: 'reviewing',
    timesReviewed: 4,
    lastReviewedDate: '2026-10-18',
  },
  {
    id: 'v2',
    word: 'Pragmatic',
    phonetic: '/præɡˈmæt.ɪk/',
    partOfSpeech: 'adjective',
    definition: 'Dealing with things sensibly and realistically based on practical rather than theoretical considerations.',
    synonyms: ['practical', 'realistic', 'sensible', 'down-to-earth'],
    antonyms: ['idealistic', 'impractical', 'dogmatic'],
    exampleSentences: [
      'We need a pragmatic approach to meet our product deadline this quarter.',
      'His pragmatic feedback helped us avoid unnecessary architecture rework.',
      'In technical interviews, interviewers value pragmatic engineering tradeoffs.'
    ],
    isFavorite: false,
    masteryLevel: 'learning',
    timesReviewed: 2,
    lastReviewedDate: '2026-10-17',
  },
  {
    id: 'v3',
    word: 'Concise',
    phonetic: '/kənˈsaɪs/',
    partOfSpeech: 'adjective',
    definition: 'Giving a lot of information clearly and in a few words; brief and comprehensive.',
    synonyms: ['succinct', 'brief', 'pithy', 'terse'],
    antonyms: ['wordy', 'verbose', 'rambling'],
    exampleSentences: [
      'Keep your self-introduction concise, ideally under two minutes.',
      'The executive appreciated the concise summary of the project status.',
      'A concise answer signals clarity of thought to the interviewer.'
    ],
    isFavorite: true,
    masteryLevel: 'mastered',
    timesReviewed: 7,
    lastReviewedDate: '2026-10-19',
  },
  {
    id: 'v4',
    word: 'Diplomatic',
    phonetic: '/ˌdɪp.ləˈmæt.ɪk/',
    partOfSpeech: 'adjective',
    definition: 'Having or showing an ability to deal with people in a sensitive, tactful, and effective way.',
    synonyms: ['tactful', 'polite', 'discreet', 'judicious'],
    antonyms: ['tactless', 'blunt', 'rude'],
    exampleSentences: [
      'She gave a diplomatic response when asked about previous company politics.',
      'Diplomatic disagreement is essential in senior engineering discussions.',
      'Handling customer complaints requires a calm, diplomatic demeanor.'
    ],
    isFavorite: false,
    masteryLevel: 'learning',
    timesReviewed: 1,
    lastReviewedDate: '2026-10-15',
  },
  {
    id: 'v5',
    word: 'Resilient',
    phonetic: '/rɪˈzɪl.jənt/',
    partOfSpeech: 'adjective',
    definition: 'Able to withstand or recover quickly from difficult conditions or setbacks.',
    synonyms: ['robust', 'tough', 'tenacious', 'adaptable'],
    antonyms: ['fragile', 'vulnerable', 'inflexible'],
    exampleSentences: [
      'The engineering team was resilient despite the unexpected deployment outage.',
      'Speaking English becomes easier when you are resilient to occasional grammar slips.',
      'Highlighting how resilient you are under pressure strengthens your behavioral interview.'
    ],
    isFavorite: true,
    masteryLevel: 'mastered',
    timesReviewed: 8,
    lastReviewedDate: '2026-10-19',
  }
];

export const MOCK_SAVED_NOTES: SavedNote[] = [
  {
    id: 'note-1',
    title: 'Senior Frontend System Design Mock',
    date: '2026-10-18',
    modeTitle: 'Resume-Aware Technical & HR Interview',
    cefrLevel: 'C1 (Advanced Fluent)',
    speakingSpeedWpm: 138,
    overview: 'Practiced system architecture explanation, state management tradeoffs, and CDN caching strategies. Articulated technical choices with high clarity.',
    grammarFeedback: [
      {
        original: 'I didn’t knew about this caching header before.',
        correction: 'I didn’t know about this caching header before.',
        explanation: 'Did/didn’t already indicates the past tense, so use the base form of the verb "know".'
      },
      {
        original: 'We discuss about the architecture yesterday.',
        correction: 'We discussed the architecture yesterday.',
        explanation: '"Discuss" does not take the preposition "about"; use the transitive verb directly.'
      }
    ],
    naturalAlternatives: [
      {
        learnerSaid: 'I think this is very good for performance.',
        betterAlternative: 'This yields significant performance gains under high concurrency.'
      },
      {
        learnerSaid: 'I told them they are wrong.',
        betterAlternative: 'I respectfully walked them through the counter-arguments.'
      }
    ],
    newVocabulary: ['Pragmatic', 'Articulate', 'Idempotent', 'Throughput'],
    userNotes: 'Remember to emphasize time-to-first-byte (TTFB) during the CDN caching section.'
  },
  {
    id: 'note-2',
    title: 'Salary Negotiation & Offer Alignment',
    date: '2026-10-16',
    modeTitle: 'Real-World Scenario Roleplay',
    cefrLevel: 'B2 (Upper Intermediate)',
    speakingSpeedWpm: 124,
    overview: 'Simulated a counter-offer discussion for a Staff Engineer role. Handled pushback on equity vesting schedules gracefully and diplomatically.',
    grammarFeedback: [
      {
        original: 'I am agree with your proposal.',
        correction: 'I agree with your proposal.',
        explanation: '"Agree" is a verb in English, so say "I agree" rather than "I am agree".'
      }
    ],
    naturalAlternatives: [
      {
        learnerSaid: 'Give me more money because market is high.',
        betterAlternative: 'Based on current market benchmarks for this tier, I was anticipating a compensation package closer to...'
      }
    ],
    newVocabulary: ['Diplomatic', 'Remuneration', 'Vesting', 'Benchmark'],
    userNotes: 'Sounded much more confident during the second attempt. Pause before answering!'
  }
];

export const MOCK_USER_PROGRESS: UserProgressStats = {
  speakingStreakDays: 14,
  totalSpeakingMinutes: 285,
  sessionsCompleted: 19,
  averageFluencyScore: 84,
  vocabularyMastered: 42,
  currentCefrEstimate: 'B2+',
  recurringGrammarPatterns: [
    {
      category: 'Past Tense Auxiliary Consistency',
      frequency: 6,
      tip: 'Remember that "did/didn\'t" must always be followed by the base infinitive form.'
    },
    {
      category: 'Unnecessary Prepositions',
      frequency: 4,
      tip: 'Avoid "discuss about" and "emphasize on" — use "discuss" and "emphasize" directly.'
    },
    {
      category: 'Subject-Verb Agreement in Complex Sentences',
      frequency: 3,
      tip: 'When multiple clauses precede the verb, ensure singular/plural matches the true head noun.'
    }
  ]
};

export const MOCK_RECENT_SESSIONS: SessionHistoryItem[] = [
  {
    id: 'sess-1',
    modeId: 'resume-interview',
    modeTitle: 'Frontend Architect Mock',
    date: 'Yesterday, 4:30 PM',
    durationMinutes: 18,
    fluencyScore: 88,
    grammarCorrectionsCount: 2,
    keyTopic: 'Micro-frontends & Webpack Federation'
  },
  {
    id: 'sess-2',
    modeId: 'office-english',
    modeTitle: 'Product Sprint Conflict Resolution',
    date: 'Oct 16, 2026',
    durationMinutes: 12,
    fluencyScore: 82,
    grammarCorrectionsCount: 1,
    keyTopic: 'Cross-functional alignment and roadmap pushback'
  },
  {
    id: 'sess-3',
    modeId: 'free-conversation',
    modeTitle: 'Future of Artificial General Intelligence',
    date: 'Oct 14, 2026',
    durationMinutes: 22,
    fluencyScore: 86,
    grammarCorrectionsCount: 3,
    keyTopic: 'AI safety ethics, robotics, and creative work'
  }
];
