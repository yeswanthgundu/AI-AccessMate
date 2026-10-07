import React, { useState } from "react";
import {
  CheckSquare,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Code2,
  FileCode,
} from "lucide-react";
import { aiService } from "../services/api.js";

const SAMPLE_HTML = [
  {
    label: "Form with Missing Labels & No Alt",
    html: `<div class="card">
  <img src="banner.jpg">
  <h1>Welcome to our portal</h1>
  <h1>Another Title Here</h1>
  <p style="color: red">Important notice: Payment due today</p>
  <input type="text" placeholder="Enter full name">
  <button style="background: green">Submit</button>
</div>`,
  },
  {
    label: "Unlabeled Controls & Contrast Issues",
    html: `<form>
  <p style="color: #0f0">Green means approved, Red means rejected</p>
  <input id="user_code">
  <img src="logo.png">
</form>`,
  },
];

export function AccessibilityChecker() {
  const [content, setContent] = useState(SAMPLE_HTML[0].html);
  const [contentType, setContentType] = useState("html");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleAudit = async () => {
    if (!content.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await aiService.accessibilityCheck({
        htmlOrContent: content,
        contentType,
      });

      if (res.success) {
        setResult(res.data);
      } else {
        setError(res.error || "Accessibility audit failed.");
      }
    } catch (err) {
      setError(err.message || "Failed to audit content.");
    } finally {
      setLoading(false);
    }
  };

  const getSeverityBadge = (sev) => {
    switch (sev) {
      case "critical":
        return "bg-rose-950 text-rose-300 border-rose-600";
      case "serious":
        return "bg-orange-950 text-orange-300 border-orange-600";
      case "moderate":
        return "bg-amber-950 text-amber-300 border-amber-600";
      default:
        return "bg-blue-950 text-blue-300 border-blue-600";
    }
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-400/30 text-teal-300 text-xs font-semibold mb-2">
          <CheckSquare className="w-3.5 h-3.5" />
          <span>Creator Accessibility & WCAG Audit Tool</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Accessibility Checker for Creators
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Scan HTML templates, web snippets, and content for missing alt tags, color dependency, heading flaws, and WCAG 2.1 compliance.
        </p>
      </div>

      {/* Input Box */}
      <div className="p-6 rounded-3xl bg-slate-900 border-2 border-slate-800 card-contrast shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label htmlFor="html-input" className="text-sm font-bold text-slate-200">
            Paste HTML or Web Content to Audit:
          </label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Samples:</span>
            {SAMPLE_HTML.map((s, idx) => (
              <button
                key={idx}
                onClick={() => setContent(s.html)}
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-300 transition"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <textarea
          id="html-input"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={7}
          placeholder="Paste HTML tags, forms, images, or markup..."
          className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-800 text-slate-100 font-mono text-xs leading-relaxed focus:outline-none focus:border-teal-500"
        />

        <div className="flex justify-end pt-2">
          <button
            onClick={handleAudit}
            disabled={loading || !content.trim()}
            className="flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-bold rounded-2xl shadow-lg shadow-teal-950 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-400"
          >
            <Sparkles className="w-4 h-4" />
            <span>{loading ? "Running Accessibility Linter..." : "Run WCAG Audit"}</span>
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

      {/* Audit Output Results */}
      {result && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Top Score Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-6 rounded-3xl bg-slate-900 border-2 border-slate-800 card-contrast flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-teal-950 text-teal-400">
                <CheckSquare className="w-8 h-8" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Overall Score
                </span>
                <p className="text-3xl font-extrabold text-white">
                  {result.overallScore} / 100
                </p>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900 border-2 border-slate-800 card-contrast flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-indigo-950 text-indigo-400">
                <FileCode className="w-8 h-8" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  WCAG Level
                </span>
                <p className="text-3xl font-extrabold text-indigo-300">
                  {result.wcagLevel}
                </p>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900 border-2 border-slate-800 card-contrast flex flex-col justify-center">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Audit Summary
              </span>
              <p className="text-xs text-slate-300 leading-normal">{result.summary}</p>
            </div>
          </div>

          {/* Issues Found */}
          <div className="p-6 rounded-3xl bg-slate-900 border-2 border-slate-800 card-contrast shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <span>Detected Accessibility Barriers ({result.issues?.length || 0})</span>
            </h3>

            {result.issues && result.issues.length > 0 ? (
              <div className="space-y-3">
                {result.issues.map((issue, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-300">
                          {issue.element}
                        </span>
                        <span className="text-xs text-slate-400">• {issue.type}</span>
                      </div>
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${getSeverityBadge(
                          issue.severity
                        )}`}
                      >
                        {issue.severity}
                      </span>
                    </div>

                    <p className="text-sm text-slate-200 font-medium">{issue.issue}</p>

                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 text-xs text-teal-300 flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-teal-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-bold text-white">Recommended Fix: </span>
                        <span>{issue.fixSuggestion}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-emerald-400 font-semibold">
                No major accessibility barriers identified!
              </p>
            )}
          </div>

          {/* Passed Checks */}
          {result.passedChecks && result.passedChecks.length > 0 && (
            <div className="p-6 rounded-3xl bg-slate-900 border-2 border-slate-800 card-contrast shadow-xl space-y-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Confirmed Passed Checks</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {result.passedChecks.map((pass, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-center gap-2"
                  >
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>{pass}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="text-xs text-slate-400 text-center">⚠️ {result.disclaimer}</p>
        </div>
      )}
    </div>
  );
}
