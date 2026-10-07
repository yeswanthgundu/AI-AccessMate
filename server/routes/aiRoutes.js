import { Router } from "express";
import multer from "multer";
import jwt from "jsonwebtoken";
import {
  handleSimplify,
  handleTranslate,
  handleDocument,
  handleScamCheck,
  handleImageAnalysis,
  handleLecture,
  handleAccessibilityCheck,
  handleExplainWord,
  handleUrlSimplify,
  handleAsk,
} from "../controllers/aiController.js";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

const JWT_SECRET = process.env.JWT_SECRET || "accessmate_super_secret_jwt_key_2026_secure!";

// Optional auth middleware so logged-in users get their history automatically recorded
function optionalAuth(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token) {
    try {
      req.user = jwt.verify(token, JWT_SECRET);
    } catch {
      // Ignore invalid token for optional endpoints
    }
  }
  next();
}

router.use(optionalAuth);

// 1. Text Simplifier
router.post("/simplify", handleSimplify);

// 2. Multi-Language Translator
router.post("/translate", handleTranslate);

// 3. Document Navigator
router.post("/document", handleDocument);

// 4. Scam & Risk Guard
router.post("/scam-check", handleScamCheck);

// 5. Snap & Understand (Vision)
router.post("/image", upload.single("image"), handleImageAnalysis);

// 6. Lecture & Video Helper
router.post("/lecture", handleLecture);

// 7. Accessibility Checker for Creators
router.post("/accessibility-check", handleAccessibilityCheck);

// 8. Explain Word Glossary
router.post("/explain-word", handleExplainWord);

// 9. Website / URL Simplifier
router.post("/url", handleUrlSimplify);

// 10. Contextual Q&A
router.post("/ask", handleAsk);

export default router;
