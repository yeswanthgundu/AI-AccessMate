import React, { useState } from "react";
import { CheckCircle2, Circle, RotateCcw, Volume2, Sparkles } from "lucide-react";

export function ActionChecklist({
  steps = [],
  title = "Interactive Action Checklist",
  onReadStep = null,
}) {
  const [completed, setCompleted] = useState({});

  const toggleStep = (idx) => {
    setCompleted((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const resetAll = () => {
    setCompleted({});
  };

  const completedCount = Object.values(completed).filter(Boolean).length;
  const progressPercent = steps.length > 0 ? Math.round((completedCount / steps.length) * 100) : 0;

  if (!steps || steps.length === 0) return null;

  return (
    <div
      role="region"
      aria-label={title}
      className="p-6 rounded-2xl bg-slate-900 border-2 border-slate-800 card-contrast shadow-xl"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" aria-hidden="true" />
            <span>{title}</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Step-by-step roadmap extracted directly from the verified content.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span
            className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-indigo-950 text-indigo-300 border border-indigo-700/50"
            role="status"
            aria-live="polite"
          >
            {completedCount} / {steps.length} Steps Completed ({progressPercent}%)
          </span>
          {completedCount > 0 && (
            <button
              onClick={resetAll}
              aria-label="Reset checklist progress"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 border border-slate-700 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div
        className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden mb-6"
        role="progressbar"
        aria-valuenow={progressPercent}
        aria-valuemin="0"
        aria-valuemax="100"
      >
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* List */}
      <ul className="space-y-3" role="list">
        {steps.map((step, idx) => {
          const isDone = Boolean(completed[idx]);
          return (
            <li
              key={idx}
              className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                isDone
                  ? "bg-emerald-950/20 border-emerald-800/40 opacity-80"
                  : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
              }`}
            >
              <button
                onClick={() => toggleStep(idx)}
                aria-pressed={isDone}
                aria-label={`Step ${idx + 1}: ${step}. ${isDone ? "Completed" : "Not completed"}`}
                className="flex items-start gap-3.5 text-left flex-1 group focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-400 rounded-lg p-1"
              >
                <div className="pt-0.5 flex-shrink-0">
                  {isDone ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" aria-hidden="true" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-500 group-hover:text-indigo-400" aria-hidden="true" />
                  )}
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                    Step {idx + 1}
                  </span>
                  <span
                    className={`text-sm ${
                      isDone ? "line-through text-slate-400" : "text-slate-100 font-medium"
                    }`}
                  >
                    {step}
                  </span>
                </div>
              </button>

              {onReadStep && (
                <button
                  onClick={() => onReadStep(step)}
                  aria-label={`Listen to step ${idx + 1} aloud`}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex-shrink-0 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-400"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
