import axios from "axios";
import * as cheerio from "cheerio";
import { z } from "zod";
import { db } from "../database/db.js";
import { validateUrlForSsrf } from "../middleware/ssrfGuard.js";
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
import {
  scamCheckSchema,
  documentNavigatorSchema,
  simplifySchema,
  translateSchema,
  explainWordSchema,
  snapUnderstandSchema,
  lectureSchema,
  accessibilityCheckSchema,
  urlSimplifySchema,
} from "../validators/aiValidators.js";

// Helper to save user history safely
async function recordHistory(req, feature, inputPayload, outputPayload) {
  if (req.user && req.user.id) {
    try {
      await db.addHistory({
        userId: req.user.id,
        feature,
        input_payload: inputPayload,
        output_payload: outputPayload,
      });
    } catch (err) {
      console.warn("Could not save history entry:", err.message);
    }
  }
}

// 1. Text Simplifier
export async function handleSimplify(req, res) {
  try {
    const inputSchema = z.object({
      text: z.string().min(1, "Text is required to simplify."),
      readingLevel: z.enum(["Grade 3", "Grade 6", "Grade 10", "Original"]).default("Grade 6"),
      abilityProfile: z.string().optional().default("default"),
    });

    const validatedInput = inputSchema.parse(req.body);

    const result = await simplifyText({
      text: validatedInput.text,
      targetGrade: validatedInput.readingLevel,
      abilityProfile: validatedInput.abilityProfile,
    });

    // Enforce Zod schema validation
    const parsedOutput = simplifySchema.safeParse(result);
    const finalPayload = parsedOutput.success ? parsedOutput.data : result;

    await recordHistory(req, "simplifier", validatedInput.text, finalPayload);

    return res.json({
      success: true,
      data: finalPayload,
      disclaimer: result.disclaimer,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: err.errors.map((e) => e.message).join(", ") });
    }
    console.error("Simplify error:", err);
    return res.status(500).json({ success: false, error: "Failed to simplify content." });
  }
}

// 2. Multi-Language Translator
export async function handleTranslate(req, res) {
  try {
    const inputSchema = z.object({
      text: z.string().min(1, "Text is required for translation."),
      targetLanguage: z.enum(["Telugu", "Hindi", "Tamil", "Kannada", "Malayalam", "English"]).default("Telugu"),
      sourceLanguage: z.string().default("English"),
    });

    const validatedInput = inputSchema.parse(req.body);

    const result = await translateContent({
      text: validatedInput.text,
      targetLanguage: validatedInput.targetLanguage,
      sourceLanguage: validatedInput.sourceLanguage,
    });

    const parsedOutput = translateSchema.safeParse(result);
    const finalPayload = parsedOutput.success ? parsedOutput.data : result;

    await recordHistory(req, "translator", validatedInput.text, finalPayload);

    return res.json({
      success: true,
      data: finalPayload,
      disclaimer: result.disclaimer,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: err.errors.map((e) => e.message).join(", ") });
    }
    console.error("Translate error:", err);
    return res.status(500).json({ success: false, error: "Failed to translate text." });
  }
}

// 3. Document Navigator
export async function handleDocument(req, res) {
  try {
    const inputSchema = z.object({
      documentText: z.string().min(5, "Document text is required."),
      userLanguage: z.string().default("English"),
    });

    const validatedInput = inputSchema.parse(req.body);

    const result = await parseDocument({
      documentText: validatedInput.documentText,
      userLanguage: validatedInput.userLanguage,
    });

    const parsedOutput = documentNavigatorSchema.safeParse(result);
    const finalPayload = parsedOutput.success ? parsedOutput.data : result;

    await recordHistory(req, "documents", validatedInput.documentText, finalPayload);

    return res.json({
      success: true,
      data: finalPayload,
      disclaimer: result.disclaimer,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: err.errors.map((e) => e.message).join(", ") });
    }
    console.error("Document parser error:", err);
    return res.status(500).json({ success: false, error: "Failed to parse document." });
  }
}

