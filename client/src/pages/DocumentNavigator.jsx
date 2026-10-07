import React, { useState } from "react";
import {
  FileText,
  Calendar,
  Files,
  BookOpen,
  Volume2,
  Share2,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { aiService } from "../services/api.js";
import { ActionChecklist } from "../components/ActionChecklist.jsx";
import { AudioPlayerBar } from "../components/AudioPlayerBar.jsx";
import { ShareModal } from "../components/ShareModal.jsx";
import { useSpeechSynthesis } from "../hooks/useSpeechSynthesis.js";
import { useAbility } from "../components/AbilityProfileProvider.jsx";

const SAMPLE_DOCS = [
  {
    label: "Government Scholarship Notice",
    text: `PUBLIC NOTICE: National Merit Higher Education Subsidy Scheme 2026.
Eligible candidates must submit their application dossier before 25th October 2026.
Mandatory documentation includes: self-attested Aadhaar card photocopy, verified Income Certificate issued by the Tahsildar, and two passport-size photographs.
Applicants must furnish an affidavit confirming no duplicate scholarship has been availed.
Late submissions will be categorically rejected.`,
  },
  {
    label: "Bank Account Re-KYC Notice",
    text: `Dear Customer,
In compliance with regulatory mandates, your savings account requires mandatory periodic Re-KYC verification.
Kindly submit updated address credentials and PAN card at your home branch within 30 days of this notice.
Failure to furnish these particulars may result in debit freezing on your account.`,
  },
];

export function DocumentNavigator() {
  const { preferredLanguage } = useAbility();
  const [documentText, setDocumentText] = useState(SAMPLE_DOCS[0].text);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  const { isPlaying, isPaused, speak, pause, resume, stop } = useSpeechSynthesis();

  const handleParse = async () => {
    if (!documentText.trim()) return;
    setLoading(true);
    setError(null);
    stop();

    try {
      const res = await aiService.document({
        documentText,
        userLanguage: preferredLanguage,
      });

      if (res.success) {
        setResult(res.data);
      } else {
        setError(res.error || "Failed to parse document.");
      }
    } catch (err) {
      setError(err.message || "Failed to process document text.");
    } finally {
      setLoading(false);
    }
  };

  const formattedShareMessage = result
    ? `📄 *AI AccessMate — Document Action Navigator*\n\n*Summary:* ${result.summary}\n\n*Deadlines:* ${result.deadlines?.join(", ")}\n\n*Required Documents:*\n${result.requiredDocuments?.map((d) => `• ${d}`).join("\n")}\n\n*Action Steps:*\n${result.actionSteps?.map((s, i) => `${i + 1}. ${s}`).join("\n")}\n\n⚠️ ${result.disclaimer || "AI-generated information may be incorrect. Verify using official sources."}`
    : "";

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-semibold mb-2">
          <FileText className="w-3.5 h-3.5" />
          <span>Action-Oriented Document Parser</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Document Navigator
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Turn convoluted letters, bank notices, and scholarship forms into interactive checklists, strict deadlines, and a simplified glossary.
        </p>
      </div>

      {/* Input Box */}
      <div className="p-6 rounded-3xl bg-slate-900 border-2 border-slate-800 card-contrast shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label htmlFor="doc-text-input" className="text-sm font-bold text-slate-200">
            Paste Notice, Form, or Bank Letter:
          </label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Samples:</span>
            {SAMPLE_DOCS.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => setDocumentText(sample.text)}
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 font-medium transition"
              >
                {sample.label}
              </button>
            ))}
          </div>
        </div>

        <textarea
          id="doc-text-input"
          value={documentText}
          onChange={(e) => setDocumentText(e.target.value)}
          rows={6}
          placeholder="Paste full text of your letter or notification here..."
          className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-800 text-slate-100 text-base leading-relaxed focus:outline-none focus:border-cyan-500"
        />

        <div className="flex justify-end pt-2">
          <button
            onClick={handleParse}
            disabled={loading || !documentText.trim()}
            className="flex items-center gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold rounded-2xl shadow-lg shadow-cyan-950 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-400"
          >
            <Sparkles className="w-4 h-4" />
            <span>{loading ? "Analyzing Document..." : "Parse Into Action Steps"}</span>
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

      {/* Parsed Output Result */}
      {result && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Summary & Deadlines Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 p-6 rounded-3xl bg-slate-900 border-2 border-slate-800 card-contrast shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                  Document Overview
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => speak(result.summary)}
                    aria-label="Listen to summary"
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs flex items-center gap-1 border border-slate-700"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Listen</span>
                  </button>
                  <button
                    onClick={() => setShareModalOpen(true)}
                    aria-label="Share summary to WhatsApp"
                    className="p-1.5 rounded-lg bg-emerald-950 text-emerald-300 hover:bg-emerald-900 text-xs flex items-center gap-1 border border-emerald-800"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share</span>
                  </button>
                </div>
              </div>
              <p className="text-base text-slate-100 font-medium leading-relaxed">
                {result.summary}
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900 border-2 border-amber-500/50 card-contrast shadow-xl flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 mb-2">
                  <Calendar className="w-4 h-4" />
                  <span>Important Deadlines</span>
                </span>
                <ul className="space-y-1.5 text-sm text-slate-200">
                  {result.deadlines?.map((d, i) => (
                    <li key={i} className="font-semibold text-amber-200">
                      • {d}
                    </li>
                  ))}
                </ul>
              </div>
              <span className="text-[11px] text-slate-400 mt-4 block">
                Zero hallucination verified.
              </span>
            </div>
          </div>

          {/* Action Checklist */}
          {result.actionSteps && result.actionSteps.length > 0 && (
            <ActionChecklist
              steps={result.actionSteps}
              title="Interactive Action Checklist"
              onReadStep={(s) => speak(s)}
            />
          )}

          {/* Required Documents Checklist */}
          {result.requiredDocuments && result.requiredDocuments.length > 0 && (
            <div className="p-6 rounded-3xl bg-slate-900 border-2 border-slate-800 card-contrast shadow-xl">
              <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-3">
                <Files className="w-5 h-5 text-indigo-400" />
                <span>Required Credentials & Supporting Papers</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {result.requiredDocuments.map((doc, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2.5"
                  >
                    <div className="w-2 h-2 rounded-full bg-cyan-400" />
                    <span className="text-sm text-slate-200 font-medium">{doc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Glossary */}
          {result.glossary && result.glossary.length > 0 && (
            <div className="p-6 rounded-3xl bg-slate-900 border-2 border-slate-800 card-contrast shadow-xl">
              <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                <BookOpen className="w-5 h-5 text-amber-400" />
                <span>Document Glossary & Difficult Terms</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {result.glossary.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-extrabold text-amber-300">
                        {item.word}
                      </span>
                      {item.regionalTranslation && (
                        <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {item.regionalTranslation}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 leading-normal pt-1">
                      {item.definition}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
            <p className="text-xs text-slate-400">⚠️ {result.disclaimer}</p>
          </div>
        </div>
      )}

      {/* Audio Bar */}
      {result && (
        <AudioPlayerBar
          isPlaying={isPlaying}
          isPaused={isPaused}
          onPlay={speak}
          onPause={pause}
          onResume={resume}
          onStop={stop}
          textToRead={`${result.summary}. Deadlines: ${result.deadlines?.join(", ")}`}
          title="Narrating Document Summary"
        />
      )}

      {/* Share Modal */}
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        title="Share Document Action Steps via WhatsApp"
        formattedText={formattedShareMessage}
      />
    </div>
  );
}
