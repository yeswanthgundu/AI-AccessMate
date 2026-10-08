import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import { db } from "./database/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: "*", // allow all origins for dev / local / preview
    credentials: true,
  })
);
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

// Request logging in development
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (req.originalUrl.startsWith("/api")) {
      console.log(`[${req.method}] ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// Health & Diagnostic Endpoint
app.get("/api/health", async (req, res) => {
  const supabaseConnected = await db.isSupabaseConnected();
  res.json({
    status: "ok",
    service: "AI AccessMate Backend API",
    version: "1.0.0",
    database: supabaseConnected ? "Supabase Cloud PostgreSQL" : "Local PostgreSQL/Store Fallback",
    supabaseConfigured: Boolean(process.env.SUPABASE_URL),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "your_gemini_api_key_here"),
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes (supporting both /api/* standard and /* fallback)
app.use("/api/auth", authRoutes);
app.use("/auth", authRoutes);

app.use("/api/user", userRoutes);
app.use("/user", userRoutes);

app.use("/api/history", userRoutes);
app.use("/history", userRoutes);

app.use("/api/ai", aiRoutes);
app.use("/ai", aiRoutes);

// Serve client static build if present (Unified Full-Stack Deployment / Render)
const clientDistPath = path.resolve(__dirname, "../client/dist");
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get("*", (req, res, next) => {
    if (
      req.originalUrl.startsWith("/api") ||
      req.originalUrl.startsWith("/ai") ||
      req.originalUrl.startsWith("/auth") ||
      req.originalUrl.startsWith("/user") ||
      req.originalUrl.startsWith("/history")
    ) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, "index.html"));
  });
} else {
  // Root route fallback when client is served by dev server
  app.get("/", (req, res) => {
    res.json({
      message: "AI AccessMate API Server is operational.",
      documentation: "/api/health",
    });
  });
}

// Global 404 Handler for API routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `API route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Centralized Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled Server Error:", err);
  res.status(500).json({
    success: false,
    error: err.message || "Internal server error occurred.",
  });
});

// Start Server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`\n======================================================`);
  console.log(`🚀 AI AccessMate Server running on http://localhost:${PORT}`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`======================================================\n`);
});

export default app;
