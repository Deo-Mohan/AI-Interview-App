import { 
  DailyVocabConfig, 
  DictionaryEntry, 
  ProficiencyLevel, 
  DailyVocabCategory 
} from '../types/notesAndVocab.js';
import { DictionaryProviderAdapter } from './dictionaryAdapter.js';

interface VocabularyDatabaseItem {
  word: string;
  category: DailyVocabCategory;
  level: ProficiencyLevel;
}

export class DailyVocabularyService {
  private dictionaryAdapter: DictionaryProviderAdapter;

  // Master Curated Word Pool
  private wordPool: VocabularyDatabaseItem[] = [
    // Interview Words
    { word: 'articulate', category: 'interview', level: 'intermediate' },
    { word: 'pragmatic', category: 'interview', level: 'advanced' },
    { word: 'resilient', category: 'interview', level: 'intermediate' },
    { word: 'concise', category: 'interview', level: 'beginner' },
    { word: 'initiative', category: 'interview', level: 'beginner' },
    { word: 'tradeoff', category: 'interview', level: 'intermediate' },
    { word: 'scalability', category: 'interview', level: 'advanced' },
    { word: 'remediation', category: 'interview', level: 'advanced' },

    // Office Words
    { word: 'diplomatic', category: 'office', level: 'intermediate' },
    { word: 'alignment', category: 'office', level: 'beginner' },
    { word: 'consensus', category: 'office', level: 'intermediate' },
    { word: 'milestone', category: 'office', level: 'beginner' },
    { word: 'bandwidth', category: 'office', level: 'intermediate' },
    { word: 'contingency', category: 'office', level: 'advanced' },
    { word: 'bottleneck', category: 'office', level: 'intermediate' },
    { word: 'leverage', category: 'office', level: 'intermediate' },

    // Everyday Words
    { word: 'spontaneous', category: 'everyday', level: 'intermediate' },
    { word: 'curiosity', category: 'everyday', level: 'beginner' },
    { word: 'perspective', category: 'everyday', level: 'intermediate' },
    { word: 'gratitude', category: 'everyday', level: 'beginner' },
    { word: 'ambiguous', category: 'everyday', level: 'advanced' },
    { word: 'empathy', category: 'everyday', level: 'intermediate' },
    { word: 'versatile', category: 'everyday', level: 'intermediate' },
    { word: 'subtle', category: 'everyday', level: 'intermediate' },
  ];

  constructor(dictionaryAdapter: DictionaryProviderAdapter) {
    this.dictionaryAdapter = dictionaryAdapter;
  }

  /**
   * Deterministically assigns daily words based on:
   * 1. Date string in the user's specific timezone (stable across page refreshes!)
   * 2. Configured daily limit (1, 2, 5, 6, 10, etc.)
   * 3. Filter category and proficiency level
   * 4. Excluding previously assigned or mastered words to prevent duplicate assignments
   */
  async getDailyAssignedWords(
    config: DailyVocabConfig,
    previouslyAssignedWords: string[] = []
  ): Promise<DictionaryEntry[]> {
    const { dailyLimit, category, level, timezone } = config;

    // 1. Get today's calendar date in target timezone (e.g., "2026-10-19")
    const todayDateString = this.getDateInTimezone(timezone);

    // 2. Filter pool by category and level
    let filteredPool = this.wordPool.filter(item => {
      const categoryMatch = category === 'mixed' || item.category === category;
      const levelMatch = item.level === level;
      return categoryMatch && levelMatch;
    });

    // If filter is smaller than requested dailyLimit, expand to category pool then general pool
    if (filteredPool.length < dailyLimit) {
      filteredPool = this.wordPool.filter(item => category === 'mixed' || item.category === category);
    }
    if (filteredPool.length < dailyLimit) {
      filteredPool = [...this.wordPool];
    }

    // 3. Exclude previously assigned words to prevent duplicate assignments
    const availablePool = filteredPool.filter(
      item => !previouslyAssignedWords.includes(item.word.toLowerCase())
    );

    const targetPool = availablePool.length >= dailyLimit ? availablePool : filteredPool;

    // 4. Stable pseudo-random seed based on Date String
    const seed = this.hashDateString(todayDateString);

    // Deterministically pick `dailyLimit` distinct words
    const selectedWords: string[] = [];
    const poolCopy = [...targetPool];

    for (let i = 0; i < dailyLimit && poolCopy.length > 0; i++) {
      const index = (seed + i * 7) % poolCopy.length;
      selectedWords.push(poolCopy[index].word);
      poolCopy.splice(index, 1);
    }

    // 5. Hydrate rich dictionary details for all selected words
    const entries = await Promise.all(
      selectedWords.map(w => this.dictionaryAdapter.lookupWord(w))
    );

    return entries;
  }

  private getDateInTimezone(tz: string): string {
    try {
      const now = new Date();
      return new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(now);
    } catch {
      return new Date().toISOString().split('T')[0];
    }
  }

  private hashDateString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }
}
