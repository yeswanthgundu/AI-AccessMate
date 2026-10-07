import React, { useState } from "react";
import {
  Languages,
  ArrowRightLeft,
  Volume2,
  Copy,
  Check,
  Share2,
  Sparkles,
} from "lucide-react";
import { aiService } from "../services/api.js";
import { useSpeechSynthesis } from "../hooks/useSpeechSynthesis.js";
import { AudioPlayerBar } from "../components/AudioPlayerBar.jsx";
import { ShareModal } from "../components/ShareModal.jsx";
import { useAbility } from "../components/AbilityProfileProvider.jsx";

const REGIONAL_LANGUAGES = [
  "Telugu",
  "Hindi",
  "Tamil",
  "Kannada",
  "Malayalam",
  "English",
];

const PRESET_QUERIES = [
  "Your scholarship application has been verified. Please submit your identity documents by Friday.",
  "See it. Understand it. Decide what to do. Hear it. Act on it.",
  "The clinic is closed on Sunday. For emergency assistance call 108.",
  "Electricity bill payment is due next week. Do not share your OTP with anyone.",
];

export function Translator() {
  const { preferredLanguage, setPreferredLanguage } = useAbility();

  const [sourceLanguage, setSourceLanguage] = useState("English");
  const [targetLanguage, setTargetLanguage] = useState(
    preferredLanguage !== "English" ? preferredLanguage : "Telugu"
  );
  const [inputText, setInputText] = useState(PRESET_QUERIES[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  const {
    isPlaying,
    isPaused,
    speak,
    pause,
    resume,
    stop,
  } = useSpeechSynthesis();

  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setError(null);
    stop();

    try {
      const res = await aiService.translate({
        text: inputText,
        targetLanguage,
        sourceLanguage,
      });

      if (res.success) {
        setResult(res.data);
      } else {
        setError(res.error || "Translation failed.");
      }
    } catch (err) {
      setError(err.message || "Failed to translate content.");
    } finally {
      setLoading(false);
    }
  };

  const handleSwap = () => {
    setSourceLanguage(targetLanguage);
    setTargetLanguage(sourceLanguage);
    if (result) {
      setInputText(result.translatedText);
      setResult(null);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedShareMessage = result
    ? `🌐 *AI AccessMate — Regional Translation*\n\n*Original (${sourceLanguage}):*\n${result.originalText}\n\n*Translation (${targetLanguage}):*\n${result.translatedText}\n\n⚠️ ${result.disclaimer || "AI-generated information may be incorrect. Verify using official sources."}`
    : "";

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 text-xs font-semibold mb-2">
          <Languages className="w-3.5 h-3.5" />
          <span>Regional Linguistic Inclusion Workbench</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Multi-Language Regional Translator
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Accurate context-preserving translation into Telugu, Hindi, Tamil, Kannada, Malayalam, and English with audio narration.
        </p>
      </div>

      {/* Language Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border-2 border-slate-800 card-contrast flex flex-wrap items-center justify-between gap-4">
        {/* Source Language */}
        <div className="flex items-center gap-2">
          <label htmlFor="source-lang-select" className="text-xs font-bold text-slate-400 uppercase">
            From:
          </label>
          <select
            id="source-lang-select"
            value={sourceLanguage}
            onChange={(e) => setSourceLanguage(e.target.value)}
            className="p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm font-semibold text-white focus:outline-none focus:border-indigo-500"
          >
            {REGIONAL_LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </div>

        {/* Swap Button */}
        <button
          onClick={handleSwap}
          aria-label="Swap source and target languages"
          className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition border border-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-400"
        >
          <ArrowRightLeft className="w-4 h-4" />
        </button>

        {/* Target Language */}
        <div className="flex items-center gap-2">
          <label htmlFor="target-lang-select" className="text-xs font-bold text-slate-400 uppercase">
            To:
          </label>
          <select
            id="target-lang-select"
            value={targetLanguage}
            onChange={(e) => {
              setTargetLanguage(e.target.value);
              setPreferredLanguage(e.target.value);
            }}
            className="p-2.5 rounded-xl bg-slate-950 border border-emerald-500/50 text-sm font-semibold text-emerald-300 focus:outline-none"
          >
            {REGIONAL_LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Side-by-Side Translate Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Source Box */}
        <div className="p-6 rounded-3xl bg-slate-900 border-2 border-slate-800 card-contrast shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-200">{sourceLanguage} Content:</span>
            <button
              onClick={() => speak(inputText)}
              aria-label="Listen to source text"
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs flex items-center gap-1"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Listen</span>
            </button>
          </div>

          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={7}
            placeholder={`Enter text in ${sourceLanguage}...`}
            className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-800 text-slate-100 text-base leading-relaxed focus:outline-none focus:border-indigo-500"
          />

          {/* Quick presets */}
          <div>
            <span className="text-xs text-slate-400 block mb-2">Quick Presets:</span>
            <div className="flex flex-wrap gap-2">
              {PRESET_QUERIES.map((p, i) => (
                <button
                  key={i}
                  onClick={() => setInputText(p)}
                  className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition truncate max-w-[200px]"
                >
                  Preset {i + 1}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleTranslate}
              disabled={loading || !inputText.trim()}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-2xl shadow-lg shadow-emerald-950 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-400"
            >
              <Languages className="w-4 h-4" />
              <span>{loading ? "Translating..." : `Translate into ${targetLanguage}`}</span>
            </button>
          </div>
        </div>

        {/* Target Box */}
        <div className="p-6 rounded-3xl bg-slate-900 border-2 border-slate-800 card-contrast shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-emerald-400">
              {targetLanguage} Output:
            </span>

            {result && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => speak(result.translatedText)}
                  aria-label="Listen to translated audio"
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs flex items-center gap-1"
                >
                  <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Listen</span>
                </button>

                <button
                  onClick={handleCopy}
                  aria-label="Copy translation"
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs flex items-center gap-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>

                <button
                  onClick={() => setShareModalOpen(true)}
                  aria-label="Share translation to WhatsApp"
                  className="p-1.5 rounded-lg bg-emerald-950 text-emerald-300 hover:bg-emerald-900 text-xs flex items-center gap-1"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share</span>
                </button>
              </div>
            )}
          </div>

          <div className="min-h-[175px] p-4 rounded-2xl bg-slate-950 border border-slate-800 text-slate-100 text-base sm:text-lg leading-relaxed flex items-start">
            {loading ? (
              <div className="flex items-center gap-3 text-slate-400 italic">
                <Sparkles className="w-5 h-5 text-emerald-400 animate-spin" />
                <span>Generating accessible regional translation...</span>
              </div>
            ) : result ? (
              <div className="w-full">
                <p className="font-medium text-slate-100">{result.translatedText}</p>
                {result.pronunciationNotes && (
                  <p className="mt-4 pt-3 border-t border-slate-900 text-xs text-slate-400 italic">
                    ℹ️ {result.pronunciationNotes}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-slate-500 italic">
                Translated text will appear here. Choose target language and click Translate.
              </p>
            )}
          </div>

          {result && (
            <div className="pt-2">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <p className="text-xs text-slate-400">
                  ⚠️ {result.disclaimer}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Audio Narrator Bar */}
      {result && (
        <AudioPlayerBar
          isPlaying={isPlaying}
          isPaused={isPaused}
          onPlay={speak}
          onPause={pause}
          onResume={resume}
          onStop={stop}
          textToRead={result.translatedText}
          title={`Narrating in ${targetLanguage}`}
        />
      )}

      {/* Share Modal */}
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        title="Share Regional Translation via WhatsApp"
        formattedText={formattedShareMessage}
      />
    </div>
  );
}
