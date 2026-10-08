import dotenv from "dotenv";
dotenv.config();

import {
  simplifyText,
  analyzeScamRisk,
  parseDocument,
  translateContent,
  analyzeImageContent,
  processLectureContent,
  auditAccessibility,
  explainWord,
  answerContextualQuestion,
} from "../services/aiService.js";
import { db } from "../database/db.js";

async function runAllTests() {
  console.log("--- 1. Testing Database Fallback & Operations ---");
  const user = await db.getUserByEmail("demo@accessmate.ai");
  console.log("DB User Found:", user?.email, "Profile:", user?.ability_profile);

  console.log("\n--- 2. Testing Simplify Text ---");
  const sRes = await simplifyText({ text: "The applicant must furnish an affidavit attesting to indigent status." });
  console.log("Simplify OK:", Boolean(sRes.simplifiedText));

  console.log("\n--- 3. Testing Scam Risk ---");
  const scamRes = await analyzeScamRisk({ message: "Urgent electricity disconnection tonight at 9:30 PM call 9876543210" });
  console.log("Scam Verdict:", scamRes.verdict, "Reasons count:", scamRes.reasons?.length);

  console.log("\n--- 4. Testing Document Parser ---");
  const docRes = await parseDocument({ documentText: "Submit scholarship application by Nov 15 2026. Attach income certificate." });
  console.log("Doc Title:", docRes.title, "Action Checklist:", docRes.actionChecklist?.length);

  console.log("\n--- 5. Testing Translator ---");
  const transRes = await translateContent({ text: "Hello friend", targetLanguage: "Telugu" });
  console.log("Translation:", transRes.translatedText);

  console.log("\n--- 6. Testing Lecture Helper ---");
  const lecRes = await processLectureContent({ transcriptOrNotes: "Photosynthesis is the process by which green plants transform light energy into chemical energy." });
  console.log("Lecture Topic:", lecRes.topic, "Key Takeaways:", lecRes.keyTakeaways?.length);

  console.log("\n--- 7. Testing Accessibility Audit ---");
  const audRes = await auditAccessibility({ htmlOrContent: "<img src='sample.png'><div><button>Ok</button></div>" });
  console.log("Audit Score:", audRes.score, "Violations:", audRes.violations?.length || audRes.issues?.length);

  console.log("\n--- 8. Testing Explain Word ---");
  const expRes = await explainWord({ word: "affidavit", context: "furnish an affidavit", targetLanguage: "Telugu" });
  console.log("Explain Word:", expRes.word, "Definition:", expRes.simpleDefinition?.slice(0, 40));

  console.log("\n--- 9. Testing Contextual Q&A ---");
  const qaRes = await answerContextualQuestion({ question: "When is the deadline?", context: "The deadline is November 15, 2026." });
  console.log("QA Answer:", qaRes.answer?.slice(0, 50));

  console.log("\nAll backend AI and Database services executed successfully!");
}

runAllTests().catch((e) => console.error("Test failed:", e));
