import React, { useState } from "react";
import { X, Copy, Check, Share2, MessageCircle } from "lucide-react";

export function ShareModal({
  isOpen,
  onClose,
  title = "Share Accessible Summary",
  formattedText = "",
}) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formattedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      const ta = document.createElement("textarea");
      ta.value = formattedText;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(formattedText)}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        className="w-full max-w-lg bg-slate-900 border-2 border-slate-700 rounded-3xl p-6 shadow-2xl card-contrast relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <MessageCircle className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h2 id="share-modal-title" className="text-lg font-bold text-white">
                {title}
              </h2>
              <p className="text-xs text-slate-400">
                Caregiver & family WhatsApp-friendly formatted text
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close share dialog"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Text Area Preview */}
        <div className="mt-4">
          <label htmlFor="share-preview-text" className="block text-xs font-semibold text-slate-300 mb-2">
            Message Preview (formatted with bullet points and disclaimer):
          </label>
          <textarea
            id="share-preview-text"
            readOnly
            value={formattedText}
            rows={8}
            className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-800 text-slate-200 font-mono text-xs leading-relaxed resize-none focus:outline-none"
          />
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800 transition"
          >
            Cancel
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-sm transition border border-slate-700 shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-400"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Text</span>
              </>
            )}
          </button>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-emerald-900/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-400"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>Open in WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}
