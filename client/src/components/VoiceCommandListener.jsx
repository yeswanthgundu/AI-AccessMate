import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mic, MicOff, Command, Sparkles, X } from "lucide-react";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition.js";

export function VoiceCommandListener({ onReadAloud = null }) {
  const navigate = useNavigate();
  const {
    isSupported,
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition();

  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    const text = (transcript + " " + interimTranscript).toLowerCase().trim();
    if (!text) return;

    if (text.includes("simplify") || text.includes("simplify text")) {
      setFeedback("Navigating to AI Text Simplifier...");
      setTimeout(() => {
        navigate("/simplifier");
        resetTranscript();
        setIsOpen(false);
      }, 700);
    } else if (text.includes("translate")) {
      setFeedback("Navigating to Multi-Language Translator...");
      setTimeout(() => {
        navigate("/translator");
        resetTranscript();
        setIsOpen(false);
      }, 700);
    } else if (text.includes("check this message") || text.includes("scam") || text.includes("fraud")) {
      setFeedback("Navigating to Scam & Risk Guard...");
      setTimeout(() => {
        navigate("/scam-guard");
        resetTranscript();
        setIsOpen(false);
      }, 700);
    } else if (text.includes("document") || text.includes("form") || text.includes("navigator")) {
      setFeedback("Navigating to Document Navigator...");
      setTimeout(() => {
        navigate("/documents");
        resetTranscript();
        setIsOpen(false);
      }, 700);
    } else if (text.includes("snap") || text.includes("camera") || text.includes("image")) {
      setFeedback("Navigating to Snap & Understand...");
      setTimeout(() => {
        navigate("/snap");
        resetTranscript();
        setIsOpen(false);
      }, 700);
    } else if (text.includes("lecture") || text.includes("study") || text.includes("quiz")) {
      setFeedback("Navigating to Lecture Helper...");
      setTimeout(() => {
        navigate("/lecture");
        resetTranscript();
        setIsOpen(false);
      }, 700);
    } else if (text.includes("conversation") || text.includes("caption") || text.includes("listen")) {
      setFeedback("Navigating to Conversation Mode...");
      setTimeout(() => {
        navigate("/conversation");
        resetTranscript();
        setIsOpen(false);
      }, 700);
    } else if (text.includes("accessibility checker") || text.includes("check html") || text.includes("audit")) {
      setFeedback("Navigating to Accessibility Checker...");
      setTimeout(() => {
        navigate("/accessibility-checker");
        resetTranscript();
        setIsOpen(false);
      }, 700);
    } else if (text.includes("settings") || text.includes("preferences")) {
      setFeedback("Navigating to Settings...");
      setTimeout(() => {
        navigate("/settings");
        resetTranscript();
        setIsOpen(false);
      }, 700);
    } else if (text.includes("read aloud") && onReadAloud) {
      setFeedback("Reading content aloud...");
      onReadAloud();
      resetTranscript();
      setTimeout(() => setIsOpen(false), 1000);
    }
  }, [transcript, interimTranscript, navigate, onReadAloud, resetTranscript]);

  if (!isSupported) return null;

  return (
    <>
      {/* Floating activation button */}
      <div className="fixed bottom-24 right-4 md:right-8 z-40">
        <button
          onClick={() => {
            if (isOpen) {
              stopListening();
              setIsOpen(false);
            } else {
              setIsOpen(true);
              startListening();
            }
          }}
          aria-label={isListening ? "Voice commands active. Click to stop." : "Activate hands-free voice commands"}
          aria-expanded={isOpen}
          className={`relative p-3.5 rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center focus-visible:outline focus-visible:outline-4 focus-visible:outline-yellow-400 ${
            isListening
              ? "bg-rose-600 text-white animate-pulse shadow-rose-600/50"
              : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/40 hover:scale-105"
          }`}
        >
          {isListening ? (
            <Mic className="w-6 h-6 animate-bounce" />
          ) : (
            <Mic className="w-6 h-6" />
          )}
          <span className="sr-only">Voice Commands</span>
        </button>
      </div>

      {/* Modal / Overlay when listening */}
      {isOpen && (
        <div
          role="region"
          aria-label="Voice command assistant status"
          className="fixed bottom-40 right-4 md:right-8 z-50 w-80 md:w-96 bg-slate-900/95 border-2 border-indigo-500/80 backdrop-blur-md rounded-2xl p-5 shadow-2xl card-contrast animate-in fade-in slide-in-from-bottom-4 duration-200"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Hands-Free Voice Commands
              </span>
            </div>
            <button
              onClick={() => {
                stopListening();
                setIsOpen(false);
              }}
              className="text-slate-400 hover:text-white"
              aria-label="Close voice assistant"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 mb-3 min-h-[56px] flex items-center">
            <p className="text-sm font-medium text-indigo-300">
              {feedback ? (
                <span className="text-emerald-400 font-bold">{feedback}</span>
              ) : transcript || interimTranscript ? (
                `"${transcript || interimTranscript}"`
              ) : (
                <span className="text-slate-400 italic">Listening for commands... Speak now</span>
              )}
            </p>
          </div>

          <div className="text-[11px] text-slate-400 space-y-1">
            <p className="font-semibold text-slate-300">Try saying:</p>
            <p className="text-indigo-400">
              • "Simplify text" • "Translate" • "Check this message"
            </p>
            <p className="text-indigo-400">
              • "Document" • "Snap" • "Conversation" • "Settings"
            </p>
          </div>
        </div>
      )}
    </>
  );
}
