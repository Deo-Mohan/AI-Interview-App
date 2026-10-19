import { DefaultAIMentorService } from './services/mentorService.js';
import { MentorChatRequest } from './types/mentor.js';

async function runTests() {
  console.log("=== RUNNING PHASE 3 AI MENTOR UNIT TESTS ===");
  const mentor = new DefaultAIMentorService();
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

  // TEST 1: Resume-Aware Interview Mode
  const interviewReq: MentorChatRequest = {
    sessionId: "test-1",
    userMessage: "In my previous job, we discuss about microservices and scaled Redis.",
    history: [],
    context: {
      modeId: 'resume-interview',
      targetRole: 'Staff Frontend Engineer',
      resumeSummary: 'Experienced frontend architect specializing in performance and Webpack.',
      interviewRound: 'technical'
    }
  };
  const res1 = await mentor.generateMentorTurn(interviewReq);
  assert(res1.spoken_response.length > 20, "Interview mode produces concise spoken response");
  assert(res1.spoken_response.includes("Redis") || res1.spoken_response.includes("cache") || res1.spoken_response.includes("redesign") || res1.spoken_response.includes("choice"), "Interview response contextually adapts to technical topic");
  assert(res1.correction?.suggested === "discuss", "Grammar checker catches 'discuss about' -> 'discuss'");
  assert(res1.useful_phrase !== null && res1.useful_phrase !== undefined, "Interview mode supplies useful technical phrase");

  // TEST 2: Real-Life Scenario Roleplay (Restaurant)
  const scenarioReq: MentorChatRequest = {
    sessionId: "test-2",
    userMessage: "Hi, I have a reservation for two under the name Patel.",
    history: [],
    context: {
      modeId: 'scenario-roleplay',
      scenarioType: 'restaurant',
      scenarioPrompt: 'Ordering and dining at a classic bistro'
    }
  };
  const res2 = await mentor.generateMentorTurn(scenarioReq);
  assert(res2.spoken_response.includes("menu") || res2.spoken_response.includes("special") || res2.spoken_response.includes("table"), "Scenario roleplay responds in character as restaurant server");
  assert(Boolean(res2.useful_phrase?.includes("check") || res2.useful_phrase?.includes("please")), "Supplies restaurant dining phrase");

  // TEST 3: Office English (Polite Disagreement)
  const officeReq: MentorChatRequest = {
    sessionId: "test-3",
    userMessage: "I think skipping unit tests to hit the Friday deadline is risky.",
    history: [],
    context: {
      modeId: 'office-english',
      workplaceContext: 'polite_disagreement'
    }
  };
  const res3 = await mentor.generateMentorTurn(officeReq);
  assert(res3.spoken_response.includes("timeline") || res3.spoken_response.includes("testing") || res3.spoken_response.includes("rollout"), "Office English models diplomatic disagreement");
  assert(Boolean(res3.useful_phrase?.includes("alignment") || res3.useful_phrase?.includes("milestones")), "Office English supplies professional workplace phrase");

  // TEST 4: Topic & Group Discussion Simulator (Challenger role)
  const topicReq: MentorChatRequest = {
    sessionId: "test-4",
    userMessage: "I firmly believe AI should automate all routine software engineering tasks.",
    history: [],
    context: {
      modeId: 'topic-discussion',
      topicTitle: 'AI in Software Development',
      roleInDiscussion: 'group_discussion_challenger',
      discussionDifficulty: 'Advanced'
    }
  };
  const res4 = await mentor.generateMentorTurn(topicReq);
  assert(res4.spoken_response.includes("risk") || res4.spoken_response.includes("safeguards") || res4.spoken_response.includes("critics"), "Group discussion introduces respectful counter-arguments");
  assert(Boolean(res4.useful_phrase?.includes("contrary") || res4.useful_phrase?.includes("merit")), "Provides debate framing phrase");

  // TEST 5: Free Conversation Mode
  const freeReq: MentorChatRequest = {
    sessionId: "test-5",
    userMessage: "Over the weekend, I went hiking in the national park.",
    history: [],
    context: {
      modeId: 'free-conversation'
    }
  };
  const res5 = await mentor.generateMentorTurn(freeReq);
  assert(res5.spoken_response.includes("unwind") || res5.spoken_response.includes("enjoy"), "Free conversation responds warmly to casual weekend hobby");

  // TEST 6: Conversation-Only Mode (Corrections Disabled)
  const convOnlyReq: MentorChatRequest = {
    sessionId: "test-6",
    userMessage: "Yesterday I didn't knew what to do.",
    history: [],
    context: {
      modeId: 'free-conversation'
    },
    preferences: {
      feedbackMode: 'conversation_only',
      mentorTone: 'conversational',
      speechRate: 'natural',
      targetCefrLevel: 'B2'
    }
  };
  const res6 = await mentor.generateMentorTurn(convOnlyReq);
  assert(res6.correction === null, "Conversation-only mode disables corrections");
  assert(res6.natural_alternative === null, "Conversation-only mode disables natural alternatives");

  // TEST 7: Spoken response must NEVER contain the correction text directly
  assert(!res1.spoken_response.includes("did/didn't") && !res1.spoken_response.includes("transitive verb"), "Spoken response is kept clean and separate from teaching feedback");

  console.log(`\nTEST SUMMARY: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
