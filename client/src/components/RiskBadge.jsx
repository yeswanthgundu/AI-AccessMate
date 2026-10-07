import React from "react";
import { ShieldCheck, AlertTriangle, ShieldAlert, AlertCircle } from "lucide-react";

export function RiskBadge({ verdict, size = "default" }) {
  const normVerdict = (verdict || "safe").toLowerCase();

  const configs = {
    safe: {
      label: "VERIFIED SAFE",
      subLabel: "No malicious patterns or phishing threats detected",
      icon: ShieldCheck,
      bgClass: "bg-emerald-950/80 text-emerald-300 border-2 border-emerald-500 border-solid",
      patternClass: "bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:12px_12px]",
      badgeDot: "bg-emerald-400",
    },
    suspicious: {
      label: "SUSPICIOUS CAUTION",
      subLabel: "Unverified sender, ambiguous links, or mild urgency detected",
      icon: AlertTriangle,
      bgClass: "bg-amber-950/80 text-amber-200 border-2 border-amber-400 border-dashed",
      patternClass: "bg-[repeating-linear-gradient(45deg,#f59e0b22,#f59e0b22_10px,#00000022_10px,#00000022_20px)]",
      badgeDot: "bg-amber-400",
    },
    dangerous: {
      label: "DANGEROUS THREAT",
      subLabel: "Severe risk! Phishing, OTP trap, fake utility or bank spoofing",
      icon: ShieldAlert,
      bgClass: "bg-red-950/90 text-red-200 border-3 border-red-500 border-double",
      patternClass: "bg-[repeating-linear-gradient(-45deg,#ef444433,#ef444433_8px,#00000033_8px,#00000033_16px)]",
      badgeDot: "bg-red-500 animate-ping",
    },
  };

  const cfg = configs[normVerdict] || configs.suspicious;
  const Icon = cfg.icon;

  if (size === "small") {
    return (
      <span
        role="status"
        aria-label={`Security classification: ${cfg.label}`}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${cfg.bgClass}`}
      >
        <Icon className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
        <span>{cfg.label}</span>
      </span>
    );
  }

  return (
    <div
      role="alert"
      aria-label={`Security threat level: ${cfg.label}. ${cfg.subLabel}`}
      className={`rounded-xl p-4 flex items-start gap-4 shadow-xl transition-all ${cfg.bgClass} ${cfg.patternClass}`}
    >
      <div className="relative p-2.5 rounded-lg bg-black/40 border border-white/20 flex-shrink-0">
        <Icon className="w-7 h-7" aria-hidden="true" />
        <span
          className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${cfg.badgeDot}`}
          aria-hidden="true"
        />
      </div>
      <div>
        <div className="flex items-center gap-2">
          <span className="text-base font-extrabold tracking-wide uppercase">
            {cfg.label}
          </span>
          <span className="text-xs px-2 py-0.5 rounded bg-black/50 border border-white/20 font-mono">
            WCAG Multi-Signal
          </span>
        </div>
        <p className="text-sm mt-1 opacity-90">{cfg.subLabel}</p>
      </div>
    </div>
  );
}
