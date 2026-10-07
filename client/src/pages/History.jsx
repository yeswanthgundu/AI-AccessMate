import React, { useState, useEffect } from "react";
import {
  History as HistoryIcon,
  Search,
  Trash2,
  ExternalLink,
  Download,
  Filter,
  Sparkles,
  Calendar,
} from "lucide-react";
import { historyService } from "../services/api.js";
import { useAuth } from "../contexts/AuthContext.jsx";

export function History() {
  const { isAuthenticated } = useAuth();
  const [historyItems, setHistoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFeature, setSelectedFeature] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedItem, setExpandedItem] = useState(null);

  useEffect(() => {
    async function fetchHistory() {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }
      try {
        const res = await historyService.getHistory();
        if (res.success) {
          setHistoryItems(res.history || []);
        }
      } catch (err) {
        setError(err.message || "Failed to load history.");
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, [isAuthenticated]);

  const handleDelete = async (id) => {
    try {
      await historyService.deleteItem(id);
      setHistoryItems((prev) => prev.filter((item) => item.id !== id));
      if (expandedItem?.id === id) setExpandedItem(null);
    } catch (err) {
      alert("Failed to delete record: " + err.message);
    }
  };

  const handleExport = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(historyItems, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "accessmate_interaction_history.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const filteredItems = historyItems.filter((item) => {
    const matchesFeature =
      selectedFeature === "all" || item.feature === selectedFeature;
    const matchesSearch =
      item.input_payload.toLowerCase().includes(searchQuery.toLowerCase()) ||
      JSON.stringify(item.output_payload).toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFeature && matchesSearch;
  });

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-400/30 text-indigo-300 text-xs font-semibold mb-2">
            <HistoryIcon className="w-3.5 h-3.5" />
            <span>Interaction Archive & Memory</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            User Interaction History
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Access past simplifications, document checklists, translations, and security audits.
          </p>
        </div>

        {historyItems.length > 0 && (
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
          >
            <Download className="w-4 h-4" />
            <span>Export Archive (JSON)</span>
          </button>
        )}
      </div>

      {!isAuthenticated && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-3">
          <p className="text-base text-slate-300 font-medium">
            You are currently using AI AccessMate as a guest.
          </p>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Sign in to automatically save and securely synchronize your accessibility interactions and checklists.
          </p>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border-2 border-slate-800 card-contrast flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedFeature}
            onChange={(e) => setSelectedFeature(e.target.value)}
            className="p-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-semibold text-white focus:outline-none"
          >
            <option value="all">All Features</option>
            <option value="simplifier">Text Simplifier</option>
            <option value="translator">Translator</option>
            <option value="documents">Document Navigator</option>
            <option value="scam-guard">Scam Guard</option>
            <option value="snap">Snap & Understand</option>
            <option value="lecture">Lecture Helper</option>
            <option value="accessibility-checker">Accessibility Checker</option>
          </select>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search past entries..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none"
          />
        </div>
      </div>

      {/* History List */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading history records...</div>
      ) : filteredItems.length === 0 ? (
        <div className="p-12 rounded-3xl bg-slate-900/50 border-2 border-dashed border-slate-800 text-center">
          <HistoryIcon className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-300">No interaction records found</p>
          <p className="text-xs text-slate-500 mt-1">
            Interactions with the Simplifier, Scam Guard, or Translator will automatically appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-slate-900 border-2 border-slate-800 card-contrast shadow-lg transition hover:border-slate-700 space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="px-2.5 py-1 rounded-md bg-indigo-950 text-indigo-300 text-xs font-mono font-bold uppercase border border-indigo-700/50">
                    {item.feature}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(item.created_at).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setExpandedItem(expandedItem?.id === item.id ? null : item)}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold px-2 py-1"
                  >
                    {expandedItem?.id === item.id ? "Hide Details" : "View Output"}
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    aria-label="Delete history record"
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Input text preview */}
              <div className="text-sm text-slate-200 line-clamp-2">
                <span className="font-semibold text-slate-400">Input: </span>
                {item.input_payload}
              </div>

              {/* Expanded details */}
              {expandedItem?.id === item.id && (
                <div className="mt-3 pt-3 border-t border-slate-800">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    Output Payload Details:
                  </span>
                  <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-300 overflow-x-auto">
                    {JSON.stringify(item.output_payload, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
