import React, { useState } from "react";
import {
  Sparkles,
  Volume2,
  Share2,
  Copy,
  RotateCcw,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Info,
} from "lucide-react";
import { aiService } from "../services/api.js";
import { useSpeechSynthesis } from "../hooks/useSpeechSynthesis.js";
import { AudioPlayerBar } from "../components/AudioPlayerBar.jsx";
import { ShareModal } from "../components/ShareModal.jsx";
import { useAbility } from "../components/AbilityProfileProvider.jsx";

const SAMPLE_TEXTS = [
  {
    label: "Government Subsidy Affidavit",
    text: "The beneficiary must furnish an affidavit attesting to indigent status prior to disbursement of subsidies.",
  },
  {
    label: "Legal Banking Clause",
    text: "Failure to remediate the outstanding delinquency within fourteen days shall result in foreclosure proceedings and subsequent lien encumbrance.",
  },
  {
    label: "Clinical Health Notice",
    text: "Administer the antipyretic pharmacological agent thrice daily postprandially to alleviate acute febrile symptoms.",
  },
];

export function TextSimplifier() {
  const { currentProfile } = useAbility();
  const [inputText, setInputText] = useState(SAMPLE_TEXTS[0].text);
  const [readingLevel, setReadingLevel] = useState("Grade 6");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  const {
    isPlaying,
    isPaused,
    currentWordIndex,
    speak,
    pause,
    resume,
    stop,
  } = useSpeechSynthesis();

  const handleSimplify = async (overrideGrade = null) => {
    if (!inputText.trim()) return;
    setLoading(true);
    setError(null);
    stop();

    try {
      const targetGrade = overrideGrade || readingLevel;
      const res = await aiService.simplify({
        text: inputText,
        readingLevel: targetGrade,
        abilityProfile: currentProfile,
      });

      if (res.success) {
        setResult(res.data);
      } else {
        setError(res.error || "Simplification failed.");
      }
    } catch (err) {
      setError(err.message || "Failed to simplify text.");
    } finally {
      setLoading(false);
    }
  };

  const handleLevelChange = (lvl) => {
    setReadingLevel(lvl);
    if (result) {
      handleSimplify(lvl);
    }
  };

  // Render text with word-by-word audio highlight
  const renderHighlightedText = (text) => {
    if (!isPlaying) return text;

    const words = text.split(/(\s+)/);
    let wordCount = 0;

    return words.map((chunk, idx) => {
      const isWord = /\S/.test(chunk);
      if (isWord) {
        const isCurrent = wordCount === currentWordIndex;
        wordCount++;
        return (
          <span
            key={idx}
            className={isCurrent ? "tts-word-highlight font-bold" : undefined}
          >
            {chunk}
          </span>
        );
      }
      return chunk;
    });
  };

  const formattedShareMessage = result
    ? `✨ *AI AccessMate — Simplified Text*\n\n*Original:* ${result.originalText}\n\n*Simplified (${result.readingLevel}):*\n${result.simplifiedText}\n\n*Readability Improvement:* ${result.readabilityScoreBefore}% ➔ ${result.readabilityScoreAfter}%\n\n⚠️ ${result.disclaimer || "AI-generated information may be incorrect. Verify using official sources."}`
    : "";

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-400/30 text-indigo-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Multi-Level Reading Engine</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            AI Text Simplifier
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Transform dense sentences into clear, plain language with live readability tracking.
          </p>
        </div>

        {/* Reading Level Selector Tabs */}
        <div
          role="radiogroup"
          aria-label="Reading Level Target"
          className="flex items-center gap-1.5 p-1.5 bg-slate-900 border border-slate-800 rounded-2xl"
        >
          {["Grade 3", "Grade 6", "Grade 10", "Original"].map((level) => {
            const isSelected = readingLevel === level;
            return (
              <button
                key={level}
                role="radio"
                aria-checked={isSelected}
                onClick={() => handleLevelChange(level)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-400 ${
                  isSelected
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {level}
              </button>
            );
          })}
        </div>
      </div>

      {/* Input Section */}
      <div className="p-6 rounded-3xl bg-slate-900 border-2 border-slate-800 card-contrast shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label htmlFor="complex-text-input" className="text-sm font-bold text-slate-200">
            Paste or type complex text to simplify:
          </label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 hidden sm:inline">Try samples:</span>
            {SAMPLE_TEXTS.map((sample, i) => (
              <button
                key={i}
                onClick={() => setInputText(sample.text)}
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 font-medium transition"
              >
                {sample.label}
              </button>
            ))}
          </div>
        </div>

        <textarea
          id="complex-text-input"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          rows={4}
          placeholder="Paste difficult official notice, legal clause, or academic text..."
          className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 text-base leading-relaxed focus:outline-none focus:border-indigo-500"
        />

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <button
            onClick={() => setInputText("")}
            className="text-xs text-slate-400 hover:text-slate-200 transition"
          >
            Clear Text
          </button>

          <button
            onClick={() => handleSimplify()}
            disabled={loading || !inputText.trim()}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/30 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-400"
          >
            <Sparkles className="w-4 h-4" />
            <span>{loading ? "Simplifying with AI..." : `Simplify to ${readingLevel}`}</span>
          </button>
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

      {/* Output Studio */}
      {result && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Readability Metrics Delta Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 card-contrast flex items-center gap-3">
              <div className="p-3 rounded-xl bg-slate-800 text-slate-400">
                <Info className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase">
                  Before Ease Score
                </span>
                <p className="text-xl font-extrabold text-slate-200">
                  {result.readabilityScoreBefore}%
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 card-contrast flex items-center gap-3">
              <div className="p-3 rounded-xl bg-emerald-950 text-emerald-400">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase">
                  After Ease Score
                </span>
                <p className="text-xl font-extrabold text-emerald-400">
                  {result.readabilityScoreAfter}%
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-700/50 card-contrast flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-indigo-300 uppercase">
                  Readability Delta
                </span>
                <p className="text-lg font-bold text-white">
                  +{(result.readabilityScoreAfter - result.readabilityScoreBefore).toFixed(1)}% Easier
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-md bg-indigo-600 text-white font-mono text-xs font-extrabold">
                {result.readingLevel}
              </span>
            </div>
          </div>

          {/* Simplified Content Card */}
          <div className="p-6 rounded-3xl bg-slate-900 border-2 border-indigo-500/60 card-contrast shadow-2xl relative overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4 mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <span>Crystal Clear Simplified Text</span>
              </h2>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => speak(result.simplifiedText)}
                  aria-label="Read simplified text aloud"
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 font-semibold text-xs border border-slate-700 transition"
                >
                  <Volume2 className="w-4 h-4 text-indigo-400" />
                  <span>Listen</span>
                </button>

                <button
                  onClick={() => setShareModalOpen(true)}
                  aria-label="Share text to WhatsApp"
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 font-semibold text-xs border border-emerald-800/60 transition"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </button>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800/80 text-lg sm:text-xl font-medium text-slate-100 leading-relaxed">
              {renderHighlightedText(result.simplifiedText)}
            </div>

            {/* Word-level definitions */}
            {result.wordDefinitions && result.wordDefinitions.length > 0 && (
              <div className="mt-6 pt-5 border-t border-slate-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  <span>Word-Level Definitions & Clarifications</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {result.wordDefinitions.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-slate-950 border border-slate-800"
                    >
                      <span className="text-xs font-extrabold text-amber-300 block mb-1">
                        {item.word}
                      </span>
                      <p className="text-xs text-slate-300 leading-normal">
                        {item.meaning}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <div className="mt-6 pt-4 border-t border-slate-900 text-center">
              <p className="text-xs text-slate-400">
                ⚠️ {result.disclaimer}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Audio Controller Bar */}
      {result && (
        <AudioPlayerBar
          isPlaying={isPlaying}
          isPaused={isPaused}
          onPlay={speak}
          onPause={pause}
          onResume={resume}
          onStop={stop}
          textToRead={result.simplifiedText}
          title="Narrating Simplified Text"
        />
      )}

      {/* WhatsApp Share Modal */}
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        title="Share Simplified Text via WhatsApp"
        formattedText={formattedShareMessage}
      />
    </div>
  );
}
