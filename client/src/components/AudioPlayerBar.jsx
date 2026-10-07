import React from "react";
import { Play, Pause, Square, Volume2, FastForward, RotateCcw } from "lucide-react";
import { useAbility } from "./AbilityProfileProvider.jsx";

export function AudioPlayerBar({
  isPlaying,
  isPaused,
  onPlay,
  onPause,
  onResume,
  onStop,
  textToRead = "",
  title = "Audio Narrator",
}) {
  const { speechSpeed, setSpeechSpeed, preferredLanguage } = useAbility();

  if (!textToRead && !isPlaying) return null;

  return (
    <div
      role="region"
      aria-label="Text to speech audio controls"
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:w-[480px] z-40 bg-slate-900/95 border-2 border-indigo-500/50 backdrop-blur-md rounded-2xl p-4 shadow-2xl transition-all"
    >
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-600/30 text-indigo-400">
            <Volume2 className="w-5 h-5 animate-pulse" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide">{title}</h2>
            <p className="text-xs text-slate-400">
              Voice: {preferredLanguage} • Speed: {speechSpeed.toFixed(2)}x
            </p>
          </div>
        </div>

        {/* Visual sound waves for Deaf / Hard of hearing awareness */}
        <div
          aria-hidden="true"
          className="flex items-center gap-1 h-5 px-2 bg-slate-950 rounded-md border border-slate-800"
          title={isPlaying ? "Audio currently generating sound" : "Audio idle"}
        >
          <span
            className={`w-1 bg-indigo-400 rounded-full transition-all ${
              isPlaying ? "h-4 animate-bounce" : "h-1 opacity-40"
            }`}
          />
          <span
            className={`w-1 bg-indigo-400 rounded-full transition-all delay-75 ${
              isPlaying ? "h-3 animate-bounce" : "h-1 opacity-40"
            }`}
          />
          <span
            className={`w-1 bg-indigo-400 rounded-full transition-all delay-150 ${
              isPlaying ? "h-5 animate-bounce" : "h-1 opacity-40"
            }`}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Playback action buttons */}
        <div className="flex items-center gap-2">
          {!isPlaying && !isPaused ? (
            <button
              onClick={() => onPlay(textToRead)}
              aria-label="Play text aloud"
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-indigo-600/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-400"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Listen</span>
            </button>
          ) : isPaused ? (
            <button
              onClick={onResume}
              aria-label="Resume audio"
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-sm transition shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-400"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Resume</span>
            </button>
          ) : (
            <button
              onClick={onPause}
              aria-label="Pause audio playback"
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-xl text-sm transition shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-400"
            >
              <Pause className="w-4 h-4" />
              <span>Pause</span>
            </button>
          )}

          <button
            onClick={onStop}
            disabled={!isPlaying && !isPaused}
            aria-label="Stop audio reading"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition border border-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-400"
          >
            <Square className="w-4 h-4" />
          </button>
        </div>

        {/* Speed Controls */}
        <div className="flex items-center gap-2">
          <label htmlFor="tts-speed" className="text-xs text-slate-300 font-medium">
            Rate:
          </label>
          <input
            id="tts-speed"
            type="range"
            min="0.6"
            max="1.6"
            step="0.1"
            value={speechSpeed}
            onChange={(e) => setSpeechSpeed(parseFloat(e.target.value))}
            aria-label="Adjust voice playback rate"
            className="w-20 accent-indigo-500 cursor-pointer"
          />
          <span className="text-xs font-mono text-indigo-300 min-w-[36px]">
            {speechSpeed.toFixed(1)}x
          </span>
        </div>
      </div>
    </div>
  );
}
