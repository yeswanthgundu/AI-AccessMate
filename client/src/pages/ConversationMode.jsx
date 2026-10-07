import React, { useState } from "react";
import {
  Headphones,
  Mic,
  MicOff,
  Sparkles,
  RotateCcw,
  Copy,
  Check,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition.js";
import { aiService } from "../services/api.js";
import { useAbility } from "../components/AbilityProfileProvider.jsx";

export function ConversationMode() {
  const { preferredLanguage } = useAbility();
  const {
    isSupported,
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition();

  const [simplifiedVersion, setSimplifiedVersion] = useState(null);
  const [simplifying, setSimplifying] = useState(false);
  const [copied, setCopied] = useState(false);

  const fullText = (transcript + " " + interimTranscript).trim();

  const handleSimplifyConversation = async () => {
    if (!fullText) return;
    setSimplifying(true);
    try {
      const res = await aiService.simplify({
        text: fullText,
        readingLevel: "Grade 3",
        abilityProfile: "deaf",
      });
      if (res.success) {
        setSimplifiedVersion(res.data);
      }
    } catch (err) {
      console.warn("Failed to simplify live conversation:", err.message);
    } finally {
      setSimplifying(false);
    }
  };

  const handleCopy = () => {
    if (!fullText) return;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 text-xs font-semibold mb-2">
            <VolumeX className="w-3.5 h-3.5" />
            <span>Deaf & Hard-of-Hearing Captioning Suite</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Live Conversation Captions
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time speech transcription captions with instant one-tap plain-language simplification.
          </p>
        </div>

        {/* Mic toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (isListening) stopListening();
              else startListening();
            }}
            disabled={!isSupported}
            aria-pressed={isListening}
            aria-label={isListening ? "Stop listening" : "Start real-time captions"}
            className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl font-bold text-sm shadow-xl transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-400 ${
              isListening
                ? "bg-rose-600 hover:bg-rose-500 text-white animate-pulse shadow-rose-950"
                : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-950"
            }`}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            <span>{isListening ? "Stop Captions" : "Start Live Captions"}</span>
          </button>
        </div>
      </div>

      {!isSupported && (
        <div
          role="alert"
          className="p-4 rounded-2xl bg-amber-950/80 border-2 border-amber-500 text-amber-200 text-sm font-medium"
        >
          Speech recognition is not natively supported in this browser. Please use Chrome, Edge, or Safari with microphone permissions enabled.
        </div>
      )}

      {/* Live Captioning Display Board */}
      <div className="p-8 rounded-3xl bg-slate-900 border-2 border-slate-800 card-contrast shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-3.5 h-3.5 rounded-full ${
                isListening ? "bg-emerald-400 animate-ping" : "bg-slate-600"
              }`}
            />
            <span className="text-sm font-bold text-slate-200">
              {isListening ? "Microphone Active • Listening..." : "Microphone Idle"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {fullText && (
              <>
                <button
                  onClick={handleCopy}
                  aria-label="Copy transcript"
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1.5 transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>

                <button
                  onClick={resetTranscript}
                  aria-label="Clear transcript"
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1.5 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Big Live Captions Box */}
        <div className="min-h-[220px] p-6 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
          <div className="text-xl sm:text-2xl font-semibold text-slate-100 leading-relaxed font-sans">
            {fullText ? (
              <>
                <span>{transcript}</span>
                <span className="text-indigo-400 italic"> {interimTranscript}</span>
              </>
            ) : (
              <span className="text-slate-500 italic text-lg">
                Captions will stream here in real-time as words are spoken. Click "Start Live Captions" above.
              </span>
            )}
          </div>

          {isListening && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-900 text-xs text-indigo-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              <span>Transcribing live speech ({preferredLanguage})...</span>
            </div>
          )}
        </div>

        {/* One-Tap Simplify Button */}
        {fullText && (
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-slate-400">
              Is the spoken conversation fast or confusing?
            </span>

            <button
              onClick={handleSimplifyConversation}
              disabled={simplifying}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-indigo-950 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-400"
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {simplifying ? "Simplifying..." : "One-Tap: Simplify What Was Said"}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Simplified Conversation Breakdown */}
      {simplifiedVersion && (
        <div className="p-6 rounded-3xl bg-slate-900 border-2 border-indigo-500/60 card-contrast shadow-2xl space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              Plain-Language Breakdown (Grade 3)
            </span>
            <span className="text-xs text-emerald-400 font-bold">
              Ease: {simplifiedVersion.readabilityScoreAfter}%
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-lg font-medium text-slate-100 leading-relaxed">
            {simplifiedVersion.simplifiedText}
          </div>

          <p className="text-xs text-slate-400 text-center">
            ⚠️ {simplifiedVersion.disclaimer}
          </p>
        </div>
      )}
    </div>
  );
}
