import React, { useState } from "react";
import {
  Sliders,
  Eye,
  Type,
  Volume2,
  Languages,
  Check,
  Sparkles,
  BookOpen,
  HeartHandshake,
  Brain,
  VolumeX,
} from "lucide-react";
import { useAbility, PROFILES } from "../components/AbilityProfileProvider.jsx";
import { useSpeechSynthesis } from "../hooks/useSpeechSynthesis.js";

export function Settings() {
  const {
    currentProfile,
    selectProfile,
    profilesList,
    fontSize,
    setFontSize,
    highContrast,
    setHighContrast,
    speechSpeed,
    setSpeechSpeed,
    preferredLanguage,
    setPreferredLanguage,
    readingRuler,
    setReadingRuler,
  } = useAbility();

  const { speak } = useSpeechSynthesis();
  const [savedNotice, setSavedNotice] = useState(false);

  const profileIcons = {
    Sparkles,
    BookOpen,
    Eye,
    VolumeX,
    Brain,
    HeartHandshake,
  };

  const handleSaveNotice = () => {
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  const testVoiceSample = () => {
    speak(
      `Hello! You are listening to speech synthesis at ${speechSpeed.toFixed(1)} times speed in ${preferredLanguage}.`
    );
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-10">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-400/30 text-indigo-300 text-xs font-semibold mb-2">
          <Sliders className="w-3.5 h-3.5" />
          <span>Personalization Engine</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Accessibility & Ability Settings
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Customize your experience with one-tap ability profiles, typography scaling, voice speeds, and high-contrast visuals.
        </p>
      </div>

      {savedNotice && (
        <div
          role="status"
          className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-500 text-emerald-300 text-sm font-bold flex items-center gap-2 animate-in fade-in"
        >
          <Check className="w-4 h-4" />
          <span>Preferences updated and saved successfully!</span>
        </div>
      )}

      {/* 1. Ability Profiles */}
      <section aria-labelledby="profiles-section-title" className="space-y-4">
        <div>
          <h2 id="profiles-section-title" className="text-xl font-bold text-white">
            1. One-Tap Ability Profiles
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Selecting a profile immediately configures typography, color contrast, and AI response parameters.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {profilesList.map((prof) => {
            const Icon = profileIcons[prof.icon] || Sparkles;
            const isSelected = currentProfile === prof.key;

            return (
              <button
                key={prof.key}
                onClick={() => {
                  selectProfile(prof.key);
                  handleSaveNotice();
                }}
                aria-pressed={isSelected}
                className={`p-5 rounded-2xl border-2 text-left transition-all flex flex-col justify-between card-contrast focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-400 ${
                  isSelected
                    ? "bg-indigo-950/70 border-indigo-500 shadow-xl shadow-indigo-950/50 ring-2 ring-indigo-400"
                    : "bg-slate-900 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`p-2.5 rounded-xl ${
                        isSelected ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-300"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    {isSelected && (
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-indigo-600 text-white">
                        Active
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-white">{prof.name}</h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {prof.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. Visual & Typography Preferences */}
      <section aria-labelledby="visual-section-title" className="space-y-4">
        <div>
          <h2 id="visual-section-title" className="text-xl font-bold text-white">
            2. Typography & Visual Adjustments
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Fine-tune letter sizing, contrast levels, and cognitive reading helpers.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900 border-2 border-slate-800 card-contrast shadow-xl space-y-6">
          {/* Font Size */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <span className="text-sm font-bold text-white flex items-center gap-2">
                <Type className="w-4 h-4 text-indigo-400" />
                <span>Font Scaling</span>
              </span>
              <p className="text-xs text-slate-400 mt-0.5">
                Adjust base text size for comfortable reading.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {[
                { label: "Small", value: "small" },
                { label: "Medium", value: "medium" },
                { label: "Large", value: "large" },
                { label: "Extra Large", value: "x-large" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    setFontSize(opt.value);
                    handleSaveNotice();
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    fontSize === opt.value
                      ? "bg-indigo-600 text-white shadow-md"
                      : "bg-slate-800 text-slate-300 hover:text-white"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* High Contrast Mode */}
          <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <span className="text-sm font-bold text-white flex items-center gap-2">
                <Eye className="w-4 h-4 text-amber-400" />
                <span>High Contrast Display (WCAG AAA)</span>
              </span>
              <p className="text-xs text-slate-400 mt-0.5">
                Maximum contrast black background with vivid bright accents.
              </p>
            </div>

            <button
              onClick={() => {
                setHighContrast(!highContrast);
                handleSaveNotice();
              }}
              aria-pressed={highContrast}
              className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors ${
                highContrast ? "bg-amber-400" : "bg-slate-800"
              }`}
            >
              <div
                className={`bg-slate-950 w-6 h-6 rounded-full shadow-md transform transition-transform ${
                  highContrast ? "translate-x-6 bg-black" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* ADHD Reading Ruler */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <span className="text-sm font-bold text-white flex items-center gap-2">
                <Brain className="w-4 h-4 text-teal-400" />
                <span>ADHD Reading Ruler Overlay</span>
              </span>
              <p className="text-xs text-slate-400 mt-0.5">
                Displays a cursor-following translucent reading guide to prevent line skipping.
              </p>
            </div>

            <button
              onClick={() => {
                setReadingRuler(!readingRuler);
                handleSaveNotice();
              }}
              aria-pressed={readingRuler}
              className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors ${
                readingRuler ? "bg-teal-500" : "bg-slate-800"
              }`}
            >
              <div
                className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform ${
                  readingRuler ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>
      </section>

      {/* 3. Audio & Language Settings */}
      <section aria-labelledby="audio-section-title" className="space-y-4">
        <div>
          <h2 id="audio-section-title" className="text-xl font-bold text-white">
            3. Voice Narration & Regional Language
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure default speech synthesis rate and target regional language.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900 border-2 border-slate-800 card-contrast shadow-xl space-y-6">
          {/* Speech Rate Slider */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <span className="text-sm font-bold text-white flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-indigo-400" />
                <span>Speech Synthesis Speed ({speechSpeed.toFixed(2)}x)</span>
              </span>
              <p className="text-xs text-slate-400 mt-0.5">
                Slower for easier comprehension, faster for quick skimming.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0.6"
                max="1.6"
                step="0.05"
                value={speechSpeed}
                onChange={(e) => {
                  setSpeechSpeed(parseFloat(e.target.value));
                  handleSaveNotice();
                }}
                className="w-36 accent-indigo-500 cursor-pointer"
              />
              <button
                onClick={testVoiceSample}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-indigo-300"
              >
                Test Voice
              </button>
            </div>
          </div>

          {/* Regional Language */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-sm font-bold text-white flex items-center gap-2">
                <Languages className="w-4 h-4 text-emerald-400" />
                <span>Preferred Regional Language</span>
              </span>
              <p className="text-xs text-slate-400 mt-0.5">
                Default language used for translations and glossaries.
              </p>
            </div>

            <select
              value={preferredLanguage}
              onChange={(e) => {
                setPreferredLanguage(e.target.value);
                handleSaveNotice();
              }}
              className="p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm font-semibold text-white focus:outline-none"
            >
              {["English", "Telugu", "Hindi", "Tamil", "Kannada", "Malayalam"].map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>
    </div>
  );
}
