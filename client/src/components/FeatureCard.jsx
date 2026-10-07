import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export function FeatureCard({
  title,
  description,
  to,
  icon: Icon,
  badge,
  badgeColor = "indigo",
  accentColor = "from-indigo-600 to-violet-600",
}) {
  const badgeClasses = {
    indigo: "bg-indigo-950/80 text-indigo-300 border-indigo-700/50",
    emerald: "bg-emerald-950/80 text-emerald-300 border-emerald-700/50",
    amber: "bg-amber-950/80 text-amber-300 border-amber-700/50",
    rose: "bg-rose-950/80 text-rose-300 border-rose-700/50",
    cyan: "bg-cyan-950/80 text-cyan-300 border-cyan-700/50",
    violet: "bg-violet-950/80 text-violet-300 border-violet-700/50",
  };

  return (
    <Link
      to={to}
      aria-label={`${title} — ${description}`}
      className="group relative flex flex-col justify-between p-6 rounded-2xl bg-slate-900/90 border-2 border-slate-800 hover:border-indigo-500/80 transition-all duration-200 shadow-lg hover:shadow-2xl hover:shadow-indigo-500/10 focus-visible:outline focus-visible:outline-4 focus-visible:outline-yellow-400 card-contrast overflow-hidden"
    >
      {/* Subtle background glow on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div>
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className={`p-3.5 rounded-xl bg-gradient-to-br ${accentColor} text-white shadow-md shadow-indigo-950 flex-shrink-0 group-hover:scale-105 transition-transform`}>
            {Icon && <Icon className="w-6 h-6" aria-hidden="true" />}
          </div>
          {badge && (
            <span
              className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${
                badgeClasses[badgeColor] || badgeClasses.indigo
              }`}
            >
              {badge}
            </span>
          )}
        </div>

        <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors">
          {title}
        </h3>
        <p className="mt-2 text-sm text-slate-300 leading-relaxed">
          {description}
        </p>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-indigo-400 group-hover:text-indigo-300">
        <span>Open Assistant</span>
        <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" aria-hidden="true" />
      </div>
    </Link>
  );
}
