import React, { useState, useRef, useEffect } from "react";
import {
  Camera,
  Upload,
  RefreshCw,
  Sparkles,
  AlertTriangle,
  Volume2,
  Share2,
  FileCheck,
  CheckCircle,
  X,
} from "lucide-react";
import { aiService } from "../services/api.js";
import { ActionChecklist } from "../components/ActionChecklist.jsx";
import { AudioPlayerBar } from "../components/AudioPlayerBar.jsx";
import { ShareModal } from "../components/ShareModal.jsx";
import { useSpeechSynthesis } from "../hooks/useSpeechSynthesis.js";

export function SnapUnderstand() {
  const [mode, setMode] = useState("upload"); // 'upload' or 'camera'
  const [imagePreview, setImagePreview] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [mimeType, setMimeType] = useState("image/jpeg");
  const [userNotes, setUserNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  // Camera video stream
  const videoRef = useRef(null);
  const [streamActive, setStreamActive] = useState(false);
  const streamRef = useRef(null);

  const { isPlaying, isPaused, speak, pause, resume, stop } = useSpeechSynthesis();

  // Start webcam
  const startCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      streamRef.current = stream;
      setStreamActive(true);
    } catch (err) {
      setError("Unable to access camera: " + err.message + ". Please use file upload instead.");
      setMode("upload");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setStreamActive(false);
  };

  useEffect(() => {
    if (mode === "camera") {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [mode]);

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    setImagePreview(dataUrl);
    setImageBase64(dataUrl);
    setMimeType("image/jpeg");
    stopCamera();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMimeType(file.type);
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result);
      setImageBase64(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!imageBase64) return;
    setLoading(true);
    setError(null);
    stop();

    try {
      const res = await aiService.analyzeImage({
        imageBase64,
        mimeType,
        notes: userNotes,
      });

      if (res.success) {
        setResult(res.data);
      } else {
        setError(res.error || "Analysis failed.");
      }
    } catch (err) {
      setError(err.message || "Failed to analyze image snapshot.");
    } finally {
      setLoading(false);
    }
  };

  const formattedShareMessage = result
    ? `📸 *AI AccessMate — Snapshot Analysis*\n\n*${result.title}* (${result.documentType})\n\n*Summary:* ${result.summary}\n\n*Action Items:*\n${result.actionItems?.map((a, i) => `${i + 1}. ${a}`).join("\n")}\n\n⚠️ ${result.disclaimer || "AI-generated information may be incorrect. Verify using official sources."}`
    : "";

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-400/30 text-violet-300 text-xs font-semibold mb-2">
          <Camera className="w-3.5 h-3.5" />
          <span>Multimodal Vision & Document Intelligence</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Snap & Understand (Vision)
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Take a photo or upload physical notices, medicine labels, utility bills, and signboards to extract key facts and next actions.
        </p>
      </div>

      {/* Input Options Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Visual Capture Box */}
        <div className="p-6 rounded-3xl bg-slate-900 border-2 border-slate-800 card-contrast shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-200">Select Input Method:</span>
            <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
              <button
                onClick={() => setMode("upload")}
                aria-pressed={mode === "upload"}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  mode === "upload" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                File Upload
              </button>
              <button
                onClick={() => setMode("camera")}
                aria-pressed={mode === "camera"}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  mode === "camera" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                Live Camera
              </button>
            </div>
          </div>

          {/* Camera View */}
          {mode === "camera" && !imagePreview && (
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden bg-black aspect-video border border-slate-800 flex items-center justify-center">
                <video
                  ref={videoRef}
                  playsInline
                  autoPlay
                  muted
                  className="w-full h-full object-cover"
                />
                {!streamActive && (
                  <p className="text-xs text-slate-400 absolute">Initializing camera sensor...</p>
                )}
              </div>
              <button
                onClick={capturePhoto}
                disabled={!streamActive}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-2xl shadow-lg transition flex items-center justify-center gap-2"
              >
                <Camera className="w-5 h-5" />
                <span>Capture Snapshot</span>
              </button>
            </div>
          )}

          {/* File Upload View */}
          {mode === "upload" && !imagePreview && (
            <label
              htmlFor="image-file-input"
              className="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer bg-slate-950/60 hover:bg-slate-950 transition group"
            >
              <div className="p-3.5 rounded-full bg-slate-900 group-hover:scale-105 transition-transform text-indigo-400">
                <Upload className="w-6 h-6" />
              </div>
              <div className="text-center">
                <span className="text-sm font-bold text-white block">
                  Click to browse or drop an image
                </span>
                <span className="text-xs text-slate-400 mt-1 block">
                  Supports JPG, PNG, WEBP (Forms, bills, medication, notices)
                </span>
              </div>
              <input
                id="image-file-input"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="sr-only"
              />
            </label>
          )}

          {/* Captured / Uploaded Preview */}
          {imagePreview && (
            <div className="relative rounded-2xl overflow-hidden bg-black border border-slate-800">
              <img
                src={imagePreview}
                alt="Uploaded document preview"
                className="w-full max-h-72 object-contain mx-auto"
              />
              <button
                onClick={() => {
                  setImagePreview(null);
                  setImageBase64(null);
                  if (mode === "camera") startCamera();
                }}
                aria-label="Remove image and re-take"
                className="absolute top-3 right-3 p-2 rounded-full bg-black/70 hover:bg-black text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Additional Notes Input */}
          <div>
            <label htmlFor="user-notes-input" className="block text-xs font-semibold text-slate-300 mb-1.5">
              Specific focus (optional):
            </label>
            <input
              id="user-notes-input"
              type="text"
              value={userNotes}
              onChange={(e) => setUserNotes(e.target.value)}
              placeholder="e.g., 'What is the dosage?' or 'When is the bill due?'"
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={loading || !imageBase64}
            className="w-full py-3.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-bold rounded-2xl shadow-lg shadow-violet-950 transition flex items-center justify-center gap-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-400"
          >
            <Sparkles className="w-5 h-5" />
            <span>{loading ? "Analyzing Image with AI..." : "Scan & Extract Actions"}</span>
          </button>
        </div>

        {/* Vision Analysis Output Box */}
        <div className="space-y-6">
          {error && (
            <div
              role="alert"
              className="p-4 rounded-2xl bg-rose-950/80 border-2 border-rose-500 text-rose-200 text-sm font-medium"
            >
              {error}
            </div>
          )}

          {result ? (
            <div className="p-6 rounded-3xl bg-slate-900 border-2 border-slate-800 card-contrast shadow-xl space-y-5 animate-in fade-in duration-200">
              <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-violet-400">
                    {result.documentType}
                  </span>
                  <h2 className="text-xl font-bold text-white mt-0.5">{result.title}</h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => speak(`${result.title}. ${result.summary}`)}
                    aria-label="Listen to summary"
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center gap-1 border border-slate-700"
                  >
                    <Volume2 className="w-4 h-4 text-violet-400" />
                    <span>Listen</span>
                  </button>

                  <button
                    onClick={() => setShareModalOpen(true)}
                    aria-label="Share analysis to WhatsApp"
                    className="p-2 rounded-xl bg-emerald-950 hover:bg-emerald-900 text-emerald-300 text-xs flex items-center gap-1 border border-emerald-800"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share</span>
                  </button>
                </div>
              </div>

              {/* Summary */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide block mb-1">
                  Plain Language Summary:
                </span>
                <p className="text-base text-slate-100 leading-relaxed">{result.summary}</p>
              </div>

              {/* Key Details */}
              {result.keyDetails && result.keyDetails.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                    Extracted Critical Details:
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {result.keyDetails.map((detail, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-xs text-slate-400 block">{detail.label}</span>
                        <span className="text-sm font-semibold text-slate-200 block mt-0.5">
                          {detail.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Warnings */}
              {result.warnings && result.warnings.length > 0 && (
                <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-600/50">
                  <span className="text-xs font-bold uppercase text-amber-300 flex items-center gap-1.5 mb-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Safety & Verification Advisory:</span>
                  </span>
                  <ul className="list-disc list-inside text-xs text-amber-200 space-y-1">
                    {result.warnings.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action items */}
              {result.actionItems && result.actionItems.length > 0 && (
                <ActionChecklist
                  steps={result.actionItems}
                  title="Extracted Action Steps"
                  onReadStep={(s) => speak(s)}
                />
              )}

              {/* Disclaimer */}
              <div className="pt-3 border-t border-slate-900 text-center">
                <p className="text-xs text-slate-400">⚠️ {result.disclaimer}</p>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-3xl bg-slate-900/50 border-2 border-dashed border-slate-800 text-center flex flex-col items-center justify-center min-h-[360px]">
              <Camera className="w-10 h-10 text-slate-600 mb-3" />
              <p className="text-base font-semibold text-slate-300">No snapshot analyzed yet</p>
              <p className="text-xs text-slate-400 max-w-sm mt-1">
                Upload or capture an image of any paper notice, prescription, or signboard to see extracted instructions here.
              </p>
            </div>
          )}
        </div>
      </div>

      {result && (
        <AudioPlayerBar
          isPlaying={isPlaying}
          isPaused={isPaused}
          onPlay={speak}
          onPause={pause}
          onResume={resume}
          onStop={stop}
          textToRead={`${result.title}. ${result.summary}. Action items: ${result.actionItems?.join(". ")}`}
          title="Narrating Snapshot Analysis"
        />
      )}

      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        title="Share Document Snapshot via WhatsApp"
        formattedText={formattedShareMessage}
      />
    </div>
  );
}
