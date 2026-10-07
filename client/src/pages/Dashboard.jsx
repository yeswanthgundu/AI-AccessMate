import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  Languages,
  Camera,
  FileText,
  ShieldAlert,
  BookOpen,
  Headphones,
  CheckSquare,
  Globe,
  Sliders,
  History,
  Volume2,
  CheckCircle2,
  ArrowRight,
  Search,
} from "lucide-react";
import { FeatureCard } from "../components/FeatureCard.jsx";
import { useAbility } from "../components/AbilityProfileProvider.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";

export function Dashboard() {
  const { currentProfile, profileConfig, selectProfile, profilesList } = useAbility();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const features = [
    {
      title: "AI Text Simplifier",
      description: "Convert dense legal, government, or academic text into Grade 3, 6, or 10 reading levels with live readability deltas.",
      to: "/simplifier",
      icon: Sparkles,
      badge: "Multi-Grade",
      badgeColor: "indigo",
      accentColor: "from-indigo-600 to-blue-600",
      category: "reading",
    },
    {
      title: "Regional Translator",
      description: "Translate content into Telugu, Hindi, Tamil, Kannada, Malayalam, and English while preserving cultural context and tone.",
      to: "/translator",
      icon: Languages,
      badge: "6 Languages",
      badgeColor: "emerald",
      accentColor: "from-emerald-600 to-teal-600",
      category: "language",
    },
    {
      title: "Snap & Understand",
      description: "Take a photo or upload notices, medicine labels, utility bills, and signboards to extract key facts and action items.",
      to: "/snap",
      icon: Camera,
      badge: "Vision AI",
      badgeColor: "violet",
      accentColor: "from-purple-600 to-indigo-600",
      category: "vision",
    },
    {
      title: "Document Navigator",
      description: "Parse forms, bank letters, and scholarship notices into interactive action checklists, required documents, and deadlines.",
      to: "/documents",
      icon: FileText,
      badge: "Action Steps",
      badgeColor: "cyan",
      accentColor: "from-cyan-600 to-blue-600",
      category: "reading",
    },
    {
      title: "Scam & Risk Guard",
      description: "Evaluate SMS, email, and WhatsApp messages for phishing, bank spoofing, and OTP fraud with multi-modal safety badges.",
      to: "/scam-guard",
      icon: ShieldAlert,
      badge: "Fraud Defense",
      badgeColor: "rose",
      accentColor: "from-rose-600 to-red-600",
      category: "security",
    },
    {
      title: "Live Conversation Captions",
      description: "Real-time speech transcription with a one-tap simplify action designed specifically for hearing-impaired users.",
      to: "/conversation",
      icon: Headphones,
      badge: "Deaf / HOH",
      badgeColor: "amber",
      accentColor: "from-amber-600 to-orange-600",
      category: "audio",
    },
    {
      title: "Lecture & Video Helper",
      description: "Turn transcripts and classroom notes into summaries, technical term glossaries, and interactive 3-question revision quizzes.",
      to: "/lecture",
      icon: BookOpen,
      badge: "Study Mode",
      badgeColor: "indigo",
      accentColor: "from-blue-600 to-indigo-600",
      category: "study",
    },
    {
      title: "Accessibility Checker",
      description: "Audit HTML code and digital content against WCAG 2.1 AA/AAA rules for missing alt text, poor contrast, and semantic hierarchy.",
      to: "/accessibility-checker",
      icon: CheckSquare,
      badge: "WCAG Linter",
      badgeColor: "emerald",
      accentColor: "from-teal-600 to-emerald-600",
      category: "creator",
    },
  ];

  const filteredFeatures = features.filter((f) =>
    f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      {/* Hero Welcome Banner */}
      <section
        aria-labelledby="dashboard-heading"
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border-2 border-indigo-500/30 p-8 md:p-10 shadow-2xl card-contrast"
      >
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-400/30 text-indigo-300 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Powered Multimodal Inclusion Assistant</span>
          </div>

          <h1
            id="dashboard-heading"
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight"
          >
            Welcome, {user?.name || "Friend"}.
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-300 font-normal leading-relaxed">
            “See it. Understand it. Decide what to do. Hear it. Act on it.”
          </p>
          <p className="mt-1 text-sm text-slate-400">
            Current Ability Mode:{" "}
            <span className="text-amber-300 font-bold capitalize">
              {profileConfig.name}
            </span>{" "}
            — {profileConfig.description}
          </p>
        </div>

        {/* Quick Profile Cards */}
        <div className="mt-8 pt-6 border-t border-slate-800/80">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Switch Ability Profile with 1 Tap:
          </label>
          <div className="flex flex-wrap gap-2.5">
            {profilesList.map((p) => {
              const isSelected = currentProfile === p.key;
              return (
                <button
                  key={p.key}
                  onClick={() => selectProfile(p.key)}
                  aria-pressed={isSelected}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-400 ${
                    isSelected
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 ring-2 ring-indigo-400"
                      : "bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60"
                  }`}
                >
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />}
                  <span>{p.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Search and Filter */}
      <section aria-label="Feature search">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Inclusion & Assistive Tools
            </h2>
            <p className="text-sm text-slate-400">
              Select a specialized assistant below or speak your command hands-free.
            </p>
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter assistive tools..."
              aria-label="Filter assistive tools"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </section>

      {/* Grid of Features */}
      <section aria-label="Accessible features list">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredFeatures.map((feat) => (
            <FeatureCard key={feat.to} {...feat} />
          ))}
        </div>
      </section>

      {/* Compulsory Disclaimer */}
      <footer className="pt-6 border-t border-slate-900">
        <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60 text-center">
          <p className="text-xs text-slate-400 font-medium">
            ⚠️ <span className="font-semibold text-slate-300">Disclaimer:</span> AI-generated information may be incorrect. Verify important information using official or trusted sources.
          </p>
        </div>
      </footer>
    </div>
  );
}
