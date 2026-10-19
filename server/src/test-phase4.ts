import { FreeDictionaryApiAdapter } from './services/dictionaryAdapter.js';
import { DailyVocabularyService } from './services/dailyVocabService.js';
import { NotesGeneratorService } from './services/notesGeneratorService.js';
import { GenerateNotesRequest } from './types/notesAndVocab.js';

async function runPhase4Tests() {
  console.log("=== RUNNING PHASE 4 TESTS: NOTES & VOCABULARY ===");
  const dictAdapter = new FreeDictionaryApiAdapter();
  const dailyService = new DailyVocabularyService(dictAdapter);
  const notesService = new NotesGeneratorService();

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      failed++;
    }
  }

  // 1. DICTIONARY LOOKUP TEST
  const wordEntry = await dictAdapter.lookupWord("pragmatic");
  assert(wordEntry.word.toLowerCase() === "pragmatic", "Dictionary retrieves correct word");
  assert(Boolean(wordEntry.definition && wordEntry.definition.length > 10), "Word includes detailed definition");
  assert(wordEntry.exampleSentences.length === 3, "Dictionary delivers exactly 3 contextual example sentences");
  assert(Boolean(wordEntry.phonetic), "Phonetic transcript is present");

  // 2. DICTIONARY FALLBACK & MISSING WORD TEST
  const unknownEntry = await dictAdapter.lookupWord("supercalifragilistictech123");
  assert(unknownEntry.source === "ai_generated", "Unsupported word falls back gracefully to synthetic source");
  assert(unknownEntry.exampleSentences.length === 3, "Synthetic word includes 3 example sentences");

  // 3. DAILY VOCABULARY ASSIGNMENT WITH CONFIGURABLE LIMITS
  const limit1Words = await dailyService.getDailyAssignedWords({
    dailyLimit: 1,
    level: 'intermediate',
    category: 'interview',
    timezone: 'America/New_York'
  });
  assert(limit1Words.length === 1, "Correctly enforces daily limit of 1 word");

  const limit6Words = await dailyService.getDailyAssignedWords({
    dailyLimit: 6,
    level: 'intermediate',
    category: 'office',
    timezone: 'America/New_York'
  });
  assert(limit6Words.length === 6, "Correctly enforces daily limit of 6 words");

  // 4. DUPLICATE EXCLUSION TEST
  const word1 = limit1Words[0].word.toLowerCase();
  const nextAssigned = await dailyService.getDailyAssignedWords({
    dailyLimit: 2,
    level: 'intermediate',
    category: 'interview',
    timezone: 'America/New_York'
  }, [word1]);
  assert(!nextAssigned.some(w => w.word.toLowerCase() === word1), "Previously assigned words are excluded from new daily allocations");

  // 5. STABILITY ACROSS REFRESHES (SAME TIMEZONE AND SEED)
  const runA = await dailyService.getDailyAssignedWords({
    dailyLimit: 3,
    level: 'intermediate',
    category: 'mixed',
    timezone: 'UTC'
  });
  const runB = await dailyService.getDailyAssignedWords({
    dailyLimit: 3,
    level: 'intermediate',
    category: 'mixed',
    timezone: 'UTC'
  });
  assert(runA[0].word === runB[0].word && runA[1].word === runB[1].word, "Daily word allocations remain deterministic across refreshes for the same calendar date");

  // 6. GENERATE NOTES TEST
  const mockNotesReq: GenerateNotesRequest = {
    sessionId: "sess-4001",
    modeId: "resume-interview",
    modeTitle: "Tech Architecture Mock",
    messages: [
      {
        id: "m1",
        sender: "ai",
        text: "Could you describe your Redis replication strategy?",
        timestamp: "00:04"
      },
      {
        id: "m2",
        sender: "user",
        text: "I didn't knew about read replicas, so we discuss about it.",
        timestamp: "00:25",
        grammarFeedback: {
          original: "didn't knew",
          suggested: "didn't know",
          explanation: "Use base verb with did/didn't."
        },
        naturalAlternative: "We evaluated read replicas during our architecture review.",
        vocabularyHighlight: "Throughput"
      }
    ],
    includeFullTranscript: true
  };

  const generatedNotes = notesService.generateSessionNotes(mockNotesReq);
  assert(Boolean(generatedNotes.title.includes("Tech Architecture Mock")), "Generated note includes accurate session title");
  assert(generatedNotes.grammarCorrections.length >= 1, "Grammar corrections faithfully extracted from session transcript");
  assert(generatedNotes.naturalAlternatives.length >= 1, "Natural alternatives included in lesson notes");
  assert(generatedNotes.importantVocabulary.includes("Throughput"), "Session vocabulary preserved in lesson highlights");
  assert(Boolean(generatedNotes.fullTranscript && generatedNotes.fullTranscript.length === 2), "Full transcript included when requested");
  assert(generatedNotes.exercisesAndQuestions.length >= 2, "Structured exercises and revision questions generated");

  console.log(`\nPHASE 4 TEST SUMMARY: ${passed} passed, ${failed} failed.`);
  if (failed > 0) process.exit(1);
}

runPhase4Tests();
