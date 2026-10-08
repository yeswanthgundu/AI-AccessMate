// Comprehensive Integration & Functional Test Suite for AI AccessMate
import assert from "assert";

const BASE_URL = "http://localhost:5000";
const CLIENT_URL = "http://localhost:5173";

async function post(endpoint, body, token = null) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  return { status: res.status, data: await res.json() };
}

async function get(endpoint, token = null) {
  const headers = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: "GET",
    headers,
  });
  return { status: res.status, data: await res.json() };
}

async function put(endpoint, body, token = null) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(body),
  });
  return { status: res.status, data: await res.json() };
}

async function del(endpoint, token = null) {
  const headers = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: "DELETE",
    headers,
  });
  return { status: res.status, data: await res.json() };
}

async function runTestSuite() {
  console.log("=================================================================");
  console.log("🚀 Starting AI AccessMate Comprehensive End-to-End Test Suite");
  console.log("=================================================================\n");

  let passed = 0;
  let total = 0;

  async function test(name, fn) {
    total++;
    try {
      process.stdout.write(`[Test ${total}] ${name} ... `);
      await fn();
      console.log("✅ PASSED");
      passed++;
    } catch (err) {
      console.log(`❌ FAILED: ${err.message}`);
    }
  }

  // 1. Health Endpoint
  await test("Backend Health & Database Connectivity", async () => {
    const res = await get("/api/health");
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.status, "ok");
    assert.strictEqual(res.data.geminiConfigured, true);
  });

  // 2. Client Frontend Serving
  await test("Frontend Vite Server Response (HTTP 200 & HTML)", async () => {
    const res = await fetch(CLIENT_URL);
    assert.strictEqual(res.status, 200);
    const html = await res.text();
    assert.ok(html.includes("AI AccessMate") || html.includes("root") || html.includes("vite"));
  });

  // 3. Authentication - Demo User Login
  let authToken = null;
  let userId = null;
  await test("Demo User Login (demo@accessmate.ai / Demo1234!)", async () => {
    const res = await post("/api/auth/login", {
      email: "demo@accessmate.ai",
      password: "Demo1234!",
    });
    assert.strictEqual(res.status, 200);
    assert.ok(res.data.success);
    assert.ok(res.data.token);
    assert.strictEqual(res.data.user.email, "demo@accessmate.ai");
    authToken = res.data.token;
    userId = res.data.user.id;
  });

  // 4. User Profile
  await test("Get Authenticated User Profile", async () => {
    const res = await get("/api/user/profile", authToken);
    assert.strictEqual(res.status, 200);
    assert.ok(res.data.success);
    assert.strictEqual(res.data.user.id, userId);
  });

  // 5. Update Preferences
  await test("Update Accessibility Preferences (Font scale, Contrast, Voice speed)", async () => {
    const res = await put(
      "/api/user/preferences",
      {
        font_size: "large",
        high_contrast: true,
        speech_speed: 0.9,
        language: "Telugu",
        ability_profile: "dyslexia",
      },
      authToken
    );
    assert.strictEqual(res.status, 200);
    assert.ok(res.data.success);
  });

  // 6. Text Simplifier
  await test("AI Text Simplifier (/api/ai/simplify - Grade 6)", async () => {
    const res = await post(
      "/api/ai/simplify",
      {
        text: "The beneficiary must furnish an affidavit attesting to indigent status prior to disbursement of subsidies.",
        readingLevel: "Grade 6",
        abilityProfile: "dyslexia",
      },
      authToken
    );
    assert.strictEqual(res.status, 200);
    assert.ok(res.data.success);
    assert.ok(res.data.data.simplifiedText);
    assert.ok(res.data.data.wordDefinitions?.length > 0);
  });

  // 7. Multi-Language Translator
  await test("Regional Translator (/api/ai/translate - Telugu)", async () => {
    const res = await post(
      "/api/ai/translate",
      {
        text: "Welcome to AI AccessMate. See it. Understand it. Act on it.",
        targetLanguage: "Telugu",
        sourceLanguage: "English",
      },
      authToken
    );
    assert.strictEqual(res.status, 200);
    assert.ok(res.data.success);
    assert.ok(res.data.data.translatedText);
  });

  // 8. Scam Guard
  await test("Scam & Risk Guard (/api/ai/scam-check)", async () => {
    const res = await post(
      "/api/ai/scam-check",
      {
        message: "URGENT: Your Electricity power will be disconnected tonight at 9:30 PM call 9876543210 immediately.",
        context: "sms",
      },
      authToken
    );
    assert.strictEqual(res.status, 200);
    assert.ok(res.data.success);
    assert.strictEqual(res.data.data.verdict, "dangerous");
    assert.ok(res.data.data.reasons?.length > 0);
    assert.ok(res.data.data.recommendedActions?.length > 0);
  });

  // 9. Document Navigator
  await test("Document Navigator (/api/ai/document)", async () => {
    const res = await post(
      "/api/ai/document",
      {
        documentText: "PUBLIC NOTICE: Submit your scholarship dossier before 25th October 2026. Attach income certificate and student ID.",
        userLanguage: "English",
      },
      authToken
    );
    assert.strictEqual(res.status, 200);
    assert.ok(res.data.success);
    assert.ok(res.data.data.summary);
    assert.ok(res.data.data.actionSteps?.length > 0);
    assert.ok(res.data.data.requiredDocuments?.length > 0);
    assert.ok(res.data.data.deadlines?.length > 0);
  });

  // 10. Snap & Understand (Vision AI)
  await test("Snap & Understand (/api/ai/image - Multimodal Vision)", async () => {
    const tinyPng = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
    const res = await post(
      "/api/ai/image",
      {
        imageBase64: tinyPng,
        mimeType: "image/png",
        notes: "Prescription medicine label snapshot",
      },
      authToken
    );
    assert.strictEqual(res.status, 200);
    assert.ok(res.data.success);
    assert.ok(res.data.data.title);
    assert.ok(res.data.data.summary);
  });

  // 11. Lecture & Study Helper
  await test("Lecture Helper & Interactive Quiz (/api/ai/lecture)", async () => {
    const res = await post(
      "/api/ai/lecture",
      {
        transcriptOrNotes: "Photosynthesis is the process by which green plants transform light energy into chemical energy, generating glucose and oxygen from water and carbon dioxide.",
        subject: "Biology",
      },
      authToken
    );
    assert.strictEqual(res.status, 200);
    assert.ok(res.data.success);
    assert.ok(res.data.data.summary);
    assert.ok(res.data.data.keyPoints?.length > 0);
    assert.ok(res.data.data.quiz?.length > 0);
  });

  // 12. Accessibility Checker for Creators
  await test("WCAG Accessibility Linter (/api/ai/accessibility-check)", async () => {
    const res = await post(
      "/api/ai/accessibility-check",
      {
        htmlOrContent: "<div><img src='test.jpg'><input placeholder='Enter name'><h1>Title 1</h1><h1>Title 2</h1></div>",
        contentType: "html",
      },
      authToken
    );
    assert.strictEqual(res.status, 200);
    assert.ok(res.data.success);
    assert.ok(typeof res.data.data.overallScore === "number");
    assert.ok(res.data.data.issues?.length > 0);
  });

  // 13. Word Explainer
  await test("Word Definition & Regional Meaning (/api/ai/explain-word)", async () => {
    const res = await post(
      "/api/ai/explain-word",
      {
        word: "affidavit",
        context: "furnish an affidavit attesting to indigent status",
        targetLanguage: "Telugu",
      },
      authToken
    );
    assert.strictEqual(res.status, 200);
    assert.ok(res.data.success);
    assert.strictEqual(res.data.data.word, "affidavit");
    assert.ok(res.data.data.simpleDefinition);
  });

  // 14. Contextual Q&A
  await test("Contextual Q&A Engine (/api/ai/ask)", async () => {
    const res = await post(
      "/api/ai/ask",
      {
        question: "When must I submit the dossier?",
        context: "Dossiers must be submitted strictly before 25th October 2026 at 5:00 PM.",
      },
      authToken
    );
    assert.strictEqual(res.status, 200);
    assert.ok(res.data.success);
    assert.ok(res.data.data.answer);
  });

  // 15. History Retrieval & Deletion
  let historyItemId = null;
  await test("Retrieve Interaction History (/api/history)", async () => {
    const res = await get("/api/history", authToken);
    assert.strictEqual(res.status, 200);
    assert.ok(res.data.success);
    assert.ok(Array.isArray(res.data.history));
    assert.ok(res.data.history.length > 0, "Expected recorded history items");
    historyItemId = res.data.history[0].id;
  });

  await test(`Delete Interaction History Item (/api/history/${historyItemId})`, async () => {
    if (historyItemId) {
      const res = await del(`/api/history/${historyItemId}`, authToken);
      assert.strictEqual(res.status, 200);
      assert.ok(res.data.success);
    }
  });

  console.log("\n=================================================================");
  console.log(`📊 Test Suite Finished: ${passed}/${total} Tests Passed (${Math.round((passed / total) * 100)}%)`);
  console.log("=================================================================\n");
}

runTestSuite().catch((e) => {
  console.error("Test Suite Fatal Error:", e);
  process.exit(1);
});
