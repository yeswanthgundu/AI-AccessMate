import React, { useState } from "react";
import { Globe, Sparkles, Volume2, Share2, ShieldCheck, ExternalLink, ArrowRight } from "lucide-react";
import { aiService } from "../services/api.js";
import { AudioPlayerBar } from "../components/AudioPlayerBar.jsx";
import { ShareModal } from "../components/ShareModal.jsx";
import { useSpeechSynthesis } from "../hooks/useSpeechSynthesis.js";

const SAMPLE_URLS = [
  "https://en.wikipedia.org/wiki/Web_Content_Accessibility_Guidelines",
  "https://developer.mozilla.org/en-US/docs/Web/Accessibility",
];

export function UrlSimplifier() {
  const [url, setUrl] = useState(SAMPLE_URLS[0]);
  const [readingLevel, setReadingLevel] = useState("Grade 6");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  const { isPlaying, isPaused, speak, pause, resume, stop } = useSpeechSynthesis();

  const handleFetch = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    stop();

    try {
      const res = await aiService.urlSimplify({
        url,
        readingLevel,
      });

      if (res.success) {
        setResult(res.data);
      } else {
        setError(res.error || "Failed to simplify web page.");
      }
    } catch (err) {
      setError(err.message || "Could not fetch or simplify URL.");
    } finally {
      setLoading(false);
    }
  };

  const formattedShareMessage = result
    ? `🌐 *AI AccessMate — Webpage Breakdown*\n\n*${result.title}*\nURL: ${result.originalUrl}\n\n*Summary:* ${result.summary}\n\n*Key Takeaways:*\n${result.keyTakeaways?.map((t) => `• ${t}`).join("\n")}\n\n*Content:* ${result.simplifiedContent}\n\n⚠️ ${result.disclaimer || "AI-generated information may be incorrect. Verify using official sources."}`
    : "";

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-semibold mb-2">
          <Globe className="w-3.5 h-3.5" />
          <span>SSRF-Protected Web Ingestion</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Website & Article Simplifier
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Extract text from any public article or government portal without popups, ads, or dense jargon.
        </p>
      </div>

      {/* Input Box */}
      <div className="p-6 rounded-3xl bg-slate-900 border-2 border-slate-800 card-contrast shadow-xl space-y-4">
        <label htmlFor="url-input" className="block text-sm font-bold text-slate-200">
          Enter Public Web Page URL (http/https):
        </label>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Globe className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="url-input"
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/article"
              className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <button
            onClick={handleFetch}
            disabled={loading || !url.trim()}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold rounded-2xl shadow-lg transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-400 flex-shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            <span>{loading ? "Fetching & Simplifying..." : "Simplify Page"}</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-1">
          <span className="flex items-center gap-1 text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            SSRF Prevention Active: Internal IP addresses & metadata ports blocked.
          </span>
          <div className="flex items-center gap-2">
            <span>Sample:</span>
            <button
              onClick={() => setUrl(SAMPLE_URLS[0])}
              className="text-cyan-400 hover:underline"
            >
              Wikipedia WCAG
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="p-4 rounded-2xl bg-rose-950/80 border-2 border-rose-500 text-rose-200 text-sm font-medium"
        >
          {error}
        </div>
      )}

      {/* Result Display */}
      {result && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="p-6 rounded-3xl bg-slate-900 border-2 border-slate-800 card-contrast shadow-xl space-y-4">
            <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                  Simplified Web Breakdown
                </span>
                <h2 className="text-xl font-bold text-white mt-1">{result.title}</h2>
                <a
                  href={result.originalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-slate-400 hover:text-cyan-300 flex items-center gap-1 mt-1 truncate max-w-md"
                >
                  <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{result.originalUrl}</span>
                </a>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => speak(`${result.title}. ${result.simplifiedContent}`)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold flex items-center gap-1 border border-slate-700"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>Listen</span>
                </button>
                <button
                  onClick={() => setShareModalOpen(true)}
                  className="p-2 rounded-xl bg-emerald-950 hover:bg-emerald-900 text-emerald-300 text-xs font-semibold flex items-center gap-1 border border-emerald-800"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </button>
              </div>
            </div>

            {/* Key Takeaways */}
            {result.keyTakeaways && result.keyTakeaways.length > 0 && (
              <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-800/40">
                <span className="text-xs font-bold uppercase text-cyan-300 block mb-2">
                  Key Takeaways
                </span>
                <ul className="list-disc list-inside space-y-1 text-sm text-slate-200">
                  {result.keyTakeaways.map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Content */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 text-base sm:text-lg text-slate-100 leading-relaxed font-sans">
              {result.simplifiedContent}
            </div>

            <p className="text-xs text-slate-400 text-center">⚠️ {result.disclaimer}</p>
          </div>
        </div>
      )}

      {result && (
        <AudioPlayerBar
          isPlaying={isPlaying}
          isPaused={isPaused}
          onPlay={speak}
          onPause={pause}
          onResume={resume}
          onStop={stop}
          textToRead={`${result.title}. ${result.simplifiedContent}`}
          title="Narrating Web Article"
        />
      )}

      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        title="Share Webpage Summary via WhatsApp"
        formattedText={formattedShareMessage}
      />
    </div>
  );
}