// 4. Scam & Risk Guard
export async function handleScamCheck(req, res) {
  try {
    const inputSchema = z.object({
      message: z.string().min(2, "Message is required to analyze."),
      context: z.string().optional().default("general"),
    });

    const validatedInput = inputSchema.parse(req.body);

    const result = await analyzeScamRisk({
      message: validatedInput.message,
      context: validatedInput.context,
    });

    const parsedOutput = scamCheckSchema.safeParse(result);
    const finalPayload = parsedOutput.success ? parsedOutput.data : result;

    await recordHistory(req, "scam-guard", validatedInput.message, finalPayload);

    return res.json({
      success: true,
      data: finalPayload,
      disclaimer: result.disclaimer,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: err.errors.map((e) => e.message).join(", ") });
    }
    console.error("Scam check error:", err);
    return res.status(500).json({ success: false, error: "Failed to check message risk." });
  }
}

// 5. Snap & Understand (Vision)
export async function handleImageAnalysis(req, res) {
  try {
    let imageBase64 = req.body.imageBase64;
    let mimeType = req.body.mimeType || "image/jpeg";
    const promptNotes = req.body.notes || "";

    if (req.file) {
      imageBase64 = req.file.buffer.toString("base64");
      mimeType = req.file.mimetype;
    }

    if (!imageBase64) {
      return res.status(400).json({
        success: false,
        error: "Image data (base64 string or file upload) is required.",
      });
    }

    const result = await analyzeImageContent({
      imageBase64,
      mimeType,
      userPrompt: promptNotes,
    });

    const parsedOutput = snapUnderstandSchema.safeParse(result);
    const finalPayload = parsedOutput.success ? parsedOutput.data : result;

    await recordHistory(req, "snap", `Image snapshot (${result.documentType || "upload"})`, finalPayload);

    return res.json({
      success: true,
      data: finalPayload,
      disclaimer: result.disclaimer,
    });
  } catch (err) {
    console.error("Image analysis error:", err);
    return res.status(500).json({ success: false, error: "Failed to analyze image content." });
  }
}

// 6. Lecture & Video Helper
export async function handleLecture(req, res) {
  try {
    const inputSchema = z.object({
      transcriptOrNotes: z.string().min(5, "Lecture transcript or notes required."),
      subject: z.string().optional().default("General Studies"),
    });

    const validatedInput = inputSchema.parse(req.body);

    const result = await processLectureContent({
      transcriptOrNotes: validatedInput.transcriptOrNotes,
      subject: validatedInput.subject,
    });

    const parsedOutput = lectureSchema.safeParse(result);
    const finalPayload = parsedOutput.success ? parsedOutput.data : result;

    await recordHistory(req, "lecture", validatedInput.transcriptOrNotes.slice(0, 200), finalPayload);

    return res.json({
      success: true,
      data: finalPayload,
      disclaimer: result.disclaimer,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: err.errors.map((e) => e.message).join(", ") });
    }
    console.error("Lecture helper error:", err);
    return res.status(500).json({ success: false, error: "Failed to process lecture notes." });
  }
}

// 7. Accessibility Checker for Creators
export async function handleAccessibilityCheck(req, res) {
  try {
    const inputSchema = z.object({
      htmlOrContent: z.string().min(1, "HTML or text content is required for audit."),
      contentType: z.enum(["html", "text", "markdown"]).default("html"),
    });

    const validatedInput = inputSchema.parse(req.body);

    const result = await auditAccessibility({
      htmlOrContent: validatedInput.htmlOrContent,
      contentType: validatedInput.contentType,
    });

    const parsedOutput = accessibilityCheckSchema.safeParse(result);
    const finalPayload = parsedOutput.success ? parsedOutput.data : result;

    await recordHistory(req, "accessibility-checker", validatedInput.htmlOrContent.slice(0, 200), finalPayload);

    return res.json({
      success: true,
      data: finalPayload,
      disclaimer: result.disclaimer,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: err.errors.map((e) => e.message).join(", ") });
    }
    console.error("Accessibility check error:", err);
    return res.status(500).json({ success: false, error: "Failed to run accessibility audit." });
  }
}

