import { z } from "zod";

// Required in specification: Section 16
export const scamCheckSchema = z.object({
  verdict: z.enum(["safe", "suspicious", "dangerous"]),
  reasons: z.array(z.string()),
  recommendedActions: z.array(z.string()),
});

export const documentNavigatorSchema = z.object({
  summary: z.string(),
  actionSteps: z.array(z.string()),
  requiredDocuments: z.array(z.string()),
  deadlines: z.array(z.string()),
  glossary: z.array(
    z.object({
      word: z.string(),
      definition: z.string(),
      regionalTranslation: z.string().optional().default(""),
    })
  ),
});

export const simplifySchema = z.object({
  originalText: z.string(),
  simplifiedText: z.string(),
  readingLevel: z.enum(["Grade 3", "Grade 6", "Grade 10", "Original"]),
  readabilityScoreBefore: z.number(),
  readabilityScoreAfter: z.number(),
  wordDefinitions: z
    .array(
      z.object({
        word: z.string(),
        meaning: z.string(),
      })
    )
    .optional()
    .default([]),
});

export const translateSchema = z.object({
  originalText: z.string(),
  translatedText: z.string(),
  sourceLanguage: z.string().default("English"),
  targetLanguage: z.enum(["Telugu", "Hindi", "Tamil", "Kannada", "Malayalam", "English"]),
  pronunciationNotes: z.string().optional().default(""),
});

export const explainWordSchema = z.object({
  word: z.string(),
  simpleDefinition: z.string(),
  exampleSentence: z.string(),
  regionalTranslations: z.record(z.string()).optional().default({}),
});

export const snapUnderstandSchema = z.object({
  title: z.string(),
  documentType: z.string(),
  summary: z.string(),
  keyDetails: z.array(
    z.object({
      label: z.string(),
      value: z.string(),
    })
  ),
  actionItems: z.array(z.string()),
  warnings: z.array(z.string()),
  rawExtractedText: z.string(),
});

export const lectureSchema = z.object({
  title: z.string(),
  summary: z.string(),
  keyPoints: z.array(z.string()),
  glossary: z.array(
    z.object({
      term: z.string(),
      definition: z.string(),
    })
  ),
  quiz: z.array(
    z.object({
      question: z.string(),
      options: z.array(z.string()),
      correctAnswerIndex: z.number(),
      explanation: z.string(),
    })
  ),
});

export const accessibilityCheckSchema = z.object({
  overallScore: z.number(), // 0 to 100
  wcagLevel: z.enum(["A", "AA", "AAA", "Needs Improvement"]),
  summary: z.string(),
  issues: z.array(
    z.object({
      type: z.string(),
      severity: z.enum(["critical", "serious", "moderate", "minor"]),
      element: z.string(),
      issue: z.string(),
      fixSuggestion: z.string(),
    })
  ),
  passedChecks: z.array(z.string()),
});

export const urlSimplifySchema = z.object({
  title: z.string(),
  originalUrl: z.string(),
  summary: z.string(),
  keyTakeaways: z.array(z.string()),
  simplifiedContent: z.string(),
  readingLevel: z.string(),
});
