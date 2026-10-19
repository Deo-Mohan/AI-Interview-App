import { DictionaryEntry, DictionaryEntrySchema } from '../types/notesAndVocab.js';

export interface DictionaryProviderAdapter {
  lookupWord(word: string): Promise<DictionaryEntry>;
}

export class FreeDictionaryApiAdapter implements DictionaryProviderAdapter {
  private fallbackDatabase: Record<string, Partial<DictionaryEntry>> = {
    'articulate': {
      phonetic: '/ɑːrˈtɪk.jə.lət/',
      partOfSpeech: 'adjective',
      definition: 'Expressing ideas clearly and effectively in speech or writing.',
      synonyms: ['eloquent', 'fluent', 'lucid', 'coherent'],
      antonyms: ['inarticulate', 'hesitant'],
      exampleSentences: [
        'She gave an articulate and persuasive presentation to the engineering team.',
        'An articulate candidate always leaves a memorable impression in behavioral interviews.',
        'He struggled to be articulate under the intense pressure of the debate.'
      ]
    },
    'pragmatic': {
      phonetic: '/præɡˈmæt.ɪk/',
      partOfSpeech: 'adjective',
      definition: 'Dealing with things sensibly and realistically based on practical considerations rather than theory.',
      synonyms: ['practical', 'realistic', 'sensible', 'down-to-earth'],
      antonyms: ['idealistic', 'impractical'],
      exampleSentences: [
        'We need a pragmatic approach to achieve our product launch deadline.',
        'Her pragmatic feedback helped us avoid expensive architecture redesigns.',
        'Senior engineers prioritize pragmatic tradeoffs over theoretical perfection.'
      ]
    },
    'concise': {
      phonetic: '/kənˈsaɪs/',
      partOfSpeech: 'adjective',
      definition: 'Giving a lot of information clearly and in a few words; brief and comprehensive.',
      synonyms: ['succinct', 'brief', 'pithy'],
      antonyms: ['verbose', 'wordy', 'rambling'],
      exampleSentences: [
        'Keep your elevator pitch concise and focused on measurable impact.',
        'The executive appreciated the concise summary of the system outage.',
        'Clear, concise answers communicate strong confidence during interviews.'
      ]
    },
    'diplomatic': {
      phonetic: '/ˌdɪp.ləˈmæt.ɪk/',
      partOfSpeech: 'adjective',
      definition: 'Having or showing an ability to deal with people in a sensitive, tactful, and effective way.',
      synonyms: ['tactful', 'polite', 'discreet'],
      antonyms: ['blunt', 'tactless'],
      exampleSentences: [
        'She offered a diplomatic response when asked about legacy code decisions.',
        'Diplomatic disagreement is a cornerstone of senior engineering collaboration.',
        'Managing difficult clients requires a calm, diplomatic demeanor.'
      ]
    },
    'resilient': {
      phonetic: '/rɪˈzɪl.jənt/',
      partOfSpeech: 'adjective',
      definition: 'Able to withstand or recover quickly from difficult conditions or setbacks.',
      synonyms: ['robust', 'tenacious', 'adaptable'],
      antonyms: ['fragile', 'vulnerable'],
      exampleSentences: [
        'The backend cluster proved remarkably resilient during peak traffic.',
        'Language learners become fluent faster when they are resilient to occasional errors.',
        'Highlighting how you stayed resilient during a past failure makes a compelling STAR story.'
      ]
    }
  };

  async lookupWord(word: string): Promise<DictionaryEntry> {
    const cleanWord = word.trim().toLowerCase();

    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(cleanWord)}`);
      
      if (response.ok) {
        const data = (await response.json()) as any;
        const entry = data[0];
        const meaning = entry.meanings?.[0];
        const def = meaning?.definitions?.[0];

        // Extract audio if available
        let audioUrl: string | undefined = undefined;
        if (entry.phonetics && Array.isArray(entry.phonetics)) {
          const withAudio = entry.phonetics.find((p: any) => p.audio && p.audio.length > 0);
          if (withAudio) audioUrl = withAudio.audio;
        }

        // Sourced examples from API or generate AI fallback examples
        const examples: string[] = [];
        if (def?.example) examples.push(def.example);

        // Ensure 3 distinct examples
        while (examples.length < 3) {
          examples.push(this.generateExampleSentence(cleanWord, examples.length + 1));
        }

        return DictionaryEntrySchema.parse({
          word: entry.word || cleanWord,
          phonetic: entry.phonetic || entry.phonetics?.[0]?.text || `/${cleanWord}/`,
          audioUrl,
          partOfSpeech: meaning?.partOfSpeech || 'noun',
          definition: def?.definition || `A term used in English communication representing '${cleanWord}'.`,
          synonyms: meaning?.synonyms || def?.synonyms || [],
          antonyms: meaning?.antonyms || def?.antonyms || [],
          exampleSentences: examples.slice(0, 3),
          source: 'free_dictionary_api',
          usageNotes: 'Retrieved from Free Dictionary API.'
        });
      }
    } catch (err) {
      console.warn(`[DictionaryAdapter] Live lookup failed for '${cleanWord}', using fallback:`, err);
    }

    // Curated fallback database
    if (this.fallbackDatabase[cleanWord]) {
      const fallback = this.fallbackDatabase[cleanWord];
      return DictionaryEntrySchema.parse({
        word: cleanWord,
        phonetic: fallback.phonetic || `/${cleanWord}/`,
        partOfSpeech: fallback.partOfSpeech || 'noun',
        definition: fallback.definition || `The concept or action of ${cleanWord}.`,
        synonyms: fallback.synonyms || [],
        antonyms: fallback.antonyms || [],
        exampleSentences: fallback.exampleSentences || [
          this.generateExampleSentence(cleanWord, 1),
          this.generateExampleSentence(cleanWord, 2),
          this.generateExampleSentence(cleanWord, 3)
        ],
        source: 'curated_database',
        usageNotes: 'Retrieved from curated high-yield vocabulary repository.'
      });
    }

    // AI/Synthetic generated entry for rare/technical terms
    return DictionaryEntrySchema.parse({
      word: cleanWord,
      phonetic: `/${cleanWord}/`,
      partOfSpeech: 'noun',
      definition: `A term used in English communication denoting ${cleanWord}.`,
      synonyms: [],
      antonyms: [],
      exampleSentences: [
        this.generateExampleSentence(cleanWord, 1),
        this.generateExampleSentence(cleanWord, 2),
        this.generateExampleSentence(cleanWord, 3)
      ],
      source: 'ai_generated',
      usageNotes: 'Synthetic entry generated because live dictionary had no record for this term.'
    });
  }

  private generateExampleSentence(word: string, index: number): string {
    const templates = [
      `Incorporating the term "${word}" in professional dialogue clarifies your intent.`,
      `The team carefully considered the role of "${word}" in their latest technical review.`,
      `Practicing how to use "${word}" correctly improves overall spoken English fluency.`
    ];
    return templates[index - 1] || `Example illustrating proper use of "${word}" in conversation.`;
  }
}