// 8. Explain Word
export async function handleExplainWord(req, res) {
  try {
    const inputSchema = z.object({
      word: z.string().min(1, "Word is required."),
      context: z.string().optional().default(""),
      targetLanguage: z.string().optional().default("Telugu"),
    });

    const validatedInput = inputSchema.parse(req.body);

    const result = await explainWord({
      word: validatedInput.word,
      context: validatedInput.context,
      targetLanguage: validatedInput.targetLanguage,
    });

    const parsedOutput = explainWordSchema.safeParse(result);
    const finalPayload = parsedOutput.success ? parsedOutput.data : result;

    await recordHistory(req, "explain-word", validatedInput.word, finalPayload);

    return res.json({
      success: true,
      data: finalPayload,
      disclaimer: result.disclaimer,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: err.errors.map((e) => e.message).join(", ") });
    }
    console.error("Explain word error:", err);
    return res.status(500).json({ success: false, error: "Failed to explain word." });
  }
}

// 9. Website / URL Simplifier with SSRF Guard
export async function handleUrlSimplify(req, res) {
  try {
    const inputSchema = z.object({
      url: z.string().url("Valid URL is required."),
      readingLevel: z.string().default("Grade 6"),
    });

    const validatedInput = inputSchema.parse(req.body);

    // Strict SSRF validation
    const safeUrl = await validateUrlForSsrf(validatedInput.url);

    // Fetch page with strict timeout and headers
    const response = await axios.get(safeUrl, {
      timeout: 7000,
      maxContentLength: 5 * 1024 * 1024, // 5MB limit
      headers: {
        "User-Agent": "AI-AccessMate-Bot/1.0 (+https://accessmate.ai/bot-info)",
        Accept: "text/html,application/xhtml+xml",
      },
    });

    const html = response.data;
    const $ = cheerio.load(html);

    // Remove script, style, nav, footer clutter
    $("script, style, noscript, nav, footer, header, svg, iframe").remove();

    const title = $("title").text().trim() || $("h1").first().text().trim() || "Web Page Summary";
    const paragraphs = $("p, article")
      .map((i, el) => $(el).text().trim())
      .get()
      .filter((p) => p.length > 30)
      .slice(0, 15)
      .join("\n\n");

    const extractedText = paragraphs || $("body").text().replace(/\s+/g, " ").trim().slice(0, 3000);

    // Simplify the extracted content
    const simplifiedResult = await simplifyText({
      text: extractedText.slice(0, 2000),
      targetGrade: validatedInput.readingLevel,
    });

    const keyTakeaways = simplifiedResult.simplifiedText
      .split(". ")
      .slice(0, 4)
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      title,
      originalUrl: safeUrl,
      summary: `Accessible breakdown of content extracted from ${safeUrl}`,
      keyTakeaways: keyTakeaways.length > 0 ? keyTakeaways : ["Key summary points extracted cleanly."],
      simplifiedContent: simplifiedResult.simplifiedText,
      readingLevel: validatedInput.readingLevel,
    };

    const parsedOutput = urlSimplifySchema.safeParse(payload);
    const finalPayload = parsedOutput.success ? parsedOutput.data : payload;

    await recordHistory(req, "url-simplifier", safeUrl, finalPayload);

    return res.json({
      success: true,
      data: finalPayload,
      disclaimer: simplifiedResult.disclaimer,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: err.errors.map((e) => e.message).join(", ") });
    }
    console.error("URL simplify error:", err.message);
    return res.status(400).json({
      success: false,
      error: `Could not securely fetch or simplify URL: ${err.message}`,
    });
  }
}

// 10. Contextual Q&A (/api/ai/ask)
export async function handleAsk(req, res) {
  try {
    const inputSchema = z.object({
      question: z.string().min(1, "Question is required."),
      context: z.string().min(1, "Context is required."),
      userProfile: z.string().optional().default("default"),
    });

    const validatedInput = inputSchema.parse(req.body);

    const result = await answerContextualQuestion({
      question: validatedInput.question,
      context: validatedInput.context,
      userProfile: validatedInput.userProfile,
    });

    await recordHistory(req, "ask-qa", `${validatedInput.question} | Context length: ${validatedInput.context.length}`, result);

    return res.json({
      success: true,
      data: result,
      disclaimer: result.disclaimer,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: err.errors.map((e) => e.message).join(", ") });
    }
    console.error("Ask Q&A error:", err);
    return res.status(500).json({ success: false, error: "Failed to answer question." });
  }
}
