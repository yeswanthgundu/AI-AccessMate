import React, { useState } from "react";
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  Copy,
  Share2,
  Sparkles,
  Info,
  ShieldCheck,
  PhoneCall,
  Lock,
} from "lucide-react";
import { aiService } from "../services/api.js";
import { RiskBadge } from "../components/RiskBadge.jsx";
import { ShareModal } from "../components/ShareModal.jsx";

const SAMPLE_SCAMS = [
  {
    label: "Electricity Power Disconnection Scam",
    message: "URGENT: Your Electricity power will be disconnected tonight at 9:30 PM because your previous month bill was not updated. Immediately call our officer at 9876543210 or click http://eb-billpay.xyz/apk",
  },
  {
    label: "Fake Bank KYC Block Threat",
    message: "Dear Customer, Your SBI account is blocked today due to pending PAN card verification. Please click https://bit.ly/sbi-kyc-verify to update immediately or your funds will be frozen.",
  },
  {
    label: "Safe Transaction Alert",
    message: "Your A/C ending with 4321 was debited by INR 450.00 on 07-Oct at Supermarket. Avl Bal: INR 12,400.00. If this was not you, call 1800-111-222.",
  },
];

export function ScamGuard() {
  const [messageText, setMessageText] = useState(SAMPLE_SCAMS[0].message);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  const handleCheck = async () => {
    if (!messageText.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await aiService.scamCheck({
        message: messageText,
      });

      if (res.success) {
        setResult(res.data);
      } else {
        setError(res.error || "Scam check failed.");
      }
    } catch (err) {
      setError(err.message || "Failed to analyze message.");
    } finally {
      setLoading(false);
    }
  };

  const formattedShareMessage = result
    ? `🚨 *AI AccessMate — Fraud & Risk Alert*\n\n*Verdict:* ${result.verdict?.toUpperCase()}\n*Scanned Message:* "${messageText}"\n\n*Why this is risky:*\n${result.reasons?.map((r) => `⚠️ ${r}`).join("\n")}\n\n*What you should do:*\n${result.recommendedActions?.map((a, i) => `${i + 1}. ${a}`).join("\n")}\n\n⚠️ ${result.disclaimer || "AI-generated information may be incorrect. Verify using official sources."}`
    : "";

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-400/30 text-rose-300 text-xs font-semibold mb-2">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Anti-Phishing & Social Engineering Shield</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Scam & Risk Guard
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Detect phishing tricks, fake panic threats, and OTP traps before clicking or sharing personal details.
        </p>
      </div>

      {/* Input Section */}
      <div className="p-6 rounded-3xl bg-slate-900 border-2 border-slate-800 card-contrast shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label htmlFor="scam-text-input" className="text-sm font-bold text-slate-200">
            Paste suspicious SMS, WhatsApp message, or Email:
          </label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Samples:</span>
            {SAMPLE_SCAMS.map((s, idx) => (
              <button
                key={idx}
                onClick={() => setMessageText(s.message)}
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-300 font-medium transition"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <textarea
          id="scam-text-input"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          rows={4}
          placeholder="Paste message text or link here..."
          className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-800 text-slate-100 text-base leading-relaxed focus:outline-none focus:border-rose-500"
        />

        <div className="flex justify-end pt-2">
          <button
            onClick={handleCheck}
            disabled={loading || !messageText.trim()}
            className="flex items-center gap-2 px-6 py-3.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold rounded-2xl shadow-lg shadow-rose-950 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-400"
          >
            <ShieldAlert className="w-5 h-5" />
            <span>{loading ? "Inspecting Security Vectors..." : "Check Message Risk"}</span>
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

      {/* Result Section */}
      {result && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Multi-modal Risk Badge (not color only) */}
          <RiskBadge verdict={result.verdict} />

          {/* Analysis Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Why this is risky */}
            <div className="p-6 rounded-3xl bg-slate-900 border-2 border-slate-800 card-contrast shadow-xl space-y-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <span>Identified Threat Vectors & Red Flags</span>
              </h3>
              <ul className="space-y-2.5">
                {result.reasons?.map((reason, idx) => (
                  <li
                    key={idx}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-sm text-slate-200 flex items-start gap-2.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommended Safe Actions */}
            <div className="p-6 rounded-3xl bg-slate-900 border-2 border-slate-800 card-contrast shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Lock className="w-5 h-5 text-emerald-400" />
                  <span>Recommended Safe Steps</span>
                </h3>
                <button
                  onClick={() => setShareModalOpen(true)}
                  aria-label="Share alert with family on WhatsApp"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950 hover:bg-emerald-900 text-emerald-300 font-semibold text-xs border border-emerald-800 transition"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Alert Family</span>
                </button>
              </div>

              <ul className="space-y-2.5">
                {result.recommendedActions?.map((act, idx) => (
                  <li
                    key={idx}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-sm text-slate-200 flex items-start gap-2.5"
                  >
                    <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span>{act}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Quick Help Contacts Box */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-2 text-slate-300 font-medium">
              <PhoneCall className="w-4 h-4 text-indigo-400" />
              National Cyber Crime Helpline (India): Dial 1930 or visit cybercrime.gov.in
            </span>
            <span>⚠️ {result.disclaimer}</span>
          </div>
        </div>
      )}

      {/* Share Modal */}
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        title="Share Scam Alert with Family via WhatsApp"
        formattedText={formattedShareMessage}
      />
    </div>
  );
}
